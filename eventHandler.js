const fs = require('fs');
const path = require('path');

function carregarEventos(client) {
  const pastaEventos = path.join(__dirname, '..', 'events');
  const arquivos = fs.readdirSync(pastaEventos).filter((f) => f.endsWith('.js'));

  for (const arquivo of arquivos) {
    const evento = require(path.join(pastaEventos, arquivo));
    if (evento.once) client.once(evento.name, (...args) => evento.execute(...args));
    else client.on(evento.name, (...args) => evento.execute(...args));
  }

  console.log(`[eventHandler] ${arquivos.length} evento(s) carregado(s).`);
}

module.exports = { carregarEventos };

