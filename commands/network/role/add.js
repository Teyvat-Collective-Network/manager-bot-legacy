import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as util from '../../../lib/util.js';
import parent from './index.js';

parent.subcommand({
  name: 'add',
  description: 'Add a TCN role to a user',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to add a role to',
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'role',
    description: 'The role to add to the user',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  const apiData = await util.getAPIData(interaction);
  if (!apiData.observer) return reply('Only TCN observers may add roles to a user.');

  const user = interaction.options.getUser('user');
  const role = interaction.options.getString('role');
  
  const success = await interaction.client.tcn.addUserRole(user.id, role).catch(e => e);

  return reply(success instanceof Error
    ? `Successfully added role ${role} to ${user}.`
    : `Failed adding role ${role} to ${user}.`
  );
});