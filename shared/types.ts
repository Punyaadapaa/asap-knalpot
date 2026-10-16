// Lokasi

export interface Lokasi {
  id: string;
  nama: string;
  lat: number;
  lng: number;
}

// Gejala

export interface Gejala {
  kode: string;
  label: string;
}

// Lapor

export type KategoriTriase = 1 | 2 | 3; // 1 darurat, 2 perlu pemeriksaan, 3 ringan

export interface Triase {
  kategori: KategoriTriase;
  pesan: string;
  saran: string[];
  catatan: string; // required disclaimer, shown in the UI
}

export type Kondisi = "membaik" | "stabil" | "memburuk";

// Optional per-symptom duration in days. Falls back to durasi_hari when absent.
export type DurasiPerGejala = Record<string, number>;

export interface LaporRequest {
  lokasi_id: string;
  gejala: string[];
  durasi_hari: number;
  kondisi?: Kondisi; // optional: old clients still work
  suhu_c?: number;
  durasi_per_gejala?: DurasiPerGejala; // per-symptom days, overrides durasi_hari
  kelompok_rentan?: boolean; // anak, lansia, ibu hamil
}

export interface LaporResponse {
  ok: true;
  triase: Triase;
}

export type LaporError =
  | { ok: false; error: "SUDAH_LAPOR_HARI_INI" }
  | { ok: false; error: "DATA_TIDAK_VALID" };

// Peta

export type StatusLokasi = "normal" | "naik" | "tersembunyi";

export interface TitikPeta {
  lokasi_id: string;
  nama: string;
  lat: number;
  lng: number;
  /** null jika < 3 laporan (disembunyikan) */
  laporan_7hari: number | null;
  status: StatusLokasi;
}

// Lingkungan (level kota, satu nilai)

export type SumberAqi = "stasiun" | "model" | "contoh";

export interface StasiunAqi {
  nama: string;
  penyelenggara: string;
  jarak_km: number;
}

export interface Aqi {
  nilai: number;
  kategori: string;
  polutan_dominan: string;
  sumber: SumberAqi;
  stasiun: StasiunAqi;
  /** ISO 8601 */
  diperbarui: string;
}

export interface Rth {
  total_persen: number;
  publik_persen: number;
  privat_persen: number;
  target_uu_persen: number;
  sumber: string;
}

export interface Lingkungan {
  aqi: Aqi;
  rth: Rth;
}

// Tren

export interface TitikTren {
  /** ISO 8601, format YYYY-MM-DD */
  tanggal: string;
  jumlah: number;
}

export interface TrenLokasi {
  lokasi_id: string;
  periode: TitikTren[];
  perubahan_persen: number;
}

// Dashboard

export interface BarisDashboard {
  lokasi_id: string;
  nama: string;
  laporan_7hari: number;
  laporan_7hari_sebelumnya: number;
  perubahan_persen: number;
  status: StatusLokasi;
}
