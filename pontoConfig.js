const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const pontoModel = require('../../database/models/ponto');
const { podeGerenciar } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto-config')
    .setDescription('Configura o sistema de bate-ponto do servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName('definir')
        .setDescription('Define canal de log, cargo permitido e/ou meta de horas.')
        .addChannelOption((o) => o.setName('canal_log').setDescription('Canal onde cada batida de ponto será registrada').addChannelTypes(ChannelType.GuildText))
        .addRoleOption((o) => o.setName('cargo_permitido').setDescription('Cargo que pode usar o bate-ponto (vazio = todos podem)'))
        .addNumberOption((o) => o.setName('meta_horas').setDescription('Meta de horas trabalhadas por dia (padrão: 8)')),
    )
    .addSubcommand((s) => s.setName('ver').setDescription('Mostra a configuração atual.')),
  async execute(interaction) {
    if (!podeGerenciar(interaction.member)) {
      return interaction.reply({ content: '🚫 Você precisa de permissão de **Gerenciar Servidor** (ou o cargo de admin configurado) para isso.', flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'ver') {
      const cfg = pontoModel.getConfig(interaction.guildId);
      return interaction.reply({
        content: [
          '⚙️ **Configuração do bate-ponto**',
          `Canal de log: ${cfg.canal_log_id ? `<#${cfg.canal_log_id}>` : '_não definido_'}`,
          `Cargo permitido: ${cfg.cargo_permitido_id ? `<@&${cfg.cargo_permitido_id}>` : '_todos podem usar_'}`,
          `Meta de horas/dia: **${cfg.meta_horas_dia}h**`,
        ].join('\n'),
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === 'definir') {
      const canal = interaction.options.getChannel('canal_log');
      const cargo = interaction.options.getRole('cargo_permitido');
      const meta = interaction.options.getNumber('meta_horas');

      const cfg = pontoModel.setConfig(interaction.guildId, {
        canalLogId: canal ? canal.id : undefined,
        cargoPermitidoId: cargo ? cargo.id : undefined,
        metaHorasDia: meta ?? undefined,
      });

      return interaction.reply({
        content: [
          '✅ Configuração atualizada:',
          `Canal de log: ${cfg.canal_log_id ? `<#${cfg.canal_log_id}>` : '_não definido_'}`,
          `Cargo permitido: ${cfg.cargo_permitido_id ? `<@&${cfg.cargo_permitido_id}>` : '_todos podem usar_'}`,
          `Meta de horas/dia: **${cfg.meta_horas_dia}h**`,
        ].join('\n'),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

