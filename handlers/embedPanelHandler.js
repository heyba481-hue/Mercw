const { MessageFlags } = require('discord.js');
const embedSession = require('../utils/embedSession');
const embedTemplates = require('../embedTemplates');
const { construirPainel, construirEmbedClassico } = require('../builders/embedPreview');
const { montarPayloadV2 } = require('../builders/componentsV2');
const { modais, aplicarModal } = require('../modals/embedModals');

function sessaoDe(interaction) {
  return embedSession.obter(interaction.user.id, interaction.guildId, interaction.channelId);
}

async function atualizarPainel(interaction, sessao) {
  const painel = construirPainel(sessao);
  await interaction.update(painel);
}

// ---- Selects ----

async function onSelectModo(interaction) {
  const sessao = sessaoDe(interaction);
  sessao.modo = interaction.values[0];
  await atualizarPainel(interaction, sessao);
}

async function onSelectCanal(interaction) {
  const sessao = sessaoDe(interaction);
  sessao.canalDestinoId = interaction.values[0];
  await atualizarPainel(interaction, sessao);
}

const MODAIS_POR_OPCAO_CLASSICO = { basico: 'basico', cor: 'cor', autor: 'autor', footer: 'footer', imagens: 'imagens', add_campo: 'addCampo' };

async function onSelectEditarClassico(interaction) {
  const sessao = sessaoDe(interaction);
  const opcao = interaction.values[0];

  if (opcao === 'rem_campo') {
    sessao.classico.fields.pop();
    return atualizarPainel(interaction, sessao);
  }

  const modalKey = MODAIS_POR_OPCAO_CLASSICO[opcao];
  const modal = modais[modalKey](sessao);
  await interaction.showModal(modal);
}

const MODAIS_POR_OPCAO_V2 = { add_texto: 'addTexto', add_secao: 'addSecao', add_galeria: 'addGaleria', cor_v2: 'corV2' };

async function onSelectEditarV2(interaction) {
  const sessao = sessaoDe(interaction);
  const opcao = interaction.values[0];

  if (opcao === 'rem_bloco') {
    sessao.v2.blocks.pop();
    return atualizarPainel(interaction, sessao);
  }
  if (opcao === 'add_separador') {
    sessao.v2.blocks.push({ type: 'separador', linha: true, espacamento: 'small' });
    return atualizarPainel(interaction, sessao);
  }

  const modalKey = MODAIS_POR_OPCAO_V2[opcao];
  const modal = modais[modalKey](sessao);
  await interaction.showModal(modal);
}

// ---- Botões ----

async function onBotaoPreview(interaction) {
  const sessao = sessaoDe(interaction);
  if (sessao.modo === 'v2') {
    if (!sessao.v2.blocks.length) {
      return interaction.reply({ content: '⚠️ Adicione ao menos um bloco antes de visualizar.', flags: MessageFlags.Ephemeral });
    }
    await interaction.reply({ ...montarPayloadV2(sessao.v2), flags: MessageFlags.Ephemeral });
  } else {
    await interaction.reply({ embeds: [construirEmbedClassico(sessao)], flags: MessageFlags.Ephemeral });
  }
}

async function onBotaoEnviar(interaction) {
  const sessao = sessaoDe(interaction);
  if (!sessao.canalDestinoId) {
    return interaction.reply({ content: '⚠️ Selecione um canal de destino no painel antes de enviar.', flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const canal = await interaction.client.channels.fetch(sessao.canalDestinoId);
    if (sessao.modo === 'v2') {
      if (!sessao.v2.blocks.length) return interaction.editReply('⚠️ Adicione ao menos um bloco antes de enviar.');
      await canal.send(montarPayloadV2(sessao.v2));
    } else {
      await canal.send({ embeds: [construirEmbedClassico(sessao)] });
    }
    await interaction.editReply(`✅ Enviado em <#${sessao.canalDestinoId}>!`);
  } catch (err) {
    console.error('[embedPanelHandler] Erro ao enviar:', err);
    await interaction.editReply('❌ Não consegui enviar. Verifique se o bot tem permissão de enviar mensagens no canal escolhido.');
  }
}

async function onBotaoSalvar(interaction) {
  const sessao = sessaoDe(interaction);
  await interaction.showModal(modais.salvarTemplate());
}

async function onBotaoCarregar(interaction) {
  await interaction.showModal(modais.carregarTemplate());
}

async function onBotaoCancelar(interaction) {
  embedSession.limpar(interaction.user.id, interaction.guildId);
  await interaction.update({ content: '❌ Criação cancelada. Use `/embed-builder` para começar de novo.', components: [] });
}

// ---- Modais ----

async function onModalSubmit(interaction) {
  const sessao = sessaoDe(interaction);

  if (interaction.customId === 'embmodal:salvar_template') {
    const nome = interaction.fields.getTextInputValue('nome').trim();
    const dados = sessao.modo === 'v2' ? sessao.v2 : sessao.classico;
    embedTemplates.salvar(interaction.guildId, nome, interaction.user.id, dados, sessao.modo);
    sessao.templateName = nome;
    return atualizarPainel(interaction, sessao);
  }

  if (interaction.customId === 'embmodal:carregar_template') {
    const nome = interaction.fields.getTextInputValue('nome').trim();
    const tpl = embedTemplates.buscarPorNome(interaction.guildId, nome);
    if (!tpl) {
      return interaction.reply({ content: `❌ Template \`${nome}\` não encontrado.`, flags: MessageFlags.Ephemeral });
    }
    sessao.modo = tpl.modo;
    sessao.templateName = nome;
    if (tpl.modo === 'v2') sessao.v2 = tpl.dados;
    else sessao.classico = tpl.dados;
    return atualizarPainel(interaction, sessao);
  }

  const resultado = aplicarModal(interaction.customId, interaction.fields, sessao);
  if (!resultado.ok) {
    return interaction.reply({ content: `⚠️ ${resultado.erro}`, flags: MessageFlags.Ephemeral });
  }
  return atualizarPainel(interaction, sessao);
}

// ---- Router ----

async function tratar(interaction) {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'emb:modo') return onSelectModo(interaction);
    if (interaction.customId === 'emb:editar_classico') return onSelectEditarClassico(interaction);
    if (interaction.customId === 'emb:editar_v2') return onSelectEditarV2(interaction);
  }
  if (interaction.isChannelSelectMenu() && interaction.customId === 'emb:canal') return onSelectCanal(interaction);

  if (interaction.isButton()) {
    if (interaction.customId === 'emb:preview') return onBotaoPreview(interaction);
    if (interaction.customId === 'emb:enviar') return onBotaoEnviar(interaction);
    if (interaction.customId === 'emb:salvar') return onBotaoSalvar(interaction);
    if (interaction.customId === 'emb:carregar') return onBotaoCarregar(interaction);
    if (interaction.customId === 'emb:cancelar') return onBotaoCancelar(interaction);
    // Botões de acessório de seção (Components V2) sem ação real — evita erro de interação.
    if (interaction.customId.startsWith('emb:acc:')) {
      return interaction.reply({ content: 'Este é apenas um botão de exemplo do seu embed.', flags: MessageFlags.Ephemeral });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('embmodal:')) return onModalSubmit(interaction);
}

module.exports = { tratar };
