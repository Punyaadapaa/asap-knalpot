// Ambil AQI dari stasiun terdekat (WAQI / aqicn.org).
//
// Kota Yogyakarta tidak punya stasiun pemantau sendiri, jadi nilainya diambil
// dari stasiun BMKG terdekat (WAQI: "Sleman, Indonesia"). Hasilnya ditulis ke
// data/lingkungan.json, yang dibaca backend/src/api.ts.
//
// Jalankan:  WAQI_TOKEN=<token> bun run src/aqi.ts
// atau:      bun run aqi   (kalau WAQI_TOKEN ada di .env)
//
// Hanya bagian "aqi" yang diperbarui; bagian "rth" dibiarkan.
import path from "path";
import type { Lingkungan } from "../../shared/types";

const DATA = path.join(import.meta.dir, "../../data");
const LINGKUNGAN = path.join(DATA, "lingkungan.json");

// Pusat Kota Yogyakarta, untuk menghitung jarak ke stasiun.
const PUSAT = { lat: -7.8014, lng: 110.3745 };

// Samakan dengan legenda di frontend (MapLegend) dan docs/API.md.
export function kategoriAqi(nilai: number): string {
  if (nilai <= 50) return "Baik";
  if (nilai <= 100) return "Sedang";
  if (nilai <= 199) return "Tidak Sehat";
  return "Sangat Tidak Sehat";
}

function jarakKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

type WaqiData = {
  aqi: number | string;
  dominentpol?: string;
  city?: { name?: string; geo?: [number, number] };
  time?: { iso?: string };
  attributions?: { name?: string }[];
};

// Ambil satu bacaan AQI (bentuk siap tulis ke lingkungan.json).
export async function ambilAqi(): Promise<Lingkungan["aqi"]> {
  const token = process.env.WAQI_TOKEN;
  if (!token) throw new Error("WAQI_TOKEN belum di-set (lihat .env.example).");
  const stasiun = process.env.WAQI_STASIUN ?? "yogyakarta";

  const res = await fetch(`https://api.waqi.info/feed/${stasiun}/?token=${token}`);
  const body = (await res.json()) as { status: string; data: WaqiData | string };
  if (body.status !== "ok" || typeof body.data === "string")
    throw new Error(`WAQI gagal: ${JSON.stringify(body.data)}`);

  const d = body.data;
  const nilai = typeof d.aqi === "number" ? d.aqi : Number(d.aqi);
  if (!Number.isFinite(nilai)) throw new Error("WAQI tidak mengirim nilai AQI.");

  const geo = d.city?.geo; // [lat, lng]
  const penyelenggara =
    d.attributions?.find((a) => a.name?.includes("BMKG"))?.name?.split("|")[0]?.trim() ??
    d.attributions?.[0]?.name ??
    "BMKG";

  return {
    nilai,
    kategori: kategoriAqi(nilai),
    polutan_dominan: d.dominentpol ?? "pm25",
    sumber: "stasiun",
    stasiun: {
      nama: d.city?.name ?? stasiun,
      penyelenggara,
      jarak_km: geo ? jarakKm(PUSAT, { lat: geo[0], lng: geo[1] }) : 0,
    },
    diperbarui: d.time?.iso ?? new Date().toISOString(),
  };
}

// Tulis ulang bagian "aqi" di data/lingkungan.json.
export async function refreshLingkungan(): Promise<Lingkungan["aqi"]> {
  const berkas = (await Bun.file(LINGKUNGAN).json()) as Lingkungan;
  const aqi = await ambilAqi();
  berkas.aqi = aqi;
  await Bun.write(LINGKUNGAN, JSON.stringify(berkas, null, 2) + "\n");
  return aqi;
}

if (import.meta.main) {
  const aqi = await refreshLingkungan();
  console.log(
    `AQI diperbarui: ${aqi.nilai} (${aqi.kategori}), ${aqi.polutan_dominan}, ` +
      `${aqi.stasiun.nama} +-${aqi.stasiun.jarak_km} km, ${aqi.diperbarui}`,
  );
}
