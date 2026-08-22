const db = require('../db');

const RESULTADOS = {
  OK: 'ok',
  FORA_DE_ORDEM: 'fora_de_ordem',
};

function statusAtual(guildId, userId) {
  const stmt = db.prepare('SELECT * FROM ponto_registros WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1');
  const ultimo = stmt.get(guildId, userId);
  if (!ultimo) return { situacao: 'nunca_bateu', ultimo: null };
  const mapa = {
    entrada: 'trabalhando',
    pausa_inicio: 'em_pausa',
    pausa_fim: 'trabalhando',
    saida: 'fora',
  };
  return { situacao: mapa[ultimo.tipo], ultimo };
}

function bater(guildId, userId, tipo, observacao) {
  const stmt = db.prepare('SELECT * FROM ponto_registros WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1');
  const ultimo = stmt.get(guildId, userId);

  if (tipo === 'entrada' && ultimo && ultimo.tipo !== 'saida') {
    return { resultado: RESULTADOS.FORA_DE_ORDEM, mensagem: 'Você já bateu entrada e ainda não saiu.' };
  }
  if (tipo === 'saida' && (!ultimo || ultimo.tipo === 'saida')) {
    return { resultado: RESULTADOS.FORA_DE_ORDEM, mensagem: 'Você precisa bater entrada antes de sair.' };
  }
  if (tipo === 'pausa_inicio' && (!ultimo || !['entrada', 'pausa_fim'].includes(ultimo.tipo))) {
    return { resultado: RESULTADOS.FORA_DE_ORDEM, mensagem: 'Você só pode pausar estando em expediente.' };
  }
  if (tipo === 'pausa_fim' && (!ultimo || ultimo.tipo !== 'pausa_inicio')) {
    return { resultado: RESULTADOS.FORA_DE_ORDEM, mensagem: 'Você não está em pausa no momento.' };
  }

  const insertStmt = db.prepare('INSERT INTO ponto_registros (guild_id, user_id, tipo, timestamp, observacao) VALUES (?, ?, ?, ?, ?)');
  insertStmt.run(guildId, userId, tipo, Math.floor(Date.now() / 1000), observacao || null);
  return { resultado: RESULTADOS.OK };
}

function calcularHoras(registros, fimJanela = Date.now()) {
  let trabalhadoMs = 0;
  let pausaMs = 0;
  let entradaAberta = null;
  let pausaAberta = null;

  for (const r of registros) {
    if (r.tipo === 'entrada') {
      entradaAberta = r.timestamp * 1000;
    } else if (r.tipo === 'pausa_inicio' && entradaAberta) {
      pausaAberta = r.timestamp * 1000;
      trabalhadoMs += r.timestamp * 1000 - entradaAberta;
      entradaAberta = null;
    } else if (r.tipo === 'pausa_fim' && pausaAberta) {
      pausaMs += r.timestamp * 1000 - pausaAberta;
      pausaAberta = null;
      entradaAberta = r.timestamp * 1000;
    } else if (r.tipo === 'saida' && entradaAberta) {
      trabalhadoMs += r.timestamp * 1000 - entradaAberta;
      entradaAberta = null;
    }
  }

  if (entradaAberta) trabalhadoMs += Math.max(0, fimJanela - entradaAberta);
  if (pausaAberta) pausaMs += Math.max(0, fimJanela - pausaAberta);

  return { trabalhadoMs, pausaMs, emAberto: Boolean(entradaAberta || pausaAberta) };
}

function relatorioUsuario(guildId, userId, inicio, fim) {
  const stmt = db.prepare('SELECT * FROM ponto_registros WHERE guild_id = ? AND user_id = ? AND timestamp BETWEEN ? AND ? ORDER BY timestamp ASC');
  const registros = stmt.all(guildId, userId, Math.floor(inicio / 1000), Math.floor(fim / 1000));
  const { trabalhadoMs, pausaMs, emAberto } = calcularHoras(registros, fim);
  
  const formatarDuracao = (ms) => {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    return `${horas}h ${minutos}m`;
  };
  
  return {
    registros,
    trabalhadoMs,
    pausaMs,
    emAberto,
    trabalhadoFormatado: formatarDuracao(trabalhadoMs),
    pausaFormatada: formatarDuracao(pausaMs),
  };
}

module.exports = { statusAtual, bater, calcularHoras, relatorioUsuario, RESULTADOS };
