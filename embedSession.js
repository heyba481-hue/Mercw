// Guarda o "rascunho" de cada usuário enquanto ele usa o painel /embed-builder.
// É em memória (Map) de propósito: sessão de edição é passageira, não precisa
// de banco. Templates salvos (definitivos) vão pro sqlite (embedTemplates.js).

const sessions = new Map();

function chave(userId, guildId) {
  return `${guildId}:${userId}`;
}

function criarPadrao(userId, guildId, channelId) {
  return {
    userId,
    guildId,
    modo: 'classico', // 'classico' (Embed clássico) ou 'v2' (Components V2)
    canalDestinoId: channelId,
    templateName: null,
    classico: {
      title: null,
      description: null,
      color: null,
      url: null,
      footerText: null,
      footerIcon: null,
      authorName: null,
      authorIcon: null,
      authorUrl: null,
      thumbnail: null,
      image: null,
      timestamp: false,
      fields: [], // { name, value, inline }
    },
    v2: {
      accentColor: null,
      blocks: [], // ver builders/componentsV2.js pros tipos suportados
    },
  };
}

module.exports = {
  obter(userId, guildId, channelId) {
    const k = chave(userId, guildId);
    if (!sessions.has(k)) {
      sessions.set(k, criarPadrao(userId, guildId, channelId));
    }
    return sessions.get(k);
  },
  salvar(userId, guildId, dados) {
    sessions.set(chave(userId, guildId), dados);
    return dados;
  },
  limpar(userId, guildId) {
    sessions.delete(chave(userId, guildId));
  },
  existe(userId, guildId) {
    return sessions.has(chave(userId, guildId));
  },
};

