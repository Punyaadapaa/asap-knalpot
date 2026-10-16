// API utama (satu-satunya). Frontend memakai bentuk { status, data }.
//
// Isi: 14 kecamatan Kota Yogyakarta, satu bacaan AQI/RTH level kota
// (stasiun BMKG via WAQI), dan aturan triase repo (backend/src/triase.ts).
// Entry point yang menyajikannya: backend/index.ts.
import path from "path";
import { db } from "./db";
import { hitungTriase } from "./triase";
import type {
  DurasiPerGejala,
  KategoriTriase,
  Kondisi,
  Triase,
} from "../../shared/types";

const DATA = path.join(import.meta.dir, "../../data");
const HARI = 24 * 60 * 60 * 1000;
const WIB = 7 * 60 * 60 * 1000; // batas hari memakai WIB, bukan UTC
const KOTA = "Yogyakarta";

export const CORS = {
  "Access-Control-Allow-Origin":
    process.env.CORS_ORIGIN ?? "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: CORS });

// Rate limit sederhana: per IP, jendela 1 menit, hanya untuk endpoint tulis.
// Default 30/menit (cukup longgar untuk demo). Atur lewat RATE_LIMIT_PER_MIN.
const BATAS_ENV = Number(process.env.RATE_LIMIT_PER_MIN);
const BATAS_TULIS_PER_MENIT =
  Number.isFinite(BATAS_ENV) && BATAS_ENV > 0 ? BATAS_ENV : 30;
const jendela = new Map<string, { n: number; sampai: number }>();

function kenaRateLimit(ip: string): boolean {
  const now = Date.now();
  // Buang entri kedaluwarsa sesekali supaya map tidak tumbuh terus.
  if (jendela.size > 1000)
    for (const [k, v] of jendela) if (now >= v.sampai) jendela.delete(k);

  const j = jendela.get(ip);
  if (!j || now >= j.sampai) {
    jendela.set(ip, { n: 1, sampai: now + 60_000 });
    return false;
  }
  j.n += 1;
  return j.n > BATAS_TULIS_PER_MENIT;
}
const data = (d: unknown) => json({ status: "success", data: d });
const iso = (ms: number) => new Date(ms).toISOString();

type Kec = { id: string; nama: string; lat: number; lng: number };

// Kota Yogyakarta tidak punya stasiun pemantau sendiri, jadi AQI dan RTH hanya
// ada satu nilai untuk seluruh kota. Nilai sama dipakai untuk semua kecamatan.
const lingkungan = (await Bun.file(
  path.join(DATA, "lingkungan.json"),
).json()) as {
  aqi: { nilai: number; kategori: string; sumber: string; diperbarui: string };
  rth: { total_persen: number };
};

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Urutan tampil gejala di form (kode sama dengan backend/src/seed.ts).
const URUTAN_GEJALA = [
  "batuk",
  "sesak",
  "sesak_berat",
  "demam",
  "pilek",
  "sakit_tenggorokan",
  "mata_perih",
  "nyeri_dada",
  "bibir_membiru",
  "batuk_darah",
  "sulit_bicara",
  "kesadaran_turun",
];
// Harus sama dengan DARURAT di backend/src/triase.ts.
const DARURAT = [
  "sesak_berat",
  "nyeri_dada",
  "bibir_membiru",
  "batuk_darah",
  "sulit_bicara",
  "kesadaran_turun",
];

function kecamatan(): Kec[] {
  return db
    .query("SELECT id, nama, lat, lng FROM kecamatan ORDER BY nama")
    .all() as Kec[];
}

function hitung(kec: string, dari: string, sampai: string): number {
  return (
    db
      .query(
        "SELECT COUNT(*) AS n FROM laporan WHERE kecamatan_id = ? AND dibuat_pada >= ? AND dibuat_pada < ?",
      )
      .get(kec, dari, sampai) as { n: number }
  ).n;
}

function hitungSemua(dari: string, sampai: string): number {
  return (
    db
      .query(
        "SELECT COUNT(*) AS n FROM laporan WHERE dibuat_pada >= ? AND dibuat_pada < ?",
      )
      .get(dari, sampai) as { n: number }
  ).n;
}

// Jumlah laporan pada satu tanggal WIB (YYYY-MM-DD).
function hitungTanggal(tgl: string): number {
  return (
    db
      .query(
        "SELECT COUNT(*) AS n FROM laporan WHERE date(dibuat_pada, '+7 hours') = ?",
      )
      .get(tgl) as { n: number }
  ).n;
}

// Satu baris ringkasan per kecamatan, dengan ambang privasi < 3 laporan.
function ringkas(k: Kec) {
  const now = Date.now() + WIB;
  const cur = hitung(k.id, iso(now - 7 * HARI), iso(now + 1));
  const prev = hitung(k.id, iso(now - 14 * HARI), iso(now - 7 * HARI));
  const privasiTersembunyi = cur < 3;
  const perubahan =
    prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;

  // Aturan "naik" sama dengan aturan repo: minimal 5 laporan dan lonjakan >= 50%.
  let status = "normal";
  if (privasiTersembunyi) status = "data_belum_cukup";
  else if (cur >= 5 && prev > 0 && cur - prev >= prev * 0.5) status = "naik";

  // Hitungan harian 7 hari terakhir (digabung per tanggal, seperti repo).
  const rows = db
    .query(
      "SELECT date(dibuat_pada, '+7 hours') AS tgl, COUNT(*) AS n FROM laporan WHERE kecamatan_id = ? AND dibuat_pada >= ? GROUP BY tgl",
    )
    .all(k.id, iso(now - 7 * HARI)) as { tgl: string; n: number }[];
  const perTanggal = new Map(rows.map((r) => [r.tgl, r.n]));
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const t = new Date(now - i * HARI);
    const tanggal = t.toISOString().slice(0, 10);
    daily.push({
      date: tanggal,
      label: NAMA_HARI[t.getUTCDay()],
      count: privasiTersembunyi ? null : (perTanggal.get(tanggal) ?? 0),
    });
  }

  return {
    id: k.id,
    nama: k.nama,
    kota: KOTA,
    latitude: k.lat,
    longitude: k.lng,
    aqi: lingkungan.aqi.nilai,
    aqi_category: lingkungan.aqi.kategori,
    aqi_source: lingkungan.aqi.sumber,
    aqi_updated_at: lingkungan.aqi.diperbarui,
    rth_percentage: lingkungan.rth.total_persen,
    total_reports_7d: privasiTersembunyi ? null : cur,
    previous_reports_7d: privasiTersembunyi ? null : prev,
    change_percent: privasiTersembunyi ? null : perubahan,
    status,
    privacy_hidden: privasiTersembunyi,
    daily_trend: daily,
  };
}

function gejala() {
  const rows = db
    .query("SELECT kode, label FROM gejala WHERE aktif = 1")
    .all() as {
    kode: string;
    label: string;
  }[];
  return rows
    .slice()
    .sort(
      (a, b) => URUTAN_GEJALA.indexOf(a.kode) - URUTAN_GEJALA.indexOf(b.kode),
    )
    .map((g, i) => ({
      id: g.kode,
      nama: g.label,
          is_emergency: DARURAT.includes(g.kode),
      sort_order: i + 1,
    }));
}

// ---- triase: kategori repo (1|2|3) -> bentuk UI teman ----

const LEVEL: Record<KategoriTriase, keyof typeof TRIASE_DETAIL> = {
  1: "gawat_darurat",
  2: "perlu_pemeriksaan",
  3: "ringan",
};

const TRIASE_DETAIL = {
  gawat_darurat: {
    level: "gawat_darurat",
    title: "GAWAT DARURAT",
    badge: "Gawat Darurat",
    color: "danger",
    description:
      "Laporan menunjukkan gejala pernapasan yang membutuhkan penanganan segera.",
    subtext: "Segera ke IGD atau hubungi 119.",
    recommendations: [
      "Segera menuju Instalasi Gawat Darurat (IGD) rumah sakit terdekat",
      "Hubungi layanan darurat 119 untuk bantuan ambulans darurat",
      "Jangan berkendara sendirian jika mengalami sesak napas berat",
    ],
    actions: [
      { label: "Hubungi 119", type: "call", target: "tel:119", primary: true },
      {
        label: "Lihat Petunjuk IGD",
        type: "modal",
        target: "igd_guide",
        primary: false,
      },
    ],
  },
  perlu_pemeriksaan: {
    level: "perlu_pemeriksaan",
    title: "PERLU PEMERIKSAAN",
    badge: "Perlu Pemeriksaan",
    color: "warning",
    description:
      "Laporan menunjukkan gejala pernapasan yang memerlukan evaluasi tenaga medis.",
    subtext: "Disarankan memeriksakan kondisi ke puskesmas atau rumah sakit.",
    recommendations: [
      "Kunjungi Puskesmas atau fasilitas kesehatan terdekat",
      "Gunakan masker medis untuk melindungi orang sekitar",
      "Catat durasi dan perubahan suhu tubuh secara berkala",
    ],
    actions: [
      {
        label: "Cari Fasilitas Kesehatan",
        type: "modal",
        target: "faskes_list",
        primary: true,
      },
      {
        label: "Lihat Kondisi Wilayah",
        type: "navigate",
        target: "peta",
        primary: false,
      },
    ],
  },
  ringan: {
    level: "ringan",
    title: "GEJALA RINGAN",
    badge: "Gejala Ringan",
    color: "success",
    description:
      "Berdasarkan laporan gejala, kamu dapat melakukan perawatan mandiri.",
    subtext: "Jika memburuk dalam 2-3 hari, segera periksakan.",
    recommendations: [
      "Istirahat cukup dan konsumsi cairan hangat",
      "Gunakan masker saat beraktivitas di luar",
      "Hindari area dengan polusi udara tinggi",
    ],
    actions: [
      {
        label: "Lihat Kondisi Wilayah",
        type: "navigate",
        target: "peta",
        primary: true,
      },
    ],
  },
};

function detailTriase(t: Triase) {
  return TRIASE_DETAIL[LEVEL[t.kategori]];
}

// ---- handler ----

async function lapor(req: Request): Promise<Response> {
  const body = ((await req.json().catch(() => null)) ?? {}) as {
    location_id?: string;
    symptoms?: string[];
    duration_days?: number;
    kondisi?: Kondisi;
    suhu_c?: number;
    durasi_per_gejala?: DurasiPerGejala;
    kelompok_rentan?: boolean;
  };

  const kodeValid = (
    db.query("SELECT kode FROM gejala WHERE aktif = 1").all() as {
      kode: string;
    }[]
  ).map((r) => r.kode);
  const kec = body.location_id
    ? (db
        .query("SELECT id, nama FROM kecamatan WHERE id = ?")
        .get(body.location_id) as { id: string; nama: string } | null)
    : null;

  // Field triase opsional (PRD 6.4). Kalau dikirim tapi tidak sah -> 422.
  if (
    body.kondisi !== undefined &&
    !["membaik", "stabil", "memburuk"].includes(body.kondisi)
  )
    return json({ status: "error", message: "Data laporan tidak valid." }, 422);
  if (
    body.suhu_c !== undefined &&
    (!Number.isFinite(body.suhu_c) || body.suhu_c < 30 || body.suhu_c > 45)
  )
    return json({ status: "error", message: "Data laporan tidak valid." }, 422);
  if (
    body.kelompok_rentan !== undefined &&
    typeof body.kelompok_rentan !== "boolean"
  )
    return json({ status: "error", message: "Data laporan tidak valid." }, 422);
  if (body.durasi_per_gejala !== undefined) {
    const salah = Object.entries(body.durasi_per_gejala).some(
      ([k, v]) =>
        !kodeValid.includes(k) || !Number.isInteger(v) || v < 1 || v > 30,
    );
    if (salah)
      return json({ status: "error", message: "Data laporan tidak valid." }, 422);
  }

  if (
    !kec ||
    !Array.isArray(body.symptoms) ||
    body.symptoms.length === 0 ||
    !body.symptoms.every((s) => kodeValid.includes(s)) ||
    typeof body.duration_days !== "number" ||
    !Number.isInteger(body.duration_days) ||
    body.duration_days < 1 ||
    body.duration_days > 30
  ) {
    return json({ status: "error", message: "Data laporan tidak valid." }, 422);
  }

  const triase = hitungTriase({
    gejala: body.symptoms!,
    durasi_hari: body.duration_days!,
    kondisi: body.kondisi,
    suhu_c: body.suhu_c,
    durasi_per_gejala: body.durasi_per_gejala,
    kelompok_rentan: body.kelompok_rentan,
  });

  // Anti-duplikat (PRD 6.1). Kalau perangkat mengirim X-Device-Id, hash-nya
  // dipakai dan laporan kedua di hari yang sama ditolak 429. Kalau tidak
  // (frontend belum mengirimnya), dipakai nilai acak supaya tidak pernah
  // bentrok, sehingga demo tetap bisa mengirim beberapa laporan. Tidak ada
  // identitas asli yang disimpan.
  const deviceId = req.headers.get("X-Device-Id");
  const hash = deviceId
    ? new Bun.CryptoHasher("sha256").update(deviceId).digest("hex")
    : crypto.randomUUID();
  const dibuat = iso(Date.now());

  let reportId: number;
  try {
    const info = db
      .query(
        "INSERT INTO laporan (kecamatan_id, gejala, durasi_hari, kategori, device_hash, dibuat_pada) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        kec.id,
        JSON.stringify(body.symptoms),
        body.duration_days,
        triase.kategori,
        hash,
        dibuat,
      );
    reportId = Number(info.lastInsertRowid);
  } catch (e) {
    if ((e as Error).message.includes("UNIQUE"))
      return json(
        {
          status: "error",
          message: "Sudah ada laporan dari perangkat ini hari ini.",
        },
        429,
      );
    throw e;
  }

  return json({
    status: "success",
    message: "Laporan gejala berhasil dicatat.",
    data: {
      report_id: reportId,
      location: { id: kec.id, nama: kec.nama, kota: KOTA },
      symptoms: body.symptoms,
      duration_days: body.duration_days,
      triage: detailTriase(triase),
      created_at: dibuat,
    },
  });
}

function peta() {
  return {
    locations: kecamatan().map(ringkas),
    layers: [
      {
        id: "gejala",
        name: "Laporan Gejala",
        description: "Sinyal laporan gejala pernapasan komunitas 7 hari",
      },
      {
        id: "aqi",
        name: "Kualitas Udara (AQI)",
        description: "Indeks Standar Pencemar Udara",
      },
      {
        id: "rth",
        name: "Ruang Hijau (RTH)",
        description: "Persentase Ruang Terbuka Hijau perkotaan",
      },
    ],
    legend: {
      gejala: [
        {
          label: "Normal",
          color: "#10b981",
          status: "normal",
          desc: "Laporan relatif stabil",
        },
        {
          label: "Laporan Meningkat",
          color: "#f59e0b",
          status: "naik",
          desc: "Laporan mengalami kenaikan",
        },
        {
          label: "Data Belum Cukup",
          color: "#94a3b8",
          status: "data_belum_cukup",
          desc: "Kurang dari 3 laporan, disembunyikan untuk privasi",
        },
      ],
      aqi: [
        { label: "Baik (0–50)", color: "#10b981" },
        { label: "Sedang (51–100)", color: "#f59e0b" },
        { label: "Tidak Sehat (101–199)", color: "#ef4444" },
        { label: "Sangat Tidak Sehat (200+)", color: "#8b5cf6" },
      ],
      rth: [
        { label: "Kerapatan Tinggi (≥ 20%)", color: "#059669" },
        { label: "Kerapatan Sedang (15–19.9%)", color: "#10b981" },
        { label: "Kerapatan Rendah (< 15%)", color: "#fbbf24" },
      ],
    },
  };
}

function dashboard() {
  const now = Date.now() + WIB;
  const cur = hitungSemua(iso(now - 7 * HARI), iso(now + 1));
  const prev = hitungSemua(iso(now - 14 * HARI), iso(now - 7 * HARI));
  const daftar = kecamatan().map(ringkas);

  const grafik = [];
  for (let i = 6; i >= 0; i--) {
    const t = new Date(now - i * HARI);
    const tanggal = t.toISOString().slice(0, 10);
    grafik.push({
      date: tanggal,
      label: `${NAMA_HARI[t.getUTCDay()]}, ${t.getUTCDate()} ${NAMA_BULAN[t.getUTCMonth()]}`,
      count: hitungTanggal(tanggal),
    });
  }

  return {
    summary: {
      total_laporan: cur,
      wilayah_meningkat: daftar.filter((l) => l.status === "naik").length,
      perubahan_mingguan:
        prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0,
      area_terpantau: daftar.length,
    },
    trend_chart: grafik,
    kecamatan_list: daftar,
    last_updated: iso(Date.now()),
  };
}

function csv(): Response {
  const baris = kecamatan().map(ringkas);
  const lines: string[][] = [
    [
      "ID Wilayah",
      "Kecamatan",
      "Kota",
      "Status Sinyal",
      "Total Laporan 7 Hari",
      "Perubahan (%)",
      "AQI",
      "Kategori AQI",
      "Sumber AQI",
      "RTH (%)",
      "Catatan Privasi",
    ],
  ];
  for (const l of baris) {
    lines.push([
      l.id,
      l.nama,
      l.kota,
      l.status.toUpperCase(),
      l.privacy_hidden ? "< 3 (Privasi)" : String(l.total_reports_7d),
      l.privacy_hidden
        ? "-"
        : `${Number(l.change_percent) > 0 ? "+" : ""}${l.change_percent}%`,
      String(l.aqi),
      l.aqi_category,
      l.aqi_source,
      `${l.rth_percentage}%`,
      l.privacy_hidden
        ? "Disembunyikan karena laporan < 3"
        : "Data mencukupi ambang privasi",
    ]);
  }
  // BOM di depan supaya Excel membaca UTF-8.
  const body =
    "\uFEFF" + lines.map((r) => r.map((c) => `"${c}"`).join(",")).join("\r\n");
  return new Response(body, {
    headers: {
      ...CORS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="influenza_aware_dashboard.csv"',
    },
  });
}

// Mengembalikan Response kalau rute dikenali, null kalau tidak.
export async function route(
  req: Request,
  pathname: string,
): Promise<Response | null> {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });
  if (req.method === "POST") {
    if (pathname !== "/api/lapor") return null;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
    if (kenaRateLimit(ip))
      return json(
        {
          status: "error",
          message: "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
        },
        429,
      );
    return lapor(req);
  }
  if (req.method !== "GET") return null;

  if (pathname === "/api/lokasi") return data(kecamatan().map(ringkas));
  if (pathname === "/api/gejala") return data(gejala());
  if (pathname === "/api/peta") return data(peta());

  // Dashboard: token wajib hanya kalau DASHBOARD_TOKEN di-set. Demo tanpa
  // token tetap jalan; kalau di-set, wajib Authorization: Bearer <token>.
  if (pathname.startsWith("/api/dashboard")) {
    const t = process.env.DASHBOARD_TOKEN;
    if (t && req.headers.get("Authorization") !== `Bearer ${t}`)
      return json({ status: "error", message: "Unauthorized." }, 401);
    if (pathname === "/api/dashboard") return data(dashboard());
    return csv();
  }

  const m = pathname.match(/^\/api\/lokasi\/([^/]+)\/tren$/);
  if (m) {
    const kec = kecamatan().find((k) => k.id === decodeURIComponent(m[1]!));
    if (!kec)
      return json(
        { status: "error", message: "Wilayah tidak ditemukan." },
        404,
      );
    return data(ringkas(kec));
  }

  return null;
}
