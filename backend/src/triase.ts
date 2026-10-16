// Triage rules: symptoms + duration + condition -> category 1, 2, or 3
import type { InputTriase, Triase } from "../../shared/types";

// Shown on every response (PRD 6.5). The app never names a disease.
const CATATAN = "Ini cuma panduan awal, bukan hasil pemeriksaan dokter.";

// Always category 1. Never waits for a day count.
const DARURAT = [
  "sesak_berat",
  "nyeri_dada",
  "bibir_membiru",
  "batuk_darah",
  "sulit_bicara",
  "kesadaran_turun",
];

// Symptom codes used by the day-based rules
const BATUK_DEMAM = ["batuk", "demam"];

// Symptoms that matter more for children, elderly, and pregnant users
const GEJALA_RENTAN = ["batuk", "demam", "pilek", "sakit_tenggorokan"];

// One entry per rule, not per code. Several rules can share a code.
const PESAN = {
  darurat: {
    kategori: 1,
    pesan: "Segera ke IGD atau hubungi 119.",
    saran: [],
    catatan: CATATAN,
  },
  sesak: {
    kategori: 2,
    pesan: "Sesak napas perlu diperiksa hari ini.",
    saran: ["Istirahat", "Pakai masker"],
    catatan: CATATAN,
  },
  demamPanjang: {
    kategori: 2,
    pesan: "Demam 3 hari atau lebih sebaiknya diperiksa.",
    saran: ["Banyak minum", "Istirahat", "Pakai masker"],
    catatan: CATATAN,
  },
  belumMembaik: {
    kategori: 2,
    pesan: "Batuk atau demam yang belum membaik sebaiknya diperiksa.",
    saran: ["Istirahat", "Pakai masker"],
    catatan: CATATAN,
  },
  rentan: {
    kategori: 2,
    pesan: "Gejala pada anak, lansia, atau ibu hamil sebaiknya diperiksa.",
    saran: ["Istirahat", "Pakai masker"],
    catatan: CATATAN,
  },
  ringan: {
    kategori: 3,
    pesan: "Saran mandiri: istirahat, pakai masker, hindari area berpolusi.",
    saran: ["Istirahat", "Pakai masker", "Hindari area berpolusi"],
    catatan: CATATAN,
  },
} satisfies Record<string, Triase>;

export type { InputTriase };

export function hitungTriase(l: InputTriase): Triase {
  // Duration for one symptom, falling back to the single durasi_hari
  const hari = (kode: string) => l.durasi_per_gejala?.[kode] ?? l.durasi_hari;

  // Rule 1: emergency symptom wins, no day count
  if (l.gejala.some((g) => DARURAT.includes(g))) return PESAN.darurat;

  // Rule 2: mild-medium shortness of breath = category 2 any day
  if (l.gejala.includes("sesak")) return PESAN.sesak;

  // Rule 3: high fever for 3+ days
  if ((l.suhu_c ?? 0) > 38 && hari("demam") >= 3) return PESAN.demamPanjang;

  // Rule 4: cough or fever on day 4+ and not clearly improving.
  // Uses the longest duration among cough/fever, so one long symptom is enough.
  const sakit = l.gejala.filter((g) => BATUK_DEMAM.includes(g));
  const durasiLama = sakit.length ? Math.max(...sakit.map(hari)) : 0;
  if (durasiLama >= 4 && l.kondisi !== "membaik") return PESAN.belumMembaik;

  // Rule 5: vulnerable group with a relevant symptom
  if (l.kelompok_rentan && l.gejala.some((g) => GEJALA_RENTAN.includes(g)))
    return PESAN.rentan;

  // Rule 6: everything else = category 3. Clone first: we push one extra tip below.
  const t = structuredClone(PESAN.ringan);
  if (l.durasi_hari > 10)
    t.saran.push("Jika lebih dari 10 hari belum sembuh, periksa ke puskesmas");
  return t;
}