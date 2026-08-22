const sessoes = new Map();

function obter(userId, guildId, channelId) {
  const chave = `${userId}:${guildId}:${channelId}`;
  if (!sessoes.has(chave)) {
    sessoes.set(chave, {
      userId,
      guildId,
      channelId,
      modo: 'classico',
      canalDestinoId: null,
      templateName: null,
      classico: {
        title: 'Novo Embed',
        description: 'Descrição do seu embed...',
        color: 0x5865f2,
        fields: [],
      },
      v2: {
        blocks: [],
      },
    });
  }
  return sessoes.get(chave);
}

function limpar(userId, guildId) {
  const chaves = Array.from(sessoes.keys()).filter(k => k.startsWith(`${userId}:${guildId}`));
  chaves.forEach(k => sessoes.delete(k));
}

module.exports = { obter, limpar };
