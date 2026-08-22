const { EmbedBuilder } = require('discord.js');

function montarPayloadV2(v2Data) {
  return {
    content: '📦 **Preview Components V2**',
    embeds: [new EmbedBuilder().setTitle('Seu Embed V2').setColor(0x5865f2).setDescription('Conteúdo do seu componente V2.')],
  };
}

module.exports = { montarPayloadV2 };
