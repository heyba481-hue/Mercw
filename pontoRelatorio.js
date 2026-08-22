const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const pontoService = require('../../services/pontoService');
const { inicioDoDia, inicioDaSemana, inicioDoMes } = require('../../utils/time');
const { podeGerenciar } = require('../../utils/permissions');

const PERIODOS = {
  hoje: () => inicioDoDia(),
  semana: () => inicioDaSemana(),
  mes: () => inicioDoMes(),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ponto-relatorio')
    .setDescription('Mostra o relatório de horas trabalhadas.')
    .addStringOption((o) =>
      o
        .setName('periodo')
        .setDescription('Período do relatório')
        .addChoices({ name: 'Hoje', value: 'hoje' }, { name: 'Esta semana', value: 'semana' }, { name: 'Este mês', value: 'mes' }),
    )
    .addUserOption((o) => o.setName('usuario').setDescription('Ver relatório de outro membro (requer permissão de gestão)')),
  async execute(interaction) {
    const periodoChave = interaction.options.getString('periodo') || 'hoje';
    const alvo = interaction.options.getUser('usuario');

    if (alvo && alvo.id !== interaction.user.id && !podeGerenciar(interaction.member)) {
      return interaction.reply({ content: '🚫 Você só pode ver o relatório de outra pessoa se tiver permissão de gestão.', flags: MessageFlags.Ephemeral });
    }

    const usuarioFinal = alvo || interaction.user;
    const inicio = PERIODOS[periodoChave]();
    const relatorio = pontoService.relatorioUsuario(interaction.guildId, usuarioFinal.id, inicio, Date.now());

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: usuarioFinal.displayName ?? usuarioFinal.username, iconURL: usuarioFinal.displayAvatarURL() })
      .setTitle(`📊 Relatório de ponto — ${periodoChave}`)
      .addFields(
        { name: 'Horas trabalhadas', value: relatorio.trabalhadoFormatado, inline: true },
        { name: 'Tempo em pausa', value: relatorio.pausaFormatada, inline: true },
        { name: 'Registros no período', value: String(relatorio.registros.length), inline: true },
      );

    if (relatorio.emAberto) embed.setFooter({ text: '⚠️ Existe um expediente ou pausa ainda em aberto — o tempo até agora foi contabilizado.' });

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

