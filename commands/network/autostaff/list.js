import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import * as util from '../../../lib/util.js';
import { AutoRoleType } from '../../../lib/constants.js';
import parent from './index.js';

parent.subcommand({
  name: 'list',
  description: 'List all roles automatically registering its members as staff on the TCN API',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles))) return reply('Only the owner of the server, or a TCN observer can register staff roles.');
  
  const roles = await interaction.client.db.autoRoles.find({ type: AutoRoleType.DiscordToAPIGuild });
  return reply(roles.length 
    ? `This server\'s staff synchronizations: ${roles.map(role => `<@&${role.discord}>`).join(' ')}`
    : 'This server doesn\'t have any staff synchronizations',
  );
});