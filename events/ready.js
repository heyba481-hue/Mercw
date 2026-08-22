const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[bot] Conectado como ${client.user.tag} (${client.guilds.cache.size} servidor(es)).`);
    client.user.setPresence({
      activities: [{ name: '/ponto e /embed-builder', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
