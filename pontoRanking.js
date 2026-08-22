const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const pontoService = require('../../services/pontoService');
const { formatarDuracao, inicioDaSemana, inicioDoMes } = require('../../utils/time');

const PERIODOS = {
  semana: () => inicioDaSemana(),
  mes: () => inicioDoMes(),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto-ranking')
    .setDescription('Mostra o ranking de horas trabalhadas no servidor.')
    .addStringOption((o) =>
      o
        .setName('periodo')
        .setDescription('Período do ranking')
        .addChoices({ name: 'Esta semana', value: 'semana' }, { name: 'Este mês', value: 'mes' }),
    ),
  async execute(interaction) {
    const periodoChave = interaction.options.getString('periodo') || 'semana';
    const inicio = PERIODOS[periodoChave]();
    const ranking = pontoService.rankingServidor(interaction.guildId, inicio, Date.now()).slice(0, 10);

    if (!ranking.length) {
      return interaction.reply({ content: 'Ainda não há registros de ponto neste período.', flags: MessageFlags.Ephemeral });
    }

    const medalhas = ['🥇', '🥈', '🥉'];
    const texto = ranking
      .map((r, i) => `${medalhas[i] || `**${i + 1}.**`} <@${r.userId}> — ${formatarDuracao(r.trabalhadoMs)}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏆 Ranking de ponto — ${periodoChave}`)
      .setDescription(texto);

    return interaction.reply({ embeds: [embed] });
  },
};

