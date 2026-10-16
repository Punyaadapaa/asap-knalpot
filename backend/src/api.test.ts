// Uji kontrak API lewat route() langsung (tanpa jaringan), memakai DB sementara.
// Jalankan: bun test
import { afterAll, expect, test } from "bun:test";
import { rmSync } from "fs";
import path from "path";

const TMP = path.join("/tmp/opencode", `api-test-${Date.now()}.db`);
process.env.DB_PATH = TMP;
process.env.AQI_REFRESH = "off";
delete process.env.WAQI_TOKEN;
delete process.env.DASHBOARD_TOKEN;
delete process.env.RATE_LIMIT_PER_MIN;

const { route } = await import("./api");
const { seed } = await import("./seed");
await seed();

const LOKASI = "kec-3471003";

function panggil(
  method: string,
  url: string,
  opts: { body?: unknown; headers?: Record<string, string> } = {},
): Promise<Response | null> {
  const pathname = new URL(url, "http://lokal").pathname;
  const req = new Request(`http://lokal${url}`, {
    method,
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  return route(req, pathname);
}

async function kirimLapor(
  body: unknown,
  headers?: Record<string, string>,
): Promise<{ status: number; json: any }> {
  const res = (await panggil("POST", "/api/lapor", { body, headers }))!;
  return { status: res.status, json: await res.json() };
}

afterAll(() => {
  try {
    rmSync(TMP, { force: true });
  } catch {
    // abaikan
  }
});

test("GET /api/lokasi -> amplop {status,data}, 14 kecamatan", async () => {
  const res = (await panggil("GET", "/api/lokasi"))!;
  expect(res.status).toBe(200);
  const b = (await res.json()) as any;
  expect(b.status).toBe("success");
  expect(b.data).toHaveLength(14);
  expect(b.data[0]).toHaveProperty("aqi_category");
  expect(b.data[0].daily_trend).toHaveLength(7);
});

test("GET /api/gejala -> ada batuk", async () => {
  const res = (await panggil("GET", "/api/gejala"))!;
  const b = (await res.json()) as any;
  expect(b.status).toBe("success");
  expect(b.data.some((g: any) => g.id === "batuk")).toBe(true);
});

test("POST /api/lapor valid -> 200 + triase", async () => {
  const { status, json } = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["batuk"],
    duration_days: 2,
  });
  expect(status).toBe(200);
  expect(json.status).toBe("success");
  expect(json.data.report_id).toBeGreaterThan(0);
  expect(json.data.triage.level).toBe("ringan");
});

test("triase: gejala darurat -> gawat_darurat", async () => {
  const { json } = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["sesak_berat"],
    duration_days: 1,
  });
  expect(json.data.triage.level).toBe("gawat_darurat");
});

test("triase: demam 3 hari -> perlu_pemeriksaan", async () => {
  const { json } = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["demam"],
    duration_days: 3,
  });
  expect(json.data.triage.level).toBe("perlu_pemeriksaan");
});

test("triase: batuk 4 hari + kondisi membaik -> ringan", async () => {
  const { json } = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["batuk"],
    duration_days: 4,
    kondisi: "membaik",
  });
  expect(json.data.triage.level).toBe("ringan");
});

test("triase: kelompok rentan -> perlu_pemeriksaan", async () => {
  const { json } = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["batuk"],
    duration_days: 1,
    kelompok_rentan: true,
  });
  expect(json.data.triage.level).toBe("perlu_pemeriksaan");
});

test("POST tidak valid -> 422", async () => {
  const a = await kirimLapor({ location_id: LOKASI, symptoms: [], duration_days: 2 });
  expect(a.status).toBe(422);
  expect(a.json.status).toBe("error");

  const b = await kirimLapor({
    location_id: LOKASI,
    symptoms: ["batuk"],
    duration_days: 2,
    durasi_per_gejala: { bukan_gejala: 3 },
  });
  expect(b.status).toBe(422);
});

test("X-Device-Id sama, hari sama -> laporan kedua 429", async () => {
  const body = { location_id: LOKASI, symptoms: ["batuk"], duration_days: 1 };
  const pertama = await kirimLapor(body, { "X-Device-Id": "uji-perangkat" });
  expect(pertama.status).toBe(200);
  const kedua = await kirimLapor(body, { "X-Device-Id": "uji-perangkat" });
  expect(kedua.status).toBe(429);
});

test("GET /api/lokasi/:id/tren -> daily_trend 7 titik; id salah -> 404", async () => {
  const ok = (await panggil("GET", `/api/lokasi/${LOKASI}/tren`))!;
  expect(ok.status).toBe(200);
  expect(((await ok.json()) as any).data.daily_trend).toHaveLength(7);

  const no = (await panggil("GET", "/api/lokasi/kec-tidak-ada/tren"))!;
  expect(no.status).toBe(404);
});

test("GET /api/peta -> 14 lokasi + legenda", async () => {
  const res = (await panggil("GET", "/api/peta"))!;
  const b = (await res.json()) as any;
  expect(b.status).toBe("success");
  expect(b.data.locations).toHaveLength(14);
  expect(b.data).toHaveProperty("legend");
});

test("GET /api/dashboard tanpa token -> 200", async () => {
  const res = (await panggil("GET", "/api/dashboard"))!;
  expect(res.status).toBe(200);
  const b = (await res.json()) as any;
  expect(b.status).toBe("success");
  expect(b.data).toHaveProperty("summary");
});

test("path tak dikenal -> route() mengembalikan null", async () => {
  const res = await panggil("GET", "/api/tidak-ada");
  expect(res).toBeNull();
});
