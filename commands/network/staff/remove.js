import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as autocomplete from '../../../lib/autocomplete.js';
import parent from './index.js';

parent.subcommand({
  name: 'remove',
  description: 'Remove a user from a server\'s staff',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to remove from staff',
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'server',
    description: 'The server the user is not staff in anymore',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.server,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || apiData.owner)) return reply('The staff of a TCN server may only be updated by its owner or a TCN observer.');

  const user = interaction.options.getUser('user');
  
  const success = await interaction.client.tcn.removeUserGuild(user.id, apiData.guild.id).catch(e => e);

  return reply(success instanceof Error
    ? `Successfully removed ${user} as staff from ${apiData.guild.name}.`
    : `Failed removing ${user} as staff from ${apiData.guild.name}.`
  );
});