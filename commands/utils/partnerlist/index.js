import { ApplicationCommandOptionType, SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'partnerlist',
  description: 'Commands to view and set up automation for the TCN partner list embeds.',
  options: [{
    type: ApplicationCommandOptionType.SubcommandGroup,
    name: 'autosync',
    description: 'Commands to set up automation for the TCN partner list embeds.',
  }],
});
