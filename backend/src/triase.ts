// Triage rules: turn symptoms + duration into category 1, 2, or 3
import type { Triase } from "../../shared/types";

// Symptoms that always mean category 1 (emergency)
const DARURAT = [
  "nyeri_dada",
  "bibir_membiru",
  "batuk_darah",
  "sulit_bicara",
  "kesadaran_turun",
];

// shortcut: one duration for all symptoms, and "sesak" is not split into mild/severe.
// Upgrade when the API sends a duration per symptom (PRD section 11).
export function hitungTriase(gejala: string[], durasi: number): Triase {
  // Rule 1: any emergency symptom wins
  if (gejala.some((g) => DARURAT.includes(g))) {
    return { kategori: 1, pesan: "Segera ke IGD atau hubungi 119.", saran: [] };
  }

  // Rule 2: breathing problem, or fever/cough that lasts long
  if (
    gejala.includes("sesak") ||
    (gejala.includes("demam") && durasi > 3) ||
    (gejala.includes("batuk") && durasi > 7)
  ) {
    return {
      kategori: 2,
      pesan: "Periksakan ke puskesmas atau rumah sakit untuk diagnosis pasti.",
      saran: ["Istirahat", "Pakai masker"],
    };
  }

  // Rule 3: everything else is mild, self-care advice
  return {
    kategori: 3,
    pesan:
      "Saran mandiri: istirahat, pakai masker, hindari area berpolusi, periksa jika memburuk.",
    saran: ["Istirahat", "Pakai masker", "Hindari area berpolusi"],
  };
}
