const config = require('./src/config');
const { criarClient } = require('./src/client');
const { registrarComandos } = require('./src/deploy-commands');

async function iniciar() {
  try {
    await registrarComandos();
  } catch (err) {
    console.error('[index] Falha ao registrar comandos automaticamente (o bot vai subir mesmo assim):', err.message);
  }

  const client = criarClient();
  await client.login(config.token).catch((err) => {
    console.error('[index] Falha ao logar no Discord. Verifique se DISCORD_TOKEN está correto.', err);
    process.exit(1);
  });
}

iniciar();

process.on('unhandledRejection', (err) => {
  console.error('[index] Rejeição de Promise não tratada:', err);
});
