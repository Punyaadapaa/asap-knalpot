// HTTP server. Semua rute ada di api.ts (bentuk yang dipakai frontend/).
import { CORS, route } from "./api";
import { seed } from "./seed";

// Load starting data before the server accepts requests
await seed();

Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const { pathname } = new URL(req.url);
    try {
      const res = await route(req, pathname);
      if (res) return res;
      return Response.json(
        { status: "error", message: "Rute tidak ditemukan." },
        { status: 404, headers: CORS },
      );
    } catch (e) {
      // Log the real error for us, send a generic message to the client
      console.error(e);
      return Response.json(
        { status: "error", message: "Kesalahan server." },
        { status: 500, headers: CORS },
      );
    }
  },
});

console.log(`Server jalan di http://localhost:${process.env.PORT ?? 3000}`);
