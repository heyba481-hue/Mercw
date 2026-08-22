const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function construirEmbedClassico(sessao) {
  const embed = new EmbedBuilder()
    .setTitle(sessao.classico.title || 'Sem título')
    .setDescription(sessao.classico.description || 'Sem descrição')
    .setColor(sessao.classico.color || 0x5865f2);
  
  if (sessao.classico.fields && sessao.classico.fields.length > 0) {
    embed.addFields(sessao.classico.fields);
  }
  
  return embed;
}

function construirPainel(sessao) {
  const botoesRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('emb:preview').setLabel('📺 Visualizar').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('emb:enviar').setLabel('📤 Enviar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('emb:salvar').setLabel('💾 Salvar').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('emb:carregar').setLabel('📂 Carregar').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('emb:cancelar').setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger),
    );
  
  return {
    content: '🎨 **Painel de Criação de Embed**\n\nEscolha as opções abaixo para editar seu embed.',
    components: [botoesRow],
  };
}

module.exports = { construirPainel, construirEmbedClassico };
