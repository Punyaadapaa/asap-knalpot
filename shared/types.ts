// Tipe bersama backend (sekaligus acuan bentuk API untuk frontend).
//
// Bentuk respons: { status: "success", data } atau { status: "error", message }.
// Frontend saat ini mendefinisikan tipenya sendiri di frontend/src/api.ts; file
// ini adalah sumber tunggal untuk backend.

// ---- Triase (internal: dipakai triase.ts & api.ts) ----

export type KategoriTriase = 1 | 2 | 3; // 1 darurat, 2 perlu pemeriksaan, 3 ringan

export interface Triase {
  kategori: KategoriTriase;
  pesan: string;
  saran: string[];
  catatan: string; // disclaimer wajib, ditampilkan di UI
}

export type Kondisi = "membaik" | "stabil" | "memburuk";

// Durasi per gejala (hari). Kalau tidak ada, dipakai durasi_hari.
export type DurasiPerGejala = Record<string, number>;

export interface InputTriase {
  gejala: string[];
  durasi_hari: number;
  kondisi?: Kondisi;
  suhu_c?: number;
  durasi_per_gejala?: DurasiPerGejala;
  kelompok_rentan?: boolean; // anak, lansia, ibu hamil
}

// ---- Amplop respons ----

export interface ApiSuccess<T> {
  status: "success";
  data: T;
  message?: string;
}

export interface ApiError {
  status: "error";
  message: string;
}

// ---- Bentuk mentah data/lokasi.json (dipakai seed.ts) ----

export interface Lokasi {
  id: string;
  nama: string;
  lat: number;
  lng: number;
}

// ---- Lokasi (LocationItem) ----// Dipakai /api/lokasi, /api/peta (locations[]), /api/dashboard (kecamatan_list[]),
// dan /api/lokasi/:id/tren.

export type StatusSinyal = "normal" | "naik" | "data_belum_cukup";
export type SumberAqi = "stasiun" | "model" | "contoh";

export interface TitikTren {
  date: string; // YYYY-MM-DD (WIB)
  label: string; // mis. "Sab"
  count: number;
}

export interface LocationItem {
  id: string;
  nama: string;
  kota: string;
  latitude: number;
  longitude: number;
  aqi: number;
  aqi_category: string;
  aqi_source: SumberAqi;
  aqi_updated_at: string;
  rth_percentage: number;
  /** null kalau < 3 laporan (privasi) */
  total_reports_7d: number | null;
  previous_reports_7d: number;
  change_percent: number;
  status: StatusSinyal;
  privacy_hidden: boolean;
  daily_trend: TitikTren[];
}

export interface GejalaItem {
  id: string;
  nama: string;
  icon: string;
  is_emergency: boolean;
  sort_order: number;
}

// ---- Lingkungan (data/lingkungan.json, level kota) ----

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
