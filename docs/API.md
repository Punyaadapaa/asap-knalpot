# Kontrak API

Base path: `/api`. Semua respons JSON. Tanggal memakai format ISO 8601.

---

## 1. `GET /api/lokasi`

Daftar 14 kecamatan Kota Yogyakarta beserta koordinat pusatnya.
Sumber: `data/lokasi.json`.

```
[
  { "id": "kec-3471001", "nama": "Danurejan",    "lat": -7.7931435, "lng": 110.3717869 },
  { "id": "kec-3471003", "nama": "Gondokusuman", "lat": -7.7867439, "lng": 110.3809996 }
]
```

---

## 2. `GET /api/gejala`

Daftar gejala untuk dipilih pengguna (checkbox, bukan isian bebas).

```
[
  { "kode": "batuk",  "label": "Batuk" },
  { "kode": "sesak",  "label": "Sesak napas" },
  { "kode": "demam",  "label": "Demam" }
]
```

---

## 3. `POST /api/lapor`

Header: `X-Device-Id: <uuid acak>` (dipakai untuk batas 1 laporan per perangkat
per hari; disimpan sebagai hash, tanpa identitas).

Body:

```
{ "lokasi_id": "kec-3471003", "gejala": ["batuk", "demam"], "durasi_hari": 2 }
```

Respons:

```
200 → { "ok": true,
        "triase": { "kategori": 2, "pesan": "...", "saran": ["Istirahat", "Pakai masker"] } }

429 → { "ok": false, "error": "SUDAH_LAPOR_HARI_INI" }
400 → { "ok": false, "error": "DATA_TIDAK_VALID" }
```

Kode kategori triase: `1` gawat darurat, `2` perlu pemeriksaan, `3` ringan.

---

## 4. `GET /api/peta`

Data **gejala per kecamatan** untuk peta. Hanya lapisan gejala; AQI & RTH
tidak di sini karena keduanya hanya tersedia di level kota (lihat endpoint 5).

```
[
  { "lokasi_id": "kec-3471003",
    "nama": "Gondokusuman",
    "lat": -7.7867439,
    "lng": 110.3809996,
    "laporan_7hari": 12,
    "status": "naik" }
]
```

- `laporan_7hari` bernilai `null` jika jumlah laporan < 3 (disembunyikan, alasan privasi).
- `status`: `"normal"` | `"naik"` | `"tersembunyi"`.

---

## 5. `GET /api/lingkungan`

Kualitas udara (AQI) dan ruang hijau (RTH) untuk **seluruh kota** — satu nilai,
bukan per kecamatan. Sumber: `data/lingkungan.json`.

```
{
  "aqi": {
    "nilai": 124,
    "kategori": "Tidak Sehat untuk Kelompok Sensitif",
    "polutan_dominan": "pm2.5",
    "sumber": "stasiun",
    "stasiun": { "nama": "Sleman, Indonesia", "penyelenggara": "BMKG", "jarak_km": 7 },
    "diperbarui": "2026-10-13T21:00:00+07:00"
  },
  "rth": {
    "total_persen": 23.351,
    "publik_persen": 8.063,
    "privat_persen": 15.288,
    "target_uu_persen": 30,
    "sumber": "Pemerintah Kota Yogyakarta, Mar 2026"
  }
}
```

- `aqi.sumber`: `"stasiun"` | `"model"` | `"contoh"` — wajib ditampilkan di UI.
- Kota Yogyakarta tidak memiliki stasiun pemantau sendiri; nilai diambil dari
  stasiun terdekat di Sleman (±7 km).

---

## 6. `GET /api/lokasi/:id/tren`

Tren laporan harian satu kecamatan.

```
{ "lokasi_id": "kec-3471003",
  "periode": [ { "tanggal": "2026-10-08", "jumlah": 1 } ],
  "perubahan_persen": 60 }
```

---

## 7. `GET /api/dashboard`

Ringkasan per kecamatan untuk dashboard pengelola/puskesmas.

```
[
  { "lokasi_id": "kec-3471003",
    "nama": "Gondokusuman",
    "laporan_7hari": 12,
    "laporan_7hari_sebelumnya": 6,
    "perubahan_persen": 100,
    "status": "naik" }
]
```

---

## 8. `GET /api/dashboard.csv`

Ekspor tabel dashboard sebagai CSV, kolom sama dengan endpoint 7.

---

## Aturan bersama

- `laporan_7hari = null` → UI menampilkan "Data belum cukup".
- `aqi.sumber` wajib ditampilkan di UI.
- Tanggal memakai format ISO 8601.
- AQI & RTH **tidak** tersedia per kecamatan; keduanya satu angka untuk kota.
- Ambang kenaikan: ≥5 laporan dalam 7 hari **dan** naik ≥50% dibanding 7 hari sebelumnya.
