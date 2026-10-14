import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";

const dir = path.join(import.meta.dir, "../data");
mkdirSync(dir, { recursive: true });

export const db = new Database(path.join(dir, "database.db"), { create: true });

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

   CREATE UNIQUE INDEX IF NOT EXISTS laporan_device_harian
     ON laporan(device_hash, date(dibuat_pada));
   CREATE INDEX IF NOT EXISTS laporan_kecamatan_waktu
     ON laporan(kecamatan_id, dibuat_pada);
   `);
