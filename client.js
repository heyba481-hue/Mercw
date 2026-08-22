const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { carregarComandos } = require('./handlers/commandHandler');
const { carregarEventos } = require('./handlers/eventHandler');

function criarClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
  });

  client.commands = new Collection();

  carregarComandos(client);
  carregarEventos(client);

  return client;
}

module.exports = { criarClient };

