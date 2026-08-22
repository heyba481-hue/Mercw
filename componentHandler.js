const embedPanelHandler = require('./embedPanelHandler');
const pontoPanelHandler = require('./pontoPanelHandler');

/** Decide, pelo prefixo do customId, qual sub-handler trata a interação de componente/modal. */
async function tratarComponente(interaction) {
  const customId = interaction.customId || '';

  if (customId.startsWith('emb:') || customId.startsWith('embmodal:')) {
    return embedPanelHandler.tratar(interaction);
  }
  if (customId.startsWith('ponto:')) {
    return pontoPanelHandler.tratar(interaction);
  }
}

module.exports = { tratarComponente };

