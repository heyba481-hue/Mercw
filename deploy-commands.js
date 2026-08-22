// Registra (ou atualiza) os slash commands no Discord.
// Rode com: npm run deploy
// Usa GUILD_ID (se definido) pra registrar só num servidor = instantâneo, ótimo pra testar.
// Sem GUILD_ID, registra global = pode levar até 1h pra propagar.

const { REST, Routes } = require('discord.js');
const config = require('./config');
const { listarArquivosJs } = require('./commandHandler');
const path = require('path');

function coletarComandos() {
  const pastaComandos = path.join(__dirname, 'commands');
  const arquivos = listarArquivosJs(pastaComandos);
  return arquivos.map((arquivo) => require(arquivo).data.toJSON());
}

(async () => {
  const comandos = coletarComandos();
  const rest = new REST().setToken(config.token);

  try {
    console.log(`[deploy] Registrando ${comandos.length} comando(s)...`);

    const rota = config.guildId
      ? Routes.applicationGuildCommands(config.clientId, config.guildId)
      : Routes.applicationCommands(config.clientId);

    const resultado = await rest.put(rota, { body: comandos });

    console.log(`[deploy] ✅ ${resultado.length} comando(s) registrado(s) ${config.guildId ? `no servidor ${config.guildId}` : 'globalmente'}.`);
  } catch (err) {
    console.error('[deploy] ❌ Falha ao registrar comandos:', err);
    process.exit(1);
  }
})();
