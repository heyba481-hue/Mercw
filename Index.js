const config = require('./src/config');
const { criarClient } = require('./src/client');

const client = criarClient();

client.login(config.token).catch((err) => {
  console.error('[index] Falha ao logar no Discord. Verifique se DISCORD_TOKEN está correto.', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('[index] Rejeição de Promise não tratada:', err);
});

