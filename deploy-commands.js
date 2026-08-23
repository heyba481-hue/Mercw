// Registra (ou atualiza) os slash commands no Discord.
// Pode ser chamado tanto por "npm run deploy" quanto automaticamente
// pelo próprio index.js no boot (útil quando não há acesso a shell/terminal).

const { REST, Routes } = require('discord.js');
const config = require('./config');
const { listarArquivosJs } = require('./handlers/commandHandler');
const path = require('path');

function coletarComandos() {
  const pastaComandos = path.join(__dirname, 'commands');
  const arquivos = listarArquivosJs(pastaComandos);
  return arquivos.map((arquivo) => require(arquivo).data.toJSON());
}

async function registrarComandos() {
  const comandos = coletarComandos();
  const rest = new REST().setToken(config.token);

  console.log(`[deploy] Registrando ${comandos.length} comando(s)...`);

  const rota = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  const resultado = await rest.put(rota, { body: comandos });
  console.log(`[deploy] ✅ ${resultado.length} comando(s) registrado(s) ${config.guildId ? `no servidor ${config.guildId}` : 'globalmente'}.`);
  return resultado;
}

// Se o arquivo for rodado diretamente (npm run deploy), executa e encerra.
if (require.main === module) {
  registrarComandos().catch((err) => {
    console.error('[deploy] ❌ Falha ao registrar comandos:', err);
    process.exit(1);
  });
}

module.exports = { registrarComandos };
