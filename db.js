const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

const dir = path.dirname(config.databasePath);
if (dir && dir !== '.' && !fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS ponto_registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('entrada','saida','pausa_inicio','pausa_fim')),
  timestamp INTEGER NOT NULL,
  observacao TEXT
);

CREATE INDEX IF NOT EXISTS idx_ponto_guild_user ON ponto_registros (guild_id, user_id);

CREATE TABLE IF NOT EXISTS ponto_config (
  guild_id TEXT PRIMARY KEY,
  canal_log_id TEXT,
  cargo_permitido_id TEXT,
  meta_horas_dia REAL DEFAULT 8
);

CREATE TABLE IF NOT EXISTS embed_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  autor_id TEXT NOT NULL,
  dados TEXT NOT NULL,
  modo TEXT NOT NULL DEFAULT 'classico',
  criado_em INTEGER NOT NULL,
  UNIQUE(guild_id, nome)
);
`);

module.exports = db;

