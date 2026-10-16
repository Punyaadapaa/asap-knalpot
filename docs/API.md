# Kontrak API

Base path `/api`. Semua respons JSON memakai bentuk amplop:

```
{ "status": "success", "data": ... }      // sukses
{ "status": "error", "message": "..." }   // gagal
```

Tanggal memakai ISO 8601. Endpoint publik: `lokasi`, `gejala`, `lapor`, `peta`,
`lokasi/:id/tren`. Dua endpoint dashboard (`dashboard`, `dashboard.csv`) hanya
meminta token **kalau** env `DASHBOARD_TOKEN` di-set.

---

## Bentuk bersama: `LocationItem`

Dipakai oleh `/api/lokasi`, `/api/lokasi/:id/tren`, `/api/peta` (`locations[]`),
dan `/api/dashboard` (`kecamatan_list[]`).

```
{
  "id": "kec-3471003",
  "nama": "Gondokusuman",
  "kota": "Yogyakarta",
  "latitude": -7.7867439,
  "longitude": 110.3809996,
  "aqi": 95,                      // satu nilai untuk seluruh kota
  "aqi_category": "Sedang",
  "aqi_source": "stasiun",        // "stasiun" | "model" | "contoh"
  "aqi_updated_at": "2026-10-16T19:00:00+07:00",
  "rth_percentage": 23.351,
  "total_reports_7d": 12,         // null jika < 3 (disembunyikan, privasi)
  "previous_reports_7d": 6,
  "change_percent": 100,
  "status": "naik",               // "normal" | "naik" | "data_belum_cukup"
  "privacy_hidden": false,
  "daily_trend": [
    { "date": "2026-10-10", "label": "Sab", "count": 1 }
  ]
}
```

- `total_reports_7d = null` → UI menampilkan "Data belum cukup".
- `aqi_source` **wajib** ditampilkan di UI.
- AQI & RTH adalah **satu nilai untuk seluruh kota** (Kota Yogyakarta tak punya
  stasiun sendiri; nilainya dari stasiun BMKG terdekat via WAQI, ±8 km).

---

## 1. `GET /api/lokasi`

Daftar 14 kecamatan Kota Yogyakarta, tiap-tiap berupa `LocationItem`.

```
{ "status": "success", "data": [ { "id": "kec-3471001", "nama": "Danurejan", ... } ] }
```

## 2. `GET /api/gejala`

Daftar gejala untuk checkbox (bukan isian bebas).

```
{ "status": "success", "data": [
  { "id": "batuk", "nama": "Batuk", "icon": "😷", "is_emergency": false, "sort_order": 1 }
] }
```

## 3. `POST /api/lapor`

Header opsional: `X-Device-Id: <uuid acak>`.

- Kalau dikirim, dipakai untuk batas **1 laporan per perangkat per hari**
  (disimpan sebagai hash; laporan kedua di hari yang sama dibalas `429`).
- Kalau tidak dikirim, tidak ada batas harian (dipakai nilai acak), sehingga
  demo bisa mengirim beberapa laporan dari satu mesin.
- Tidak ada nama, NIK, nomor HP, atau koordinat presisi yang disimpan.

Body:

```
{
  "location_id": "kec-3471003",
  "symptoms": ["batuk", "demam"],
  "duration_days": 4,

  // opsional (PRD 6.4) -- dipakai aturan triase lanjutan:
  "kondisi": "membaik",              // "membaik" | "stabil" | "memburuk"
  "suhu_c": 38.5,                    // 30..45
  "durasi_per_gejala": { "demam": 3 }, // hari per gejala, menimpa duration_days
  "kelompok_rentan": true            // anak / lansia / ibu hamil
}
```

Field wajib: `location_id`, `symptoms`, `duration_days`. Sisanya opsional; kalau
dikirim tapi tidak sah (mis. `suhu_c` 100, `kondisi` di luar daftar, atau
`durasi_per_gejala` memuat kode gejala asing) → `422`. Frontend saat ini belum
mengirim field opsional, jadi UI hanya memicu aturan 1, 2, dan 6.

Respons:

```
200 → { "status": "success", "message": "Laporan gejala berhasil dicatat.",
        "data": {
          "report_id": 12,
          "location": { "id": "kec-3471003", "nama": "Gondokusuman", "kota": "Yogyakarta" },
          "symptoms": ["batuk", "demam"],
          "duration_days": 4,
          "triage": {
            "level": "perlu_pemeriksaan",
            "title": "PERLU PEMERIKSAAN",
            "badge": "🟡 Perlu Pemeriksaan",
            "color": "warning",
            "description": "...",
            "subtext": "Disarankan memeriksakan kondisi ke puskesmas atau rumah sakit.",
            "recommendations": ["..."],
            "actions": [{ "label": "Cari Fasilitas Kesehatan", "type": "modal", "target": "faskes_list", "primary": true }]
          },
          "created_at": "2026-10-16T12:34:56.000Z"
        } }

422 → { "status": "error", "message": "Data laporan tidak valid." }
429 → { "status": "error", "message": "Sudah ada laporan dari perangkat ini hari ini." }
```

`triage.level`: `gawat_darurat` | `perlu_pemeriksaan` | `ringan`
(dari aturan di `backend/src/triase.ts`).

## 4. `GET /api/peta`

Data peta: daftar `LocationItem`, daftar lapisan, dan legenda.

```
{ "status": "success", "data": {
    "locations": [ { "id": "kec-3471003", ... } ],
    "layers": [
      { "id": "gejala", "name": "Laporan Gejala", "description": "..." },
      { "id": "aqi",    "name": "Kualitas Udara (AQI)", "description": "..." },
      { "id": "rth",    "name": "Ruang Hijau (RTH)", "description": "..." }
    ],
    "legend": { "gejala": [ ... ], "aqi": [ ... ], "rth": [ ... ] }
} }
```

## 5. `GET /api/lokasi/:id/tren`

Tren 7 hari satu kecamatan, dikembalikan sebagai satu `LocationItem`
(`daily_trend` berisi 7 titik harian).

```
{ "status": "success", "data": { "id": "kec-3471003", "daily_trend": [ { "date": "2026-10-10", "label": "Sab", "count": 1 } ], ... } }

404 → { "status": "error", "message": "Wilayah tidak ditemukan." }
```

## 6. `GET /api/dashboard`

Ringkasan untuk puskesmas/pengelola.

```
{ "status": "success", "data": {
    "summary": {
      "total_laporan": 24, "wilayah_meningkat": 1,
      "perubahan_mingguan": 33, "area_terpantau": 14
    },
    "trend_chart": [ { "date": "2026-10-10", "label": "Sab, 10 Okt", "count": 3 } ],
    "kecamatan_list": [ { "id": "kec-3471003", ... } ],
    "last_updated": "2026-10-16T12:34:56.000Z"
} }
```

Auth: kalau `DASHBOARD_TOKEN` di-set, wajib `Authorization: Bearer <token>`
(selain itu balas `401`). Kalau kosong, terbuka untuk demo.

## 7. `GET /api/dashboard.csv`

Ekspor tabel dashboard sebagai CSV (`text/csv`, dibaca Excel dengan UTF-8).

---

## Aturan bersama

- Ambang kenaikan: **≥ 5 laporan dalam 7 hari DAN naik ≥ 50%** dibanding 7 hari sebelumnya.
- `total_reports_7d < 3` → disembunyikan (`null`, status `data_belum_cukup`).
- Batas hari memakai **WIB**, bukan UTC.
- AQI & RTH tidak tersedia per kecamatan; keduanya satu angka untuk kota.
- Nilai AQI diambil dari stasiun WAQI (BMKG) lewat `bun run aqi`.
- Rate limit `/api/lapor`: 30 permintaan/menit per IP (env `RATE_LIMIT_PER_MIN`).
