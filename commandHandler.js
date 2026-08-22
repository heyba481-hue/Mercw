const fs = require('fs');
const path = require('path');

function listarArquivosJs(dir) {
  let resultado = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) resultado = resultado.concat(listarArquivosJs(caminho));
    else if (entrada.name.endsWith('.js')) resultado.push(caminho);
  }
  return resultado;
}

/** Carrega todos os comandos em src/commands/** e popula client.commands (Collection). */
function carregarComandos(client) {
  const pastaComandos = path.join(__dirname, '..', 'commands');
  const arquivos = listarArquivosJs(pastaComandos);

  for (const arquivo of arquivos) {
    const comando = require(arquivo);
    if (!comando?.data || !comando?.execute) {
      console.warn(`[commandHandler] Ignorando ${arquivo}: faltando "data" ou "execute".`);
      continue;
    }
    client.commands.set(comando.data.name, comando);
  }

  console.log(`[commandHandler] ${client.commands.size} comando(s) carregado(s).`);
  return client.commands;
}

module.exports = { carregarComandos, listarArquivosJs };
