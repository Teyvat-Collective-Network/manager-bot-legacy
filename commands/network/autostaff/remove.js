import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { update, util, constants } from '../../../lib/index.js';
import parent from './index.js';

const { AutoRoleType } = constants;

parent.subcommand({
  name: 'remove',
  description: 'Remove a staff synchronization',
  options: [{
    type: ApplicationCommandOptionType.Role,
    name: 'role',
    description: 'The role you want to unsynchronize',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles))) return reply('Only people with the MANAGE_ROLES permission, or a TCN observer can synchronize staff roles.');
  
  const role = interaction.options.getRole('role');

  const data = {
    guild: interaction.guildId,
    discord: role.id,
    api: interaction.guildId,
    type: AutoRoleType.DiscordToAPIGuild,
  }

  const doc = await interaction.client.db.autoRoles.findOne(data);
  if (!doc) return reply('A staff synchronization with those settings doesn\'t exist.');
  
  await doc.deleteOne();
  await reply('Staff synchronization successfully removed. Roles will be updated in the background.');

  await update.updateAPI([...interaction.client.users.cache.values()]).catch(console.error);
});