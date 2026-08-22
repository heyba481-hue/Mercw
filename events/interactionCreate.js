const { MessageFlags } = require('discord.js');
const { tratarComponente } = require('./handlers/componentHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const comando = interaction.client.commands.get(interaction.commandName);
        if (!comando) return;
        await comando.execute(interaction);
        return;
      }

      if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
        await tratarComponente(interaction);
      }
    } catch (err) {
      console.error(`[interactionCreate] Erro ao processar interação (${interaction.type}):`, err);
      const payloadErro = { content: '❌ Ocorreu um erro ao processar essa ação. Tente novamente.', flags: MessageFlags.Ephemeral };
      try {
        if (interaction.deferred || interaction.replied) await interaction.followUp(payloadErro);
        else await interaction.reply(payloadErro);
      } catch (_) {
        // interação já expirou, nada a fazer
      }
    }
  },
};
