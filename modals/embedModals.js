const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const modais = {
  basico: (sessao) => {
    return new ModalBuilder()
      .setCustomId('embmodal:basico')
      .setTitle('Editar Básico')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('titulo')
            .setLabel('Título')
            .setStyle(TextInputStyle.Short)
            .setValue(sessao.classico.title || '')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('descricao')
            .setLabel('Descrição')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(sessao.classico.description || '')
        )
      );
  },
  salvarTemplate: () => {
    return new ModalBuilder()
      .setCustomId('embmodal:salvar_template')
      .setTitle('Salvar Template')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('nome')
            .setLabel('Nome do Template')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('ex: meu_template')
            .setRequired(true)
        )
      );
  },
  carregarTemplate: () => {
    return new ModalBuilder()
      .setCustomId('embmodal:carregar_template')
      .setTitle('Carregar Template')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('nome')
            .setLabel('Nome do Template')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('ex: meu_template')
            .setRequired(true)
        )
      );
  },
};

function aplicarModal(customId, fields, sessao) {
  if (customId === 'embmodal:basico') {
    sessao.classico.title = fields.getTextInputValue('titulo');
    sessao.classico.description = fields.getTextInputValue('descricao');
    return { ok: true };
  }
  return { ok: false, erro: 'Modal desconhecido' };
}

module.exports = { modais, aplicarModal };
