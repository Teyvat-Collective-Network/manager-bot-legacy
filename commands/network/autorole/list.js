import { PermissionFlagsBits, util } from '@aroleaf/djs-bot';
import { AutoRoleType } from '../../../lib/constants.js';
import { getAPIData } from '../../../lib/util.js';
import parent from './index.js';

parent.subcommand({
  name: 'list',
  description: 'Lists all synchronizations for this server',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await getAPIData(interaction);
  if (!(apiData.observer || interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles))) return reply('Only people with the MANAGE_ROLES permission, or a TCN observer can synchronize roles.');

  const autoRoles = await interaction.client.db.autoRoles.find({ guild: interaction.guild.id, type: { $ne: AutoRoleType.DiscordToAPIGuild } });

  const [toRole, rest] = util.partition(autoRoles, r => r.type === AutoRoleType.DiscordToAPIRole);
  const [fromRole, fromGuild] = util.partition(rest, r => r.type === AutoRoleType.APIRoleToDiscord);

  const list = roles => roles.length ? roles.map(role => role.type === AutoRoleType.DiscordToAPIRole
    ? `<@&${role.discord}> ➜ \`${role.api}\``
    : `\`${role.api}\` ➜ <@&${role.discord}>`
  ).join('\n') : 'none';

  return reply(`
This server's synchronizations:
**Discord to TCN role**
${list(toRole)}
**TCN role to Discord**
${list(fromRole)}
**Server to Discord**
${list(fromGuild)}`
  .slice(1));
});
