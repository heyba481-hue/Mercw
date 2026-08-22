const db = require('./db.js');

const stmts = {
  salvar: db.prepare(`
    INSERT INTO embed_templates (guild_id, nome, autor_id, dados, modo, criado_em)
    VALUES (@guild_id, @nome, @autor_id, @dados, @modo, @criado_em)
    ON CONFLICT(guild_id, nome) DO UPDATE SET
      dados = excluded.dados,
      modo = excluded.modo,
      autor_id = excluded.autor_id
  `),
  listar: db.prepare(`SELECT id, nome, modo, autor_id, criado_em FROM embed_templates WHERE guild_id = ? ORDER BY criado_em DESC`),
  buscarPorNome: db.prepare(`SELECT * FROM embed_templates WHERE guild_id = ? AND nome = ?`),
  remover: db.prepare(`DELETE FROM embed_templates WHERE guild_id = ? AND nome = ?`),
};

module.exports = {
  salvar(guildId, nome, autorId, dadosObj, modo) {
    return stmts.salvar.run({
      guild_id: guildId,
      nome,
      autor_id: autorId,
      dados: JSON.stringify(dadosObj),
      modo,
      criado_em: Date.now(),
    });
  },
  listar(guildId) {
    return stmts.listar.all(guildId);
  },
  buscarPorNome(guildId, nome) {
    const row = stmts.buscarPorNome.get(guildId, nome);
    if (!row) return null;
    return { ...row, dados: JSON.parse(row.dados) };
  },
  remover(guildId, nome) {
    return stmts.remover.run(guildId, nome);
  },
};

