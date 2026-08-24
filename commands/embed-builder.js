const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const embedSession = require('../embedSession.js');
const { construirPainel } = require('../embedPreview.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed-builder')
    .setDescription('Abre o painel avançado de criação de Embed / Components V2.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sessao = embedSession.obter(interaction.user.id, interaction.guildId, interaction.channelId);
    const painel = construirPainel(sessao);
    await interaction.reply({ ...painel, flags: MessageFlags.Ephemeral });
  },
};
