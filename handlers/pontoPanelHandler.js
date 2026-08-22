const { MessageFlags, EmbedBuilder } = require('discord.js');
const pontoService = require('../services/pontoService');
const { podeBaterPonto } = require('../utils/permissions');
const { inicioDoDia } = require('../utils/time');
const { registrarLog } = require('../services/pontoLog');

const LABELS = {
  entrada: { verbo: 'bateu entrada', emoji: '🟢' },
  saida: { verbo: 'bateu saída', emoji: '🔴' },
  pausa_inicio: { verbo: 'entrou em pausa', emoji: '⏸️' },
  pausa_fim: { verbo: 'retornou da pausa', emoji: '▶️' },
};

const BOTAO_PARA_TIPO = { 'ponto:entrada': 'entrada', 'ponto:saida': 'saida', 'ponto:pausa': 'pausa_inicio', 'ponto:retorno': 'pausa_fim' };

async function tratar(interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith('ponto:')) return;

  if (!podeBaterPonto(interaction.member, interaction.guildId)) {
    return interaction.reply({ content: '🚫 Você não tem permissão para usar o bate-ponto neste servidor.', flags: MessageFlags.Ephemeral });
  }

  if (interaction.customId === 'ponto:status') {
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
      .setTitle('📋 Seu status de ponto')
      .addFields(
        { name: 'Situação', value: situacaoLabel, inline: true },
        { name: 'Trabalhado hoje', value: relatorio.trabalhadoFormatado, inline: true },
      );
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  const tipo = BOTAO_PARA_TIPO[interaction.customId];
  if (!tipo) return;

  const resultado = pontoService.bater(interaction.guildId, interaction.user.id, tipo);
  if (resultado.resultado !== pontoService.RESULTADOS.OK) {
    return interaction.reply({ content: `⚠️ ${resultado.mensagem}`, flags: MessageFlags.Ephemeral });
  }

  const { emoji, verbo } = LABELS[tipo];
  await interaction.reply({ content: `${emoji} Você ${verbo} às <t:${Math.floor(Date.now() / 1000)}:T>.`, flags: MessageFlags.Ephemeral });
  await registrarLog(interaction.client, interaction.guildId, interaction.user, tipo);
}

module.exports = { tratar };
