// Entry point. Menyajikan API lewat route() di src/api.ts (bentuk { status, data }).
//
// server.ts tidak lagi dipakai: isinya sudah tercakup di src/api.ts.
// Jalankan: bun run index.ts  (opsional DASHBOARD_TOKEN=... untuk kunci dashboard)
import { CORS, route } from "./src/api";
import { seed } from "./src/seed";

// api.ts membaca data dari DB, tapi tidak mengisinya sendiri.
await seed();

const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    try {
      const res = await route(req, pathname);
      if (res) return res;
      return Response.json(
        { status: "error", message: "Endpoint tidak ditemukan." },
        { status: 404, headers: CORS },
      );
    } catch (e) {
      console.error(e);
      return Response.json(
        { status: "error", message: "Kesalahan server." },
        { status: 500, headers: CORS },
      );
    }
  },
});

console.log(`Server jalan di http://localhost:${port}`);
