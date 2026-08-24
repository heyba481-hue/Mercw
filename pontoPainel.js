const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto-painel')
    .setDescription('Posta o painel fixo de bate-ponto neste canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🖥️ Ponto Eletrônico')
      .setDescription('Utilize o botão abaixo para registrar seu ponto.');

    const linha = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ponto:toggle').setLabel('Bater Ponto').setEmoji('🟢').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ponto:reabrir').setLabel('Reabrir Ponto').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({ embeds: [embed], components: [linha] });
    await interaction.reply({ content: '✅ Painel publicado.', flags: MessageFlags.Ephemeral });
  },
};
