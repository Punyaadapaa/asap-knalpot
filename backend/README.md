# Backend — Digital Influenza Awareness

API untuk laporan gejala pernapasan per kecamatan Kota Yogyakarta.
Bun + TypeScript + `bun:sqlite`. Tanpa akun, tanpa data pribadi.

- Kontrak API: [`../docs/API.md`](../docs/API.md)
- Tipe bersama FE–BE: [`../shared/types.ts`](../shared/types.ts)

## Menjalankan

Butuh [Bun](https://bun.sh) 1.4 atau lebih baru.

```bash
bun install
cp .env.example .env      # isi WAQI_TOKEN kalau mau data AQI nyata
bun run typecheck
bun run index.ts
```

Server jalan di `http://localhost:3000`. Saat pertama dijalankan, tabel
`kecamatan` dan `gejala` diisi otomatis dari `../data/lokasi.json`.
Entry point `index.ts` memanggil `seed()` lalu menyajikan rute dari `src/api.ts`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `bun run start` | jalankan server |
| `bun run typecheck` | periksa tipe, tanpa menjalankan server |
| `bun run aqi` | ambil AQI terbaru dari stasiun WAQI → `../data/lingkungan.json` |
| `bun run seed:demo` | isi data demo untuk video, ditandai `demo-seed-` |
| `bun run seed:demo -- --hapus` | hapus data demo |
| `bun test` | uji kontrak API (pakai DB sementara di `/tmp`) |

## Konfigurasi

| Env | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | port server |
| `WAQI_TOKEN` | (kosong) | token WAQI/aqicn.org untuk `bun run aqi`. Simpan di `.env` |
| `WAQI_STASIUN` | `yogyakarta` | nama stasiun WAQI (menghasilkan Sleman, BMKG) |
| `DASHBOARD_TOKEN` | (kosong) | kalau di-set, `/api/dashboard*` wajib `Authorization: Bearer <token>` |
| `RATE_LIMIT_PER_MIN` | `30` | batas `POST /api/lapor` per IP per menit |
| `AQI_REFRESH` | `on` | segarkan AQI otomatis saat server start (butuh `WAQI_TOKEN`); `off` untuk mematikan |
| `CORS_ORIGIN` | `http://localhost:5173` | origin frontend Vite yang diizinkan |

## Endpoint

Base path `/api`. Semua respons berbentuk `{ status, data }`. Keterangan
lengkap ada di [`../docs/API.md`](../docs/API.md).

| Method | Path | Akses |
|---|---|---|
| GET | `/api/lokasi` | publik |
| GET | `/api/gejala` | publik |
| POST | `/api/lapor` | publik (header `X-Device-Id` **opsional**) |
| GET | `/api/peta` | publik |
| GET | `/api/lokasi/:id/tren` | publik |
| GET | `/api/dashboard` | token (kalau `DASHBOARD_TOKEN` di-set) |
| GET | `/api/dashboard.csv` | token (idem) |

Tes cepat:

```bash
curl localhost:3000/api/gejala
curl -X POST localhost:3000/api/lapor -H "Content-Type: application/json" -d '{"location_id":"kec-3471003","symptoms":["sesak"],"duration_days":1}'
# kirim X-Device-Id untuk menguji batas 1 laporan/hari:
curl -X POST localhost:3000/api/lapor -H "X-Device-Id: coba1" -H "Content-Type: application/json" -d '{"location_id":"kec-3471003","symptoms":["sesak"],"duration_days":1}'
```

## Struktur

```
backend/
├── index.ts            # entry point: seed() + Bun.serve + route()
├── src/
│   ├── api.ts          # API utama (bentuk { status, data })
│   ├── db.ts           # koneksi dan skema SQLite
│   ├── triase.ts       # aturan gejala -> kategori 1/2/3
│   ├── aqi.ts          # ambil AQI dari stasiun WAQI
│   ├── seed.ts         # isi kecamatan dan daftar gejala
│   ├── seed-demo.ts    # data demo untuk video (opsional)
│   └── api.test.ts     # uji kontrak API (bun test)
└── data/               # database.db (tidak masuk git)
```

## Privasi

Yang disimpan hanya: kecamatan, gejala, durasi, kategori triase, waktu, dan
hash perangkat. Tidak ada nama, NIK, nomor HP, atau koordinat presisi.
`X-Device-Id` (kalau dikirim) di-hash sebelum disimpan dan hanya dipakai untuk
batas satu laporan per perangkat per hari.

## Data dan lisensi

| Data | Sumber |
|---|---|
| Batas kecamatan | `../data/lokasi.json` (14 kecamatan Kota Yogyakarta) |
| AQI | stasiun BMKG terdekat via WAQI/aqicn.org, ±8 km |
| RTH | Pemerintah Kota Yogyakarta, Mar 2026 |
| Peta | OpenStreetMap, atribusi © OpenStreetMap contributors |

## Keterbatasan yang diketahui

- Aturan triase **belum diverifikasi tenaga medis** dan belum dicocokkan dengan pedoman ISPA Kemenkes.
- Form frontend belum mengirim `kondisi`/`durasi_per_gejala`/`kelompok_rentan`, jadi dari UI aturan 5 (kelompok rentan) belum aktif; aturan 1–4 dan 6 jalan (API-nya sudah menerima semua field itu).
- AQI adalah satu nilai untuk seluruh kota, bukan per kecamatan.
