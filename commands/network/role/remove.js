import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as util from '../../../lib/util.js';
import parent from './index.js';

parent.subcommand({
  name: 'remove',
  description: 'Remove a TCN role from a user',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to remove a role from',
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'role',
    description: 'The role to remove from the user',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  const apiData = await util.getAPIData(interaction);
  if (!apiData.observer) return reply('Only TCN observers may remove roles from a user.');

  const user = interaction.options.getUser('user');
  const role = interaction.options.getString('role');
  
  const success = await interaction.client.tcn.removeUserRole(user.id, role).catch(e => e);

  return reply(success instanceof Error
    ? `Failed removing role ${role} from ${user}.`
    : `Successfully removed role ${role} from ${user}.`
  );
});