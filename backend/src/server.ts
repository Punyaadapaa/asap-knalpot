// HTTP server and all API endpoints (see docs/API.md)
import path from "path";
import { db } from "./db";
import { seed } from "./seed";
import { hitungTriase } from "./triase";
import type {
  BarisDashboard,
  LaporRequest,
  StatusLokasi,
  TitikTren,
  TrenLokasi,
} from "../../shared/types";

const DATA = path.join(import.meta.dir, "../../data");
const HARI = 24 * 60 * 60 * 1000; // one day in milliseconds

// CORS: the Vite dev server runs on a different port, so the browser needs
// these headers. Override with CORS_ORIGIN when the port changes.
const CORS = {
  "Access-Control-Allow-Origin":
    process.env.CORS_ORIGIN ?? "http://localhost:5172",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Device-Id, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Small helpers: JSON response and ISO date string. Every JSON reply carries CORS.
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: CORS });
const iso = (ms: number) => new Date(ms).toISOString();
type Kec = { id: string; nama: string; lat: number; lng: number };

// Load starting data before the server accepts requests
await seed();

// Count reports for one district between two ISO timestamps
function hitungLaporan(kec: string, dari: string, sampai: string): number {
  const row = db
    .query(
      "SELECT COUNT(*) AS n FROM laporan WHERE kecamatan_id = ? AND dibuat_pada >= ? AND dibuat_pada < ?",
    )
    .get(kec, dari, sampai) as { n: number };
  return row.n;
}

// Compare last 7 days with the 7 days before (PRD sections 6.2 and 6.3)
// shortcut: if previous week is 0, percent change is 0 and status is never "naik".
// Undecided in PRD section 11.
function ringkas(kec: string) {
  const now = Date.now();
  const cur = hitungLaporan(kec, iso(now - 7 * HARI), iso(now + 1));
  const prev = hitungLaporan(kec, iso(now - 14 * HARI), iso(now - 7 * HARI));
  const perubahan = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0;
  const naik = cur >= 5 && prev > 0 && cur - prev >= prev * 0.5;
  const status: StatusLokasi =
    cur < 3 ? "tersembunyi" : naik ? "naik" : "normal";
  return { cur, prev, perubahan, status };
}

// Daily counts for the last 7 days (one entry per day, zero if no reports)
// shortcut: days are cut at UTC midnight, not WIB midnight (7 hours off).
function tren(kec: string): TrenLokasi {
  const now = Date.now();
  const rows = db
    .query(
      "SELECT date(dibuat_pada) AS tgl, COUNT(*) AS n FROM laporan WHERE kecamatan_id = ? AND dibuat_pada >= ? GROUP BY tgl",
    )
    .all(kec, iso(now - 7 * HARI)) as { tgl: string; n: number }[];
  const per = new Map(rows.map((r) => [r.tgl, r.n]));
  const periode: TitikTren[] = [];
  for (let i = 6; i >= 0; i--) {
    const tgl = iso(now - i * HARI).slice(0, 10);
    periode.push({ tanggal: tgl, jumlah: per.get(tgl) ?? 0 });
  }
  return { lokasi_id: kec, periode, perubahan_persen: ringkas(kec).perubahan };
}

// Summary row for every district (used by dashboard and CSV)
function dashboard(): BarisDashboard[] {
  const kecs = db
    .query("SELECT id, nama FROM kecamatan ORDER BY nama")
    .all() as { id: string; nama: string }[];
  return kecs.map((k) => {
    const r = ringkas(k.id);
    return {
      lokasi_id: k.id,
      nama: k.nama,
      laporan_7hari: r.cur,
      laporan_7hari_sebelumnya: r.prev,
      perubahan_persen: r.perubahan,
      status: r.status,
    };
  });
}

// Check the Bearer token. If DASHBOARD_TOKEN is not set, nobody gets in (fail closed).
// shortcut: plain string compare, not constant-time. Fine for a demo.
function cekToken(req: Request): boolean {
  const t = process.env.DASHBOARD_TOKEN;
  return !!t && req.headers.get("Authorization") === `Bearer ${t}`;
}

// POST /api/lapor: validate input, run triage, save the report
async function lapor(req: Request): Promise<Response> {
  const deviceId = req.headers.get("X-Device-Id");
  // Bad JSON becomes an empty object, so validation below rejects it
  const {
    lokasi_id,
    gejala,
    durasi_hari,
    kondisi,
    suhu_c,
    durasi_per_gejala,
    kelompok_rentan,
  } = ((await req.json().catch(() => null)) ?? {}) as Partial<LaporRequest>;
  const kodeValid = (
    db.query("SELECT kode FROM gejala WHERE aktif = 1").all() as {
      kode: string;
    }[]
  ).map((r) => r.kode);
  const kecValid = db
    .query("SELECT 1 FROM kecamatan WHERE id = ?")
    .get(lokasi_id ?? "");

  if (
    kondisi !== undefined &&
    !["membaik", "stabil", "memburuk"].includes(kondisi)
  )
    return json({ ok: false, error: "DATA_TIDAK_VALID" }, 400);
  if (
    suhu_c !== undefined &&
    (!Number.isFinite(suhu_c) || suhu_c < 30 || suhu_c > 45)
  )
    return json({ ok: false, error: "DATA_TIDAK_VALID" }, 400);
  if (kelompok_rentan !== undefined && typeof kelompok_rentan !== "boolean")
    return json({ ok: false, error: "DATA_TIDAK_VALID" }, 400);
  if (durasi_per_gejala !== undefined) {
    const entri = Object.entries(durasi_per_gejala);
    const salah =
      typeof durasi_per_gejala !== "object" ||
      durasi_per_gejala === null ||
      entri.some(
        ([k, v]) =>
          !kodeValid.includes(k) || !Number.isInteger(v) || v < 1 || v > 30,
      );
    if (salah) return json({ ok: false, error: "DATA_TIDAK_VALID" }, 400);
  }
  // Reject anything not from the allowed lists or outside the rules
  if (
    !deviceId ||
    !kecValid ||
    !Array.isArray(gejala) ||
    gejala.length === 0 ||
    !gejala.every((g) => kodeValid.includes(g)) ||
    typeof durasi_hari !== "number" ||
    !Number.isInteger(durasi_hari) ||
    durasi_hari < 1 ||
    durasi_hari > 30
  ) {
    return json({ ok: false, error: "DATA_TIDAK_VALID" }, 400);
  }

  // Store a hash of the device ID, never the raw ID
  const hash = new Bun.CryptoHasher("sha256").update(deviceId).digest("hex");
  const triase = hitungTriase({
    gejala,
    durasi_hari,
    kondisi,
    suhu_c,
    durasi_per_gejala,
    kelompok_rentan,
  });

  try {
    db.query(
      "INSERT INTO laporan (kecamatan_id, gejala, durasi_hari, kategori, device_hash, dibuat_pada) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      lokasi_id!,
      JSON.stringify(gejala),
      durasi_hari,
      triase.kategori,
      hash,
      iso(Date.now()),
    );
  } catch (e) {
    // The unique index blocks a second report from the same device today
    if ((e as Error).message.includes("UNIQUE"))
      return json({ ok: false, error: "SUDAH_LAPOR_HARI_INI" }, 429);
    throw e;
  }
  return json({ ok: true, triase });
}

// Main router: sends each URL to the right handler
Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const { pathname } = new URL(req.url);
    try {
      // Browser preflight. Must answer before any route check.
      if (req.method === "OPTIONS")
        return new Response(null, { status: 204, headers: CORS });
      // POST: only /api/lapor is allowed
      if (req.method === "POST" && pathname === "/api/lapor")
        return await lapor(req);
      // Any other method except GET is not found
      if (req.method !== "GET")
        return json({ ok: false, error: "NOT_FOUND" }, 404);

      // Public GET endpoints
      if (pathname === "/api/lokasi") {
        return json(
          db
            .query("SELECT id, nama, lat, lng FROM kecamatan ORDER BY nama")
            .all(),
        );
      }
      if (pathname === "/api/gejala") {
        return json(
          db.query("SELECT kode, label FROM gejala WHERE aktif = 1").all(),
        );
      }
      if (pathname === "/api/lingkungan") {
        // City-level AQI and green space come from a static file
        return json(await Bun.file(path.join(DATA, "lingkungan.json")).json());
      }
      if (pathname === "/api/peta") {
        const kecs = db
          .query("SELECT id, nama, lat, lng FROM kecamatan")
          .all() as Kec[];
        return json(
          kecs.map((k) => {
            const r = ringkas(k.id);
            return {
              lokasi_id: k.id,
              nama: k.nama,
              lat: k.lat,
              lng: k.lng,
              // Hide the count when there are fewer than 3 reports (privacy)
              laporan_7hari: r.cur < 3 ? null : r.cur,
              status: r.status,
            };
          }),
        );
      }

      // /api/lokasi/<id>/tren: the id is taken from the URL
      const m = pathname.match(/^\/api\/lokasi\/([^/]+)\/tren$/);
      if (m) return json(tren(m[1]!));

      // Dashboard endpoints: need the token
      if (pathname === "/api/dashboard" || pathname === "/api/dashboard.csv") {
        if (!cekToken(req))
          return json({ ok: false, error: "UNAUTHORIZED" }, 401);
        const baris = dashboard();
        if (pathname === "/api/dashboard") return json(baris);

        // Build the CSV text by hand: header line, then one line per district
        const csv = [
          "lokasi_id,nama,laporan_7hari,laporan_7hari_sebelumnya,perubahan_persen,status",
          ...baris.map((b) =>
            [
              b.lokasi_id,
              b.nama,
              b.laporan_7hari,
              b.laporan_7hari_sebelumnya,
              b.perubahan_persen,
              b.status,
            ].join(","),
          ),
        ].join("\n");
        return new Response(csv, {
          headers: {
            ...CORS,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="dashboard.csv"',
          },
        });
      }

      // No route matched
      return json({ ok: false, error: "NOT_FOUND" }, 404);
    } catch (e) {
      // Log the real error for us, send a generic message to the client
      console.error(e);
      return json({ ok: false, error: "SERVER_ERROR" }, 500);
    }
  },
});

console.log(`Server jalan di http://localhost:${process.env.PORT ?? 3000}`);
