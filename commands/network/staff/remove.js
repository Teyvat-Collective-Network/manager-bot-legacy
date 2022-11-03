import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { update, util, autocomplete } from '../../../lib/index.js';
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

  if (success instanceof Error) return reply( `Failed removing ${user} as staff from ${apiData.guild.name}.`);
  await reply(`Successfully removed ${user} as staff from ${apiData.guild.name}.`);

  await update.updateRoles([user]);
});