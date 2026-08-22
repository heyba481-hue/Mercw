// Converte os "blocos" salvos na sessão (formato simples, serializável em JSON)
// para os builders reais de Components V2 do discord.js.
//
// Tipos de bloco suportados (session.v2.blocks[i].type):
//   'texto'      -> TextDisplayBuilder
//   'separador'  -> SeparatorBuilder
//   'secao'      -> SectionBuilder (texto + botão OU thumbnail de acessório)
//   'galeria'    -> MediaGalleryBuilder (até 10 imagens)

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

function construirBlocoTexto(bloco) {
  return new TextDisplayBuilder().setContent(bloco.conteudo || '\u200b');
}

function construirBlocoSeparador(bloco) {
  return new SeparatorBuilder()
    .setDivider(bloco.linha !== false)
    .setSpacing(bloco.espacamento === 'grande' ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small);
}

function construirBlocoSecao(bloco) {
  const section = new SectionBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(bloco.conteudo || '\u200b'),
  );

  if (bloco.acessorio?.tipo === 'thumbnail' && bloco.acessorio.url) {
    section.setThumbnailAccessory(
      new ThumbnailBuilder().setURL(bloco.acessorio.url).setDescription(bloco.acessorio.descricao || null),
    );
  } else if (bloco.acessorio?.tipo === 'botao' && bloco.acessorio.label) {
    const botao = new ButtonBuilder().setLabel(bloco.acessorio.label);
    if (bloco.acessorio.url) {
      botao.setStyle(ButtonStyle.Link).setURL(bloco.acessorio.url);
    } else {
      botao.setStyle(ButtonStyle.Primary).setCustomId(bloco.acessorio.customId || `noop:${Date.now()}`);
    }
    section.setButtonAccessory(botao);
  }

  return section;
}

function construirBlocoGaleria(bloco) {
  const galeria = new MediaGalleryBuilder();
  for (const item of bloco.itens || []) {
    if (!item.url) continue;
    galeria.addItems((mediaItem) =>
      mediaItem.setURL(item.url).setDescription(item.descricao || null).setSpoiler(Boolean(item.spoiler)),
    );
  }
  return galeria;
}

/** Monta o ContainerBuilder final a partir dos blocos salvos na sessão. */
function construirContainer(sessaoV2) {
  const container = new ContainerBuilder();
  if (sessaoV2.accentColor !== null && sessaoV2.accentColor !== undefined) {
    container.setAccentColor(sessaoV2.accentColor);
  }

  for (const bloco of sessaoV2.blocks) {
    switch (bloco.type) {
      case 'texto':
        container.addTextDisplayComponents(construirBlocoTexto(bloco));
        break;
      case 'separador':
        container.addSeparatorComponents(construirBlocoSeparador(bloco));
        break;
      case 'secao':
        container.addSectionComponents(construirBlocoSecao(bloco));
        break;
      case 'galeria':
        container.addMediaGalleryComponents(construirBlocoGaleria(bloco));
        break;
      default:
        break;
    }
  }

  return container;
}

/** Monta o payload pronto pra enviar/editar uma mensagem com Components V2. */
function montarPayloadV2(sessaoV2) {
  return {
    components: [construirContainer(sessaoV2)],
    flags: MessageFlags.IsComponentsV2,
  };
}

module.exports = { construirContainer, montarPayloadV2 };

