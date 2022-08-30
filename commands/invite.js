import { OAuth2Scopes, PermissionFlagsBits, SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'invite',
  description: 'Sends a bot invite',
}, async interaction => {
  return interaction.reply({
    content: interaction.client.generateInvite({
      permissions: PermissionFlagsBits.Administrator,
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    }),
    ephemeral: true,
  });
});