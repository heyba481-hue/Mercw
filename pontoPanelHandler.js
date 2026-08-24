const { EmbedBuilder } = require('discord.js');
const pontoService = require('./pontoService.js');
const pontoModel = require('./pontso.js');

async function tratar(interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith('ponto:')) return;

  if (interaction.customId === 'ponto:toggle') {
    const { situacao } = pontoService.statusAtual(interaction.guildId, interaction.user.id);
    const vaiAbrir = situacao !== 'trabalhando' && situacao !== 'em_pausa';
    const tipo = vaiAbrir ? 'entrada' : 'saida';

    const resultado = pontoService.bater(interaction.guildId, interaction.user.id, tipo);
    if (resultado.resultado !== pontoService.RESULTADOS.OK) {
      return interaction.reply(`⚠️ ${resultado.mensagem}`);
    }

    const registros = pontoModel.registrosPeriodo(interaction.guildId, interaction.user.id, 0, Date.now());
    const numero = registros.length;
    const agora = new Date();
    const horaFmt = agora.toLocaleTimeString('pt-BR');
    const dataFmt = agora.toLocaleDateString('pt-BR');

    const embed = new EmbedBuilder()
      .setColor(vaiAbrir ? 0x57f287 : 0xed4245)
      .setAuthor({ name: `${vaiAbrir ? 'Ponto Aberto' : 'Ponto Encerrado'} • ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
      .setDescription(vaiAbrir ? '**EM SERVIÇO**\nSeu turno foi iniciado. Clique novamente em **Bater Ponto** para encerrar.' : '**SAÍDA REGISTRADA**\nSeu turno foi encerrado com sucesso.')
      .addFields({ name: '📥 Entrada' + (vaiAbrir ? '' : '/📤 Saída'), value: `${horaFmt} — ${dataFmt}`, inline: false })
      .setFooter({ text: `Registro #${numero} — ${dataFmt} ${horaFmt}` });

    return interaction.reply({ embeds: [embed] }); // SEM flags = mensagem pública
  }

  if (interaction.customId === 'ponto:reabrir') {
    const ultimo = pontoModel.ultimoRegistro(interaction.guildId, interaction.user.id);
    if (!ultimo || ultimo.tipo !== 'saida') {
      return interaction.reply({ content: '⚠️ Não há um ponto encerrado pra reabrir.', flags: 64 });
    }
    pontoModel.removerRegistro(ultimo.id, interaction.guildId);
    return interaction.reply(`🔄 Ponto reaberto por ${interaction.user}. Seu turno voltou a ficar em serviço.`);
  }
}

module.exports = { tratar };
