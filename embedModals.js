const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function linha(input) {
  return new ActionRowBuilder().addComponents(input);
}

function campoOpcional(customId, label, style = TextInputStyle.Short, placeholder = '') {
  return new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style)
    .setRequired(false)
    .setPlaceholder(placeholder);
}

const modais = {
  basico(sessao) {
    const c = sessao.classico;
    const modal = new ModalBuilder().setCustomId('embmodal:basico').setTitle('Título, descrição e URL');
    modal.addComponents(
      linha(campoOpcional('title', 'Título', TextInputStyle.Short, 'Ex: Bem-vindo ao servidor!').setValue(c.title || '')),
      linha(campoOpcional('description', 'Descrição', TextInputStyle.Paragraph, 'Texto principal do embed').setValue(c.description || '')),
      linha(campoOpcional('url', 'URL do título (opcional)', TextInputStyle.Short, 'https://...').setValue(c.url || '')),
    );
    return modal;
  },
  cor(sessao) {
    const modal = new ModalBuilder().setCustomId('embmodal:cor').setTitle('Cor do embed');
    modal.addComponents(
      linha(campoOpcional('color', 'Cor em HEX (ex: #5865F2)', TextInputStyle.Short, '#5865F2')
        .setValue(sessao.classico.color != null ? `#${sessao.classico.color.toString(16).padStart(6, '0')}` : '')),
    );
    return modal;
  },
  autor(sessao) {
    const c = sessao.classico;
    const modal = new ModalBuilder().setCustomId('embmodal:autor').setTitle('Autor do embed');
    modal.addComponents(
      linha(campoOpcional('authorName', 'Nome do autor').setValue(c.authorName || '')),
      linha(campoOpcional('authorIcon', 'URL do ícone do autor').setValue(c.authorIcon || '')),
      linha(campoOpcional('authorUrl', 'URL do link do autor').setValue(c.authorUrl || '')),
    );
    return modal;
  },
  footer(sessao) {
    const c = sessao.classico;
    const modal = new ModalBuilder().setCustomId('embmodal:footer').setTitle('Footer e timestamp');
    modal.addComponents(
      linha(campoOpcional('footerText', 'Texto do footer').setValue(c.footerText || '')),
      linha(campoOpcional('footerIcon', 'URL do ícone do footer').setValue(c.footerIcon || '')),
      linha(campoOpcional('timestamp', 'Mostrar data/hora atual? (sim/nao)').setValue(c.timestamp ? 'sim' : 'nao')),
    );
    return modal;
  },
  imagens(sessao) {
    const c = sessao.classico;
    const modal = new ModalBuilder().setCustomId('embmodal:imagens').setTitle('Thumbnail e imagem');
    modal.addComponents(
      linha(campoOpcional('thumbnail', 'URL da thumbnail (imagem pequena)').setValue(c.thumbnail || '')),
      linha(campoOpcional('image', 'URL da imagem grande').setValue(c.image || '')),
    );
    return modal;
  },
  addCampo() {
    const modal = new ModalBuilder().setCustomId('embmodal:add_campo').setTitle('Adicionar campo');
    modal.addComponents(
      linha(new TextInputBuilder().setCustomId('name').setLabel('Nome do campo').setStyle(TextInputStyle.Short).setRequired(true)),
      linha(new TextInputBuilder().setCustomId('value').setLabel('Valor do campo').setStyle(TextInputStyle.Paragraph).setRequired(true)),
      linha(campoOpcional('inline', 'Lado a lado com outros campos? (sim/nao)', TextInputStyle.Short, 'sim')),
    );
    return modal;
  },
  addTexto() {
    const modal = new ModalBuilder().setCustomId('embmodal:add_texto').setTitle('Adicionar bloco de texto');
    modal.addComponents(
      linha(new TextInputBuilder().setCustomId('conteudo').setLabel('Conteúdo (aceita markdown)').setStyle(TextInputStyle.Paragraph).setRequired(true)),
    );
    return modal;
  },
  addSecao() {
    const modal = new ModalBuilder().setCustomId('embmodal:add_secao').setTitle('Adicionar seção');
    modal.addComponents(
      linha(new TextInputBuilder().setCustomId('conteudo').setLabel('Texto da seção').setStyle(TextInputStyle.Paragraph).setRequired(true)),
      linha(campoOpcional('thumbUrl', 'URL de imagem pequena ao lado (opcional)')),
      linha(campoOpcional('botaoLabel', 'Texto do botão de acessório (opcional)')),
      linha(campoOpcional('botaoUrl', 'URL do botão (deixe vazio pra botão sem link)')),
    );
    return modal;
  },
  addGaleria() {
    const modal = new ModalBuilder().setCustomId('embmodal:add_galeria').setTitle('Adicionar galeria de imagens');
    modal.addComponents(
      linha(new TextInputBuilder()
        .setCustomId('urls')
        .setLabel('URLs das imagens (uma por linha, até 10)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)),
    );
    return modal;
  },
  corV2(sessao) {
    const modal = new ModalBuilder().setCustomId('embmodal:cor_v2').setTitle('Cor de destaque do container');
    modal.addComponents(
      linha(campoOpcional('color', 'Cor em HEX (ex: #5865F2)', TextInputStyle.Short, '#5865F2')
        .setValue(sessao.v2.accentColor != null ? `#${sessao.v2.accentColor.toString(16).padStart(6, '0')}` : '')),
    );
    return modal;
  },
  salvarTemplate() {
    const modal = new ModalBuilder().setCustomId('embmodal:salvar_template').setTitle('Salvar como template');
    modal.addComponents(
      linha(new TextInputBuilder().setCustomId('nome').setLabel('Nome do template').setStyle(TextInputStyle.Short).setRequired(true)),
    );
    return modal;
  },
  carregarTemplate() {
    const modal = new ModalBuilder().setCustomId('embmodal:carregar_template').setTitle('Carregar template salvo');
    modal.addComponents(
      linha(new TextInputBuilder().setCustomId('nome').setLabel('Nome exato do template').setStyle(TextInputStyle.Short).setRequired(true)),
    );
    return modal;
  },
};

function parseHexColor(valor) {
  if (!valor) return null;
  const limpo = valor.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) return undefined; // undefined = inválido
  return parseInt(limpo, 16);
}

function parseSimNao(valor, padrao = false) {
  if (!valor) return padrao;
  return ['sim', 's', 'yes', 'y', 'true'].includes(valor.trim().toLowerCase());
}

/** Aplica os campos de um modal submetido diretamente na sessão (mutação). */
function aplicarModal(customId, fields, sessao) {
  const get = (id) => fields.getTextInputValue(id)?.trim();

  switch (customId) {
    case 'embmodal:basico':
      sessao.classico.title = get('title') || null;
      sessao.classico.description = get('description') || null;
      sessao.classico.url = get('url') || null;
      return { ok: true };

    case 'embmodal:cor': {
      const cor = parseHexColor(get('color'));
      if (cor === undefined) return { ok: false, erro: 'Cor inválida. Use o formato #RRGGBB.' };
      sessao.classico.color = cor;
      return { ok: true };
    }

    case 'embmodal:autor':
      sessao.classico.authorName = get('authorName') || null;
      sessao.classico.authorIcon = get('authorIcon') || null;
      sessao.classico.authorUrl = get('authorUrl') || null;
      return { ok: true };

    case 'embmodal:footer':
      sessao.classico.footerText = get('footerText') || null;
      sessao.classico.footerIcon = get('footerIcon') || null;
      sessao.classico.timestamp = parseSimNao(get('timestamp'), false);
      return { ok: true };

    case 'embmodal:imagens':
      sessao.classico.thumbnail = get('thumbnail') || null;
      sessao.classico.image = get('image') || null;
      return { ok: true };

    case 'embmodal:add_campo':
      if (sessao.classico.fields.length >= 25) return { ok: false, erro: 'Limite de 25 campos atingido.' };
      sessao.classico.fields.push({ name: get('name'), value: get('value'), inline: parseSimNao(get('inline'), true) });
      return { ok: true };

    case 'embmodal:add_texto':
      sessao.v2.blocks.push({ type: 'texto', conteudo: get('conteudo') });
      return { ok: true };

    case 'embmodal:add_secao': {
      const bloco = { type: 'secao', conteudo: get('conteudo'), acessorio: null };
      const thumbUrl = get('thumbUrl');
      const botaoLabel = get('botaoLabel');
      if (thumbUrl) {
        bloco.acessorio = { tipo: 'thumbnail', url: thumbUrl };
      } else if (botaoLabel) {
        bloco.acessorio = { tipo: 'botao', label: botaoLabel, url: get('botaoUrl') || null, customId: `emb:acc:${Date.now()}` };
      }
      sessao.v2.blocks.push(bloco);
      return { ok: true };
    }

    case 'embmodal:add_galeria': {
      const urls = (get('urls') || '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 10);
      if (!urls.length) return { ok: false, erro: 'Informe ao menos uma URL válida.' };
      sessao.v2.blocks.push({ type: 'galeria', itens: urls.map((url) => ({ url })) });
      return { ok: true };
    }

    case 'embmodal:cor_v2': {
      const cor = parseHexColor(get('color'));
      if (cor === undefined) return { ok: false, erro: 'Cor inválida. Use o formato #RRGGBB.' };
      sessao.v2.accentColor = cor;
      return { ok: true };
    }

    default:
      return { ok: false, erro: 'Ação de modal desconhecida.' };
  }
}

module.exports = { modais, aplicarModal, parseSimNao };
      
