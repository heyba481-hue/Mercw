// Config central. Tudo vem de variáveis de ambiente (Render/Railway).
// NÃO existe campo de token em nenhum outro arquivo — só aqui, lido do ambiente.
require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[config] Variável de ambiente obrigatória ausente: ${name}`);
    console.error('[config] Configure-a no painel do Render/Railway (Environment Variables) antes de iniciar o bot.');
    process.exit(1);
  }
  return value;
}

module.exports = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: process.env.GUILD_ID || null,
  adminRoleId: process.env.ADMIN_ROLE_ID || null,
  databasePath: process.env.DATABASE_PATH || './data/bot.sqlite',
  embedColorDefault: 0x5865f2,
};

