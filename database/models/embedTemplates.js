const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const embedTemplates = require('../../database/models/embedTemplates');
const { montarPayloadV2 } = require('../../builders/componentsV2');

function construirEmbedDeDados(dados) {
  const embed = new EmbedBuilder().setColor(dados.color ?? 0x5865f2);
  if (dados.title) embed.setTitle(dados.title);
  if (dados.description) embed.setDescription(dados.description);
  if (dados.url) embed.setURL(dados.url);
  if (dados.thumbnail) embed.setThumbnail(dados.thumbnail);
  if (dados.image) embed.setImage(dados.image);
  if (dados.footerText) embed.setFooter({ text: dados.footerText, iconURL: dados.footerIcon || undefined });
  if (dados.authorName) embed.setAuthor({ name: dados.authorName, iconURL: dados.authorIcon || undefined, url: dados.authorUrl || undefined });
  if (dados.timestamp) embed.setTimestamp();
  if (dados.fields?.length) embed.addFields(dados.fields);
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed-templates')
    .setDescription('Gerencia embeds/components salvos como template.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) => sub.setName('listar').setDescription('Lista todos os templates salvos neste servidor.'))
    .addSubcommand((sub) =>
      sub
        .setName('enviar')
        .setDescription('Envia um template salvo para um canal.')
        .addStringOption((opt) => opt.setName('nome').setDescription('Nome do template').setRequired(true))
        .addChannelOption((opt) => opt.setName('canal').setDescription('Canal de destino (padrão: canal atual)')),
    )
    .addSubcommand((sub) =>
      sub
        .setName('apagar')
        .setDescription('Apaga um template salvo.')
        .addStringOption((opt) => opt.setName('nome').setDescription('Nome do template').setRequired(true)),
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'listar') {
      const lista = embedTemplates.listar(interaction.guildId);
      if (!lista.length) {
        return interaction.reply({ content: 'Nenhum template salvo ainda. Use `/embed-builder` e clique em **Salvar template**.', flags: MessageFlags.Ephemeral });
      }
      const texto = lista
        .map((t) => `• **${t.nome}** _(${t.modo})_ — criado por <@${t.autor_id}> em <t:${Math.floor(t.criado_em / 1000)}:d>`)
        .join('\n');
      return interaction.reply({ content: `📂 **Templates salvos:**\n${texto}`, flags: MessageFlags.Ephemeral });
    }

    if (sub === 'enviar') {
      const nome = interaction.options.getString('nome', true);
      const canal = interaction.options.getChannel('canal') || interaction.channel;
      const tpl = embedTemplates.buscarPorNome(interaction.guildId, nome);
      if (!tpl) return interaction.reply({ content: `❌ Template \`${nome}\` não encontrado.`, flags: MessageFlags.Ephemeral });

      if (tpl.modo === 'v2') {
        await canal.send(montarPayloadV2(tpl.dados));
      } else {
        await canal.send({ embeds: [construirEmbedDeDados(tpl.dados)] });
      }
      return interaction.reply({ content: `✅ Template \`${nome}\` enviado em ${canal}.`, flags: MessageFlags.Ephemeral });
    }

    if (sub === 'apagar') {
      const nome = interaction.options.getString('nome', true);
      const info = embedTemplates.remover(interaction.guildId, nome);
      if (info.changes === 0) return interaction.reply({ content: `❌ Template \`${nome}\` não encontrado.`, flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: `🗑️ Template \`${nome}\` apagado.`, flags: MessageFlags.Ephemeral });
    }
  },
};
