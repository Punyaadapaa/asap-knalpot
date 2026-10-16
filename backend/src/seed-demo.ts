// Demo reports for the video walkthrough. Run manually: bun run seed:demo
// Never called by the server. Rows are tagged "demo-seed-" so they can be removed.
import { db } from "./db";
import { seed } from "./seed";
import { hitungTriase } from "./triase";

const HARI = 24 * 60 * 60 * 1000;
const TAG = "demo-seed-";

// Remove only the rows this script created
if (process.argv.includes("--hapus")) {
  const { changes } = db
    .query("DELETE FROM laporan WHERE device_hash LIKE ?")
    .run(`${TAG}%`);
  console.log(`Hapus seed demo: ${changes} laporan dihapus.`);
  process.exit(0);
}

// [kecamatan_id, laporan 7 hari terakhir, laporan 7 hari sebelumnya]
// Target: one district climbs (naik), one stays flat (normal), the rest hidden (<3).
const POLA: [string, number, number][] = [
  ["kec-3471003", 12, 6], // Gondokusuman: +100% -> status naik
  ["kec-3471005", 8, 8], // Jetis: 0% -> status normal
  ["kec-3471013", 4, 3], // Umbulharjo: stable, small -> status normal
];

// Rotating symptoms so the demo data does not look identical everywhere
const GEJALA: [string[], number][] = [
  [["batuk"], 2],
  [["batuk", "pilek"], 3],
  [["demam", "batuk"], 2],
  [["sesak"], 1],
  [["sakit_tenggorokan", "pilek"], 2],
];

await seed();

const hapusDemo = db.prepare("DELETE FROM laporan WHERE device_hash LIKE ?");
const insert = db.prepare(`
  INSERT INTO laporan (kecamatan_id, gejala, durasi_hari, kategori, device_hash, dibuat_pada)
  VALUES (?, ?, ?, ?, ?, ?)
`);

let n = 0;
db.transaction(() => {
  hapusDemo.run(`${TAG}%`);

  for (const [kec, cur, prev] of POLA) {
    // Last 7 days: day offsets 0..6
    for (let i = 0; i < cur; i++) {
      const [gejala, durasi] = GEJALA[i % GEJALA.length]!;
      const dibuat = new Date(Date.now() - (i % 7) * HARI).toISOString();
      const triase = hitungTriase({ gejala, durasi_hari: durasi });
      insert.run(kec, JSON.stringify(gejala), durasi, triase.kategori, `${TAG}${n++}`, dibuat);
    }
    // Previous 7 days: day offsets 8..13, so they never touch the current window
    for (let i = 0; i < prev; i++) {
      const [gejala, durasi] = GEJALA[i % GEJALA.length]!;
      const dibuat = new Date(Date.now() - (8 + (i % 6)) * HARI).toISOString();
      const triase = hitungTriase({ gejala, durasi_hari: durasi });
      insert.run(kec, JSON.stringify(gejala), durasi, triase.kategori, `${TAG}${n++}`, dibuat);
    }
  }
})();

console.log(`Seed demo selesai: ${n} laporan dengan tag "${TAG}" (data contoh).`);
console.log("Hapus lagi dengan: bun run seed:demo -- --hapus");