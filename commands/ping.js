const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Verifica se o bot está online e a latência.'),
  async execute(interaction) {
    const inicio = Date.now();
    await interaction.reply({ content: '🏓 Calculando...', flags: MessageFlags.Ephemeral });
    const latencia = Date.now() - inicio;
    await interaction.editReply(`🏓 Pong! Latência da API: **${latencia}ms** · WebSocket: **${interaction.client.ws.ping}ms**`);
  },
};
