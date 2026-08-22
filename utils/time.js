function inicioDoDia() {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return agora.getTime();
}

function formatarDuracao(ms) {
  const horas = Math.floor(ms / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  return `${horas}h ${minutos}m`;
}

module.exports = { inicioDoDia, formatarDuracao };
