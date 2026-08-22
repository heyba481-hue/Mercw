const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto-painel')
    .setDescription('Posta um painel fixo com botões de bater ponto neste canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🕒 Painel de Bate-Ponto')
      .setDescription('Use os botões abaixo para registrar sua entrada, pausa ou saída.\nSeu status é sempre privado (só você vê a confirmação).');

    const linha = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ponto:entrada').setLabel('Entrada').setEmoji('🟢').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ponto:pausa').setLabel('Pausa').setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ponto:retorno').setLabel('Retornar').setEmoji('▶️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ponto:saida').setLabel('Saída').setEmoji('🔴').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ponto:status').setLabel('Status').setEmoji('📋').setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({ embeds: [embed], components: [linha] });
    await interaction.reply({ content: '✅ Painel de bate-ponto publicado.', flags: MessageFlags.Ephemeral });
  },
};

