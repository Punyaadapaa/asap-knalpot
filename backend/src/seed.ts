// Fill starting data: districts from lokasi.json and the symptom list
import path from "path";
import { db } from "./db";
import type { Lokasi } from "../../shared/types";

// [code, label] pairs. Labels are not yet checked by medical staff.
const GEJALA: [string, string][] = [
  ["batuk", "Batuk"],
  ["sesak", "Sesak napas (ringan–sedang)"],
  ["sesak_berat", "Sesak napas berat"],
  ["demam", "Demam"],
  ["pilek", "Pilek / hidung tersumbat"],
  ["sakit_tenggorokan", "Sakit / perih tenggorokan"],
  ["mata_perih", "Mata perih / berair"],
  ["nyeri_dada", "Nyeri dada"],
  ["bibir_membiru", "Bibir/kuku membiru"],
  ["batuk_darah", "Batuk darah"],
  ["sulit_bicara", "Sulit bicara"],
  ["kesadaran_turun", "Kesadaran menurun"],
];

export async function seed() {
  // Read the district list from the JSON file
  const lokasi: Lokasi[] = await Bun.file(
    path.join(import.meta.dir, "../../data/lokasi.json"),
  ).json();

  // "ON CONFLICT ... DO UPDATE" = insert new rows, update existing ones
  const upsertKec = db.prepare(`
       INSERT INTO kecamatan (id, nama, lat, lng) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET nama = excluded.nama, lat = excluded.lat, lng =
 excluded.lng
     `);
  const upsertGejala = db.prepare(`
       INSERT INTO gejala (kode, label) VALUES (?, ?)
       ON CONFLICT(kode) DO UPDATE SET label = excluded.label
     `);

  // Run everything in one transaction: all rows or none
  db.transaction(() => {
    for (const k of lokasi) upsertKec.run(k.id, k.nama, k.lat, k.lng);
    for (const [kode, label] of GEJALA) upsertGejala.run(kode, label);
  })();
}
