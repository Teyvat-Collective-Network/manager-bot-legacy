import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { update, util, constants } from '../../../lib/index.js';
import parent from './index.js';

const { AutoRoleType } = constants;

parent.subcommand({
  name: 'add',
  description: 'Add a staff role synchronization',
  options: [{
    type: ApplicationCommandOptionType.Role,
    name: 'role',
    description: 'The role you want to synchronize',
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

  if (await interaction.client.db.autoRoles.exists(data)) return reply('A synchronization with those settings already exists.');
  await interaction.client.db.autoRoles.create(data);

  await reply('Synchronization successfully added. Roles will be updated in the background.');
  
  await update.updateAPI([...interaction.client.users.cache.values()]).catch(console.error);
});