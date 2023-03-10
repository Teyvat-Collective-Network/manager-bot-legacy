import { ApplicationCommandOptionType, CommandFlagsBitField } from '@aroleaf/djs-bot';
import parent from './index.js';

parent.subcommand({
  name: 'view',
  description: 'View the TCN partner list.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
  options: [{
    type: ApplicationCommandOptionType.Boolean,
    name: 'public',
    description: 'If the list should be shown to everyone or not. Default: false.',
  }, {
    type: ApplicationCommandOptionType.Boolean,
    name: 'customized',
    description: 'If the list should be customized according to this server\'s settings or not. Default: true.',
  }],
}, async (interaction, options) => {
  const { customized = true } = options;
  const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
  const template = customized && settings?.template || interaction.client.partnerlists.defaultTemplate
  const partnerList = await interaction.client.partnerlists.get(template, customized && interaction.guild);
  return interaction.reply(Object.assign(partnerList.messages()[0], {
    ephemeral: !options.public,
  }));
});