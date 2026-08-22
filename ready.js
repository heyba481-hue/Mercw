const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`[bot] Conectado como ${client.user.tag} (${client.guilds.cache.size} servidor(es)).`);
    client.user.setPresence({
      activities: [{ name: '/ponto e /embed-builder', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};

