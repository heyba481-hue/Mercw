const pontoModel = require('../database/models/ponto');
const { formatarDuracao } = require('../utils/time');

const ORDEM_ESPERADA = {
  entrada: ['saida', 'pausa_inicio'], // depois de bater entrada, só pode sair ou pausar
  pausa_inicio: ['pausa_fim'],
  pausa_fim: ['saida', 'pausa_inicio'],
  saida: ['entrada'],
};

const RESULTADOS = {
  OK: 'ok',
  FORA_DE_ORDEM: 'fora_de_ordem',
};

function statusAtual(guildId, userId) {
  const ultimo = pontoModel.ultimoRegistro(guildId, userId);
  if (!ultimo) return { situacao: 'nunca_bateu', ultimo: null };
  const mapa = {
    entrada: 'trabalhando',
    pausa_inicio: 'em_pausa',
    pausa_fim: 'trabalhando',
    saida: 'fora',
  };
  return { situacao: mapa[ultimo.tipo], ultimo };
}

/** Tenta registrar um evento de ponto, validando a ordem lógica (não deixa "sair" duas vezes seguidas, etc). */
function bater(guildId, userId, tipo, observacao) {
  const ultimo = pontoModel.ultimoRegistro(guildId, userId);

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

  pontoModel.registrar(guildId, userId, tipo, observacao);
  return { resultado: RESULTADOS.OK };
}

/**
 * Calcula tempo trabalhado e tempo de pausa dentro de um intervalo,
 * lidando com turnos que ficam "abertos" (sem saída registrada ainda).
 */
function calcularHoras(registros, fimJanela = Date.now()) {
  let trabalhadoMs = 0;
  let pausaMs = 0;
  let entradaAberta = null;
  let pausaAberta = null;

  for (const r of registros) {
    if (r.tipo === 'entrada') {
      entradaAberta = r.timestamp;
    } else if (r.tipo === 'pausa_inicio' && entradaAberta) {
      pausaAberta = r.timestamp;
      trabalhadoMs += r.timestamp - entradaAberta;
      entradaAberta = null;
    } else if (r.tipo === 'pausa_fim' && pausaAberta) {
      pausaMs += r.timestamp - pausaAberta;
      pausaAberta = null;
      entradaAberta = r.timestamp;
    } else if (r.tipo === 'saida' && entradaAberta) {
      trabalhadoMs += r.timestamp - entradaAberta;
      entradaAberta = null;
    }
  }

  // Turno ainda aberto (não bateu saída até o fim da janela)
  if (entradaAberta) trabalhadoMs += Math.max(0, fimJanela - entradaAberta);
  if (pausaAberta) pausaMs += Math.max(0, fimJanela - pausaAberta);

  return { trabalhadoMs, pausaMs, emAberto: Boolean(entradaAberta || pausaAberta) };
}

function relatorioUsuario(guildId, userId, inicio, fim) {
  const registros = pontoModel.registrosPeriodo(guildId, userId, inicio, fim);
  const { trabalhadoMs, pausaMs, emAberto } = calcularHoras(registros, fim);
  return {
    registros,
    trabalhadoMs,
    pausaMs,
    emAberto,
    trabalhadoFormatado: formatarDuracao(trabalhadoMs),
    pausaFormatada: formatarDuracao(pausaMs),
  };
}

function rankingServidor(guildId, inicio, fim) {
  const registros = pontoModel.registrosPeriodoTodos(guildId, inicio, fim);
  const porUsuario = new Map();
  for (const r of registros) {
    if (!porUsuario.has(r.user_id)) porUsuario.set(r.user_id, []);
    porUsuario.get(r.user_id).push(r);
  }

  const linhas = [];
  for (const [userId, regs] of porUsuario) {
    const { trabalhadoMs } = calcularHoras(regs, fim);
    linhas.push({ userId, trabalhadoMs });
  }
  return linhas.sort((a, b) => b.trabalhadoMs - a.trabalhadoMs);
}

module.exports = { statusAtual, bater, calcularHoras, relatorioUsuario, rankingServidor, RESULTADOS };

