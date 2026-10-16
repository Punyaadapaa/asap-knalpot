import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";

const dir = path.join(import.meta.dir, "../data");
mkdirSync(dir, { recursive: true });

// DB_PATH bisa diarahkan ke tempat lain (dipakai saat pengujian).
const berkas = process.env.DB_PATH ?? path.join(dir, "database.db");
mkdirSync(path.dirname(berkas), { recursive: true });

export const db = new Database(berkas, { create: true });

db.exec(`
   CREATE TABLE IF NOT EXISTS kecamatan (
     id         TEXT PRIMARY KEY,
     nama       TEXT NOT NULL,
     lat        REAL NOT NULL,
     lng        REAL NOT NULL,
     rth_persen REAL
   );

   CREATE TABLE IF NOT EXISTS gejala (
     kode   TEXT PRIMARY KEY,
     label  TEXT NOT NULL,
     aktif  INTEGER NOT NULL DEFAULT 1
   );

   CREATE TABLE IF NOT EXISTS laporan (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     kecamatan_id TEXT NOT NULL REFERENCES kecamatan(id),
     gejala       TEXT NOT NULL,
     durasi_hari  INTEGER NOT NULL,
     kategori     INTEGER NOT NULL CHECK (kategori IN (1,2,3)),
     device_hash  TEXT NOT NULL,
     dibuat_pada  TEXT NOT NULL
   );

   CREATE INDEX IF NOT EXISTS laporan_kecamatan_waktu
     ON laporan(kecamatan_id, dibuat_pada);

   -- 1 laporan per perangkat per hari (PRD 6.1). Batas hari memakai WIB
   -- (+7 jam), bukan UTC, supaya hari berganti saat tengah malam WIB.
   CREATE UNIQUE INDEX IF NOT EXISTS laporan_device_harian
     ON laporan(device_hash, date(dibuat_pada, '+7 hours'));
   `);
