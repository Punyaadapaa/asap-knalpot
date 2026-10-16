# Backend — Digital Influenza Awareness

API untuk laporan gejala pernapasan per kecamatan Kota Yogyakarta.
Bun + TypeScript + `bun:sqlite`. Tanpa akun, tanpa data pribadi.

- Kontrak API: [`../docs/API.md`](../docs/API.md)
- Tipe bersama FE–BE: [`../shared/types.ts`](../shared/types.ts)

## Menjalankan

Butuh [Bun](https://bun.sh) 1.4 atau lebih baru.

```bash
bun install
bun run typecheck
bun run index.ts
```

Server jalan di `http://localhost:3000`. Saat pertama dijalankan, tabel
`kecamatan` dan `gejala` diisi otomatis dari `../data/lokasi.json`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `bun run start` | jalankan server |
| `bun run typecheck` | periksa tipe, tanpa menjalankan server |
| `bun run seed:demo` | isi data demo untuk video, ditandai `demo-seed-` |
| `bun run seed:demo -- --hapus` | hapus data demo |

## Konfigurasi

| Env | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | port server |
| `DASHBOARD_TOKEN` | (kosong) | token dashboard. Kalau kosong, semua permintaan dashboard ditolak |
| `CORS_ORIGIN` | `http://localhost:5172` | origin frontend Vite yang diizinkan |

Contoh untuk demo:

```bash
DASHBOARD_TOKEN=rahasia123 bun run index.ts
```

## Endpoint

Base path `/api`. Keterangan lengkap ada di `../docs/API.md`.

| Method | Path | Akses |
|---|---|---|
| GET | `/api/lokasi` | publik |
| GET | `/api/gejala` | publik |
| POST | `/api/lapor` | publik + header `X-Device-Id` |
| GET | `/api/peta` | publik |
| GET | `/api/lingkungan` | publik |
| GET | `/api/lokasi/:id/tren` | publik |
| GET | `/api/dashboard` | Bearer `DASHBOARD_TOKEN` |
| GET | `/api/dashboard.csv` | Bearer `DASHBOARD_TOKEN` |

Tes cepat:

```bash
curl localhost:3000/api/gejala
curl -X POST localhost:3000/api/lapor -H "X-Device-Id: coba1" -H "Content-Type: application/json" -d '{"lokasi_id":"kec-3471003","gejala":["sesak"],"durasi_hari":1}'
```

## Struktur

```
backend/
├── index.ts            # entry point, memanggil src/server
├── src/
│   ├── server.ts       # routing semua endpoint
│   ├── db.ts           # koneksi dan skema SQLite
│   ├── triase.ts       # aturan gejala -> kategori 1/2/3
│   ├── seed.ts         # isi kecamatan dan daftar gejala
│   └── seed-demo.ts    # data demo untuk video (opsional)
└── data/               # database.db (tidak masuk git)
```

## Privasi

Yang disimpan hanya: kecamatan, gejala, durasi, kategori triase, waktu, dan
hash perangkat. Tidak ada nama, NIK, nomor HP, atau koordinat presisi.
`X-Device-Id` di-hash sebelum disimpan, dan hanya dipakai untuk batas satu
laporan per perangkat per hari.

## Data dan lisensi

| Data | Sumber |
|---|---|
| Batas kecamatan | `../data/lokasi.json` (14 kecamatan Kota Yogyakarta) |
| AQI | stasiun terdekat di Sleman (BMKG via WAQI), ±7 km |
| RTH | Pemerintah Kota Yogyakarta, Mar 2026 |
| Peta | OpenStreetMap, atribusi © OpenStreetMap contributors |

## Catatan penggunaan AI

Sesuai guidebook lomba (bagian Persyaratan Umum poin 7), penggunaan AI
dicatat terbuka di sini.

| Tool | Peran | Bagian |
|---|---|---|
| pi (agent CLI + LLM) | menulis dan merapikan kode backend, menyusun dokumentasi, memeriksa kesesuaian kode dengan `docs/API.md` | `server.ts`, `db.ts`, `triase.ts`, `seed.ts`, `seed-demo.ts`, `docs/API.md`, README |

Pembagian peran: keputusan desain (aturan triase, ambang kenaikan, aturan
privasi, skema database) ditentukan oleh tim. AI menyusun kode dari keputusan
tersebut. Setiap hasil AI dijalankan dan diuji manual oleh tim (`curl` ke
setiap endpoint, plus pemeriksaan `bun run typecheck`).

## Keterbatasan yang diketahui

- Aturan triase **belum diverifikasi tenaga medis** dan belum dicocokkan dengan pedoman ISPA Kemenkes.
- Batas hari pada anti-duplikat memakai tanggal UTC, sehingga bergeser 07:00 WIB.
- "Demam tanpa jeda" belum didukung, karena hanya ada satu angka `suhu_c` per laporan.
- Belum ada rate limit pada endpoint publik.
- AQI adalah satu nilai untuk seluruh kota, bukan per kecamatan.
