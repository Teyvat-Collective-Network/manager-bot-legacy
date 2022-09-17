import { OAuth2Scopes, PermissionFlagsBits, SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'invite',
  description: 'Sends a bot invite',
}, async interaction => {
  return interaction.reply({
    content: interaction.client.generateInvite({
      permissions: [
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.ManageThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.UseExternalStickers,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.ModerateMembers,
      ].reduce((a, v) => a | v),
      scopes: [ OAuth2Scopes.Bot ],
    }),
    ephemeral: true,
  });
});