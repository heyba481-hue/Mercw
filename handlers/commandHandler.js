const fs = require('fs');
const path = require('path');

function carregarComandos(client) {
  const pastaComandos = path.join(__dirname, '..', 'commands');
  
  // Verificar se pasta existe
  if (!fs.existsSync(pastaComandos)) {
    console.warn(`[commandHandler] Pasta de comandos não encontrada: ${pastaComandos}`);
    return client.commands;
  }

  function listarArquivosJs(dir) {
    let resultado = [];
    if (!fs.existsSync(dir)) return resultado;
    
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
      const caminho = path.join(dir, entrada.name);
      if (entrada.isDirectory()) resultado = resultado.concat(listarArquivosJs(caminho));
      else if (entrada.name.endsWith('.js')) resultado.push(caminho);
    }
    return resultado;
  }

  const arquivos = listarArquivosJs(pastaComandos);

  for (const arquivo of arquivos) {
    try {
      const comando = require(arquivo);
      if (!comando?.data || !comando?.execute) {
        console.warn(`[commandHandler] Ignorando ${arquivo}: faltando "data" ou "execute".`);
        continue;
      }
      client.commands.set(comando.data.name, comando);
    } catch (err) {
      console.error(`[commandHandler] Erro ao carregar comando ${arquivo}:`, err.message);
    }
  }

  console.log(`[commandHandler] ${client.commands.size} comando(s) carregado(s).`);
  return client.commands;
}

function listarArquivosJs(dir) {
  let resultado = [];
  if (!fs.existsSync(dir)) return resultado;
  
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) resultado = resultado.concat(listarArquivosJs(caminho));
    else if (entrada.name.endsWith('.js')) resultado.push(caminho);
  }
  return resultado;
}

module.exports = { carregarComandos, listarArquivosJs };
