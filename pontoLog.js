const { EmbedBuilder } = require('discord.js');
const pontoModel = require('../database/models/ponto');

const LABELS = {
  entrada: { texto: 'bateu entrada', cor: 0x57f287, emoji: '🟢' },
  saida: { texto: 'bateu saída', cor: 0xed4245, emoji: '🔴' },
  pausa_inicio: { texto: 'entrou em pausa', cor: 0xfee75c, emoji: '⏸️' },
  pausa_fim: { texto: 'retornou da pausa', cor: 0x5865f2, emoji: '▶️' },
};

async function registrarLog(client, guildId, user, tipo) {
  const cfg = pontoModel.getConfig(guildId);
  if (!cfg.canal_log_id) return;

  try {
    const canal = await client.channels.fetch(cfg.canal_log_id);
    if (!canal?.isTextBased()) return;

    const info = LABELS[tipo];
    const embed = new EmbedBuilder()
      .setColor(info.cor)
      .setAuthor({ name: user.displayName ?? user.username, iconURL: user.displayAvatarURL() })
      .setDescription(`${info.emoji} <@${user.id}> **${info.texto}**`)
      .setTimestamp();

    await canal.send({ embeds: [embed] });
  } catch (err) {
    console.error('[pontoLog] Falha ao enviar log de ponto:', err.message);
  }
}

module.exports = { registrarLog };

