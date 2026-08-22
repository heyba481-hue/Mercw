const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const pontoService = require('../../services/pontoService');
const { podeBaterPonto } = require('../../utils/permissions');
const { inicioDoDia } = require('../../utils/time');
const { registrarLog } = require('../../services/pontoLog');

const LABELS = {
  entrada: { verbo: 'bateu entrada', emoji: '🟢' },
  saida: { verbo: 'bateu saída', emoji: '🔴' },
  pausa_inicio: { verbo: 'entrou em pausa', emoji: '⏸️' },
  pausa_fim: { verbo: 'retornou da pausa', emoji: '▶️' },
};

async function processarBatida(interaction, tipo) {
  if (!podeBaterPonto(interaction.member, interaction.guildId)) {
    return interaction.reply({ content: '🚫 Você não tem permissão para usar o bate-ponto neste servidor.', flags: MessageFlags.Ephemeral });
  }

  const resultado = pontoService.bater(interaction.guildId, interaction.user.id, tipo);
  if (resultado.resultado !== pontoService.RESULTADOS.OK) {
    return interaction.reply({ content: `⚠️ ${resultado.mensagem}`, flags: MessageFlags.Ephemeral });
  }

  const { emoji, verbo } = LABELS[tipo];
  await interaction.reply({ content: `${emoji} Você ${verbo} às <t:${Math.floor(Date.now() / 1000)}:T>.`, flags: MessageFlags.Ephemeral });
  await registrarLog(interaction.client, interaction.guildId, interaction.user, tipo);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto')
    .setDescription('Sistema de bate-ponto.')
    .addSubcommand((s) => s.setName('entrada').setDescription('Bate entrada / inicia o expediente.'))
    .addSubcommand((s) => s.setName('saida').setDescription('Bate saída / encerra o expediente.'))
    .addSubcommand((s) => s.setName('pausa').setDescription('Inicia uma pausa/intervalo.'))
    .addSubcommand((s) => s.setName('retornar').setDescription('Encerra a pausa e volta ao expediente.'))
    .addSubcommand((s) => s.setName('status').setDescription('Mostra sua situação atual e horas do dia.')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'entrada') return processarBatida(interaction, 'entrada');
    if (sub === 'saida') return processarBatida(interaction, 'saida');
    if (sub === 'pausa') return processarBatida(interaction, 'pausa_inicio');
    if (sub === 'retornar') return processarBatida(interaction, 'pausa_fim');

    if (sub === 'status') {
      const { situacao, ultimo } = pontoService.statusAtual(interaction.guildId, interaction.user.id);
      const relatorio = pontoService.relatorioUsuario(interaction.guildId, interaction.user.id, inicioDoDia(), Date.now());

      const situacaoLabel = {
        nunca_bateu: '⚪ Nunca bateu ponto',
        trabalhando: '🟢 Em expediente',
        em_pausa: '⏸️ Em pausa',
        fora: '🔴 Fora do expediente',
      }[situacao];

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setTitle('📋 Status do bate-ponto')
        .addFields(
          { name: 'Situação atual', value: situacaoLabel, inline: true },
          { name: 'Trabalhado hoje', value: relatorio.trabalhadoFormatado, inline: true },
          { name: 'Pausas hoje', value: relatorio.pausaFormatada, inline: true },
        );

      if (ultimo) {
        embed.setFooter({ text: `Último registro: ${LABELS[ultimo.tipo]?.verbo || ultimo.tipo}` }).setTimestamp(ultimo.timestamp);
      }

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};

