const db = require('../db');

const stmts = {
  inserir: db.prepare(`
    INSERT INTO ponto_registros (guild_id, user_id, tipo, timestamp, observacao)
    VALUES (@guild_id, @user_id, @tipo, @timestamp, @observacao)
  `),
  ultimoRegistro: db.prepare(`
    SELECT * FROM ponto_registros
    WHERE guild_id = ? AND user_id = ?
    ORDER BY timestamp DESC LIMIT 1
  `),
  registrosPeriodo: db.prepare(`
    SELECT * FROM ponto_registros
    WHERE guild_id = ? AND user_id = ? AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
  `),
  registrosPeriodoTodos: db.prepare(`
    SELECT * FROM ponto_registros
    WHERE guild_id = ? AND timestamp BETWEEN ? AND ?
    ORDER BY user_id ASC, timestamp ASC
  `),
  removerRegistro: db.prepare(`DELETE FROM ponto_registros WHERE id = ? AND guild_id = ?`),
  getConfig: db.prepare(`SELECT * FROM ponto_config WHERE guild_id = ?`),
  upsertConfig: db.prepare(`
    INSERT INTO ponto_config (guild_id, canal_log_id, cargo_permitido_id, meta_horas_dia)
    VALUES (@guild_id, @canal_log_id, @cargo_permitido_id, @meta_horas_dia)
    ON CONFLICT(guild_id) DO UPDATE SET
      canal_log_id = COALESCE(excluded.canal_log_id, ponto_config.canal_log_id),
      cargo_permitido_id = COALESCE(excluded.cargo_permitido_id, ponto_config.cargo_permitido_id),
      meta_horas_dia = COALESCE(excluded.meta_horas_dia, ponto_config.meta_horas_dia)
  `),
};

module.exports = {
  registrar(guildId, userId, tipo, observacao = null) {
    return stmts.inserir.run({
      guild_id: guildId,
      user_id: userId,
      tipo,
      timestamp: Date.now(),
      observacao,
    });
  },
  ultimoRegistro(guildId, userId) {
    return stmts.ultimoRegistro.get(guildId, userId);
  },
  registrosPeriodo(guildId, userId, inicio, fim) {
    return stmts.registrosPeriodo.all(guildId, userId, inicio, fim);
  },
  registrosPeriodoTodos(guildId, inicio, fim) {
    return stmts.registrosPeriodoTodos.all(guildId, inicio, fim);
  },
  removerRegistro(id, guildId) {
    return stmts.removerRegistro.run(id, guildId);
  },
  getConfig(guildId) {
    return stmts.getConfig.get(guildId) || {
      guild_id: guildId,
      canal_log_id: null,
      cargo_permitido_id: null,
      meta_horas_dia: 8,
    };
  },
  setConfig(guildId, { canalLogId, cargoPermitidoId, metaHorasDia } = {}) {
    stmts.upsertConfig.run({
      guild_id: guildId,
      canal_log_id: canalLogId ?? null,
      cargo_permitido_id: cargoPermitidoId ?? null,
      meta_horas_dia: metaHorasDia ?? null,
    });
    return this.getConfig(guildId);
  },
};

