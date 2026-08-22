const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');
const config = require('../config');

/** Monta o EmbedBuilder "clássico" a partir dos dados salvos na sessão. */
function construirEmbedClassico(sessao) {
  const c = sessao.classico;
  const embed = new EmbedBuilder().setColor(c.color ?? config.embedColorDefault);

  if (c.title) embed.setTitle(c.title.slice(0, 256));
  if (c.description) embed.setDescription(c.description.slice(0, 4096));
  if (c.url) embed.setURL(c.url);
  if (c.thumbnail) embed.setThumbnail(c.thumbnail);
  if (c.image) embed.setImage(c.image);
  if (c.footerText) embed.setFooter({ text: c.footerText.slice(0, 2048), iconURL: c.footerIcon || undefined });
  if (c.authorName) embed.setAuthor({ name: c.authorName.slice(0, 256), iconURL: c.authorIcon || undefined, url: c.authorUrl || undefined });
  if (c.timestamp) embed.setTimestamp();
  if (c.fields.length) {
    embed.addFields(c.fields.slice(0, 25).map((f) => ({
      name: f.name.slice(0, 256),
      value: f.value.slice(0, 1024),
      inline: Boolean(f.inline),
    })));
  }

  return embed;
}

function resumoStatus(sessao) {
  const modoLabel = sessao.modo === 'v2' ? 'Components V2 (container avançado)' : 'Embed clássico';
  const canal = sessao.canalDestinoId ? `<#${sessao.canalDestinoId}>` : '_nenhum selecionado_';
  const nomeTpl = sessao.templateName ? `\`${sessao.templateName}\`` : '_sem nome ainda_';
  let detalhe;
  if (sessao.modo === 'v2') {
    detalhe = `Blocos adicionados: **${sessao.v2.blocks.length}**`;
  } else {
    const c = sessao.classico;
    detalhe = `Título: ${c.title ? '✅' : '❌'} · Descrição: ${c.description ? '✅' : '❌'} · Campos: **${c.fields.length}**`;
  }
  return [
    `### 🛠️ Painel de criação — modo: **${modoLabel}**`,
    detalhe,
    `Canal de destino: ${canal} · Template: ${nomeTpl}`,
  ].join('\n');
}

/** Linhas de controle comuns aos dois modos (topo do painel). */
function linhaModoEDestino(sessao) {
  const selectModo = new StringSelectMenuBuilder()
    .setCustomId('emb:modo')
    .setPlaceholder('Modo de criação')
    .addOptions(
      { label: 'Embed clássico', value: 'classico', description: 'Título, descrição, cor, campos, footer...', default: sessao.modo === 'classico', emoji: '📇' },
      { label: 'Components V2', value: 'v2', description: 'Container com texto, seções, galeria, separadores', default: sessao.modo === 'v2', emoji: '🧩' },
    );

  const selectCanal = new ChannelSelectMenuBuilder()
    .setCustomId('emb:canal')
    .setPlaceholder('Canal de destino para enviar')
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setMinValues(1)
    .setMaxValues(1);

  return [
    new ActionRowBuilder().addComponents(selectModo),
    new ActionRowBuilder().addComponents(selectCanal),
  ];
}

/** Opções de edição específicas do modo clássico. */
function linhaEdicaoClassico() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('emb:editar_classico')
    .setPlaceholder('✏️ O que deseja editar?')
    .addOptions(
      { label: 'Título, descrição e URL', value: 'basico', emoji: '📝' },
      { label: 'Cor', value: 'cor', emoji: '🎨' },
      { label: 'Autor', value: 'autor', emoji: '👤' },
      { label: 'Footer (rodapé)', value: 'footer', emoji: '📎' },
      { label: 'Thumbnail e imagem', value: 'imagens', emoji: '🖼️' },
      { label: 'Adicionar campo', value: 'add_campo', emoji: '➕' },
      { label: 'Remover último campo', value: 'rem_campo', emoji: '➖' },
    );
  return [new ActionRowBuilder().addComponents(select)];
}

/** Opções de edição específicas do modo Components V2. */
function linhaEdicaoV2() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('emb:editar_v2')
    .setPlaceholder('🧩 Adicionar bloco / editar')
    .addOptions(
      { label: 'Adicionar texto', value: 'add_texto', emoji: '📝' },
      { label: 'Adicionar separador', value: 'add_separador', emoji: '➖' },
      { label: 'Adicionar seção (texto + botão/imagem)', value: 'add_secao', emoji: '📐' },
      { label: 'Adicionar galeria de imagens', value: 'add_galeria', emoji: '🖼️' },
      { label: 'Definir cor de destaque', value: 'cor_v2', emoji: '🎨' },
      { label: 'Remover último bloco', value: 'rem_bloco', emoji: '🗑️' },
    );
  return [new ActionRowBuilder().addComponents(select)];
}

/** Botões de ação finais (preview, enviar, template, cancelar). */
function linhaAcoes() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('emb:preview').setLabel('Visualizar').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('emb:enviar').setLabel('Enviar').setEmoji('📤').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('emb:salvar').setLabel('Salvar template').setEmoji('💾').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('emb:carregar').setLabel('Carregar template').setEmoji('📂').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('emb:cancelar').setLabel('Cancelar').setEmoji('✖️').setStyle(ButtonStyle.Danger),
    ),
  ];
}

function construirPainel(sessao) {
  const linhas = [
    ...linhaModoEDestino(sessao),
    ...(sessao.modo === 'v2' ? linhaEdicaoV2() : linhaEdicaoClassico()),
    ...linhaAcoes(),
  ];
  return {
    content: resumoStatus(sessao),
    components: linhas.slice(0, 5), // Discord permite no máx. 5 action rows
  };
}

module.exports = { construirEmbedClassico, construirPainel, resumoStatus };

