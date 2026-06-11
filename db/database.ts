import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('clothesarchive.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clothes (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         category TEXT,
                                         material TEXT,
                                         wash_instruction TEXT,
                                         color TEXT,
                                         brand TEXT,
                                         photo_uri TEXT,
                                         wash_status TEXT DEFAULT 'verfügbar',
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS outfits (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS outfit_items (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              outfit_id INTEGER,
                                              clothes_id INTEGER,
                                              FOREIGN KEY (outfit_id) REFERENCES outfits(id),
      FOREIGN KEY (clothes_id) REFERENCES clothes(id)
      );
    CREATE TABLE IF NOT EXISTS brands (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL UNIQUE
    );




    INSERT OR IGNORE INTO brands (name) VALUES ('Nike');
    INSERT OR IGNORE INTO brands (name) VALUES ('Adidas');
    INSERT OR IGNORE INTO brands (name) VALUES ('Zara');
    INSERT OR IGNORE INTO brands (name) VALUES ('H&M');
    INSERT OR IGNORE INTO brands (name) VALUES ('Uniqlo');
  `);

  try {
    db.execSync(`ALTER TABLE clothes ADD COLUMN wash_status TEXT DEFAULT 'verfügbar';`);
  } catch {
  }
  try {
    db.execSync(`ALTER TABLE clothes ADD COLUMN photo_uri TEXT;`);
  } catch {
  }
}
try {
  db.execSync(`ALTER TABLE clothes ADD COLUMN wash_status TEXT DEFAULT 'verfügbar';`);
} catch {}

export default db;