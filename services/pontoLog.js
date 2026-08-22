const db = require('../db');
const { EmbedBuilder } = require('discord.js');

const LABELS = {
  entrada: { verbo: 'bateu entrada', emoji: '🟢' },
  saida: { verbo: 'bateu saída', emoji: '🔴' },
  pausa_inicio: { verbo: 'entrou em pausa', emoji: '⏸️' },
  pausa_fim: { verbo: 'retornou da pausa', emoji: '▶️' },
};

async function registrarLog(client, guildId, user, tipo) {
  try {
    const stmt = db.prepare('SELECT canal_log_id FROM ponto_config WHERE guild_id = ?');
    const config = stmt.get(guildId);
    
    if (!config || !config.canal_log_id) return;
    
    const canal = await client.channels.fetch(config.canal_log_id);
    if (!canal) return;
    
    const { emoji, verbo } = LABELS[tipo];
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${emoji} Registro de Ponto`)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setDescription(`**${user}** ${verbo}`)
      .setTimestamp();
    
    await canal.send({ embeds: [embed] });
  } catch (err) {
    console.error('[pontoLog] Erro ao registrar log:', err);
  }
}

module.exports = { registrarLog };
