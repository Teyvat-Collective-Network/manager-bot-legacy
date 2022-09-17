import { util } from '@aroleaf/djs-bot';
import { AutoRoleType } from './constants.js';

export async function updateMembers(members) {
  if (!members?.length) return;
  const autoRoles = await members[0].client.db.autoRoles.find({
    guild: members[0].guild.id,
    type: { $in: [AutoRoleType.APIGuildToDiscord, AutoRoleType.APIRoleToDiscord] },
  });
  const [roleAutoRoles, guildAutoRoles] = util.partition(autoRoles, ar => ar.type === AutoRoleType.APIRoleToDiscord);

  const users = await members[0].client.tcn.fetchUsers().catch(() => []);
  const guilds = await members[0].client.tcn.fetchGuilds().catch(() => []);

  if (!users.length) return;

  for (const member of members) {
    const [managed, rest] = util.partition([...member.roles.cache.keys()], id => autoRoles.some(ar => ar.discord === id));
    
    const user = users.find(user => user.id === member.id);
    if (!user) {
      if (managed.length) await member.roles.set(rest).catch(() => {});
      continue;
    }

    if (user.guilds.length) user.roles.push('staff');

    const expected = roleAutoRoles
      .filter(ar => user.roles.includes(ar.api))
      .concat(guildAutoRoles.filter(ar => 
        user.guilds.includes(ar.api)
        && (!ar.meta?.councilOnly || guilds.some(g => [g.owner, g.advisor].includes(user.id))),
      ))
      .map(ar => ar.discord);
  
    const different = expected.length !== managed.length || expected.every(r => managed.includes(r));
    await different && member.roles.set(rest.concat(expected)).catch(() => {});
  }
}

export async function updateAPI(members) {
  if (!members?.length) return;
  const autoRoles = await members[0].client.db.autoRoles.find({
    guild: members[0].guild.id,
    type: { $in: [AutoRoleType.DiscordToAPIGuild, AutoRoleType.DiscordToAPIRole] },
  });
  const [roleAutoRoles, guildAutoRoles] = util.partition(autoRoles, ar => ar.type === AutoRoleType.DiscordToAPIRole);

  const users = await members[0].client.tcn.fetchUsers();
  if (!users) return;

  for (const member of members) {
    const user = users.find(user => user.id === member.id);
    
    const isStaff = guildAutoRoles.some(ar => member.roles.resolve(ar.discord));
    const expected = roleAutoRoles
      .filter(ar => member.roles.resolve(ar.discord))
      .map(ar => ar.api);

    if (!user) {
      if (expected.length || isStaff) await member.client.tcn.createUser({
        id: member.id,
        roles: expected,
        guilds: isStaff ? [member.guild.id] : [],
      });
      continue;
    }
  
    await (isStaff
      ? member.client.tcn.addUserGuild(member.id, member.guild.id)
      : member.client.tcn.removeUserGuild(member.id, member.guild.id)
    ).catch(() => {});

    const [managed, rest] = util.partition(user?.roles || [], role => roleAutoRoles.some(ar => ar.api === role));
    
    const different = expected.length !== managed.length || expected.every(r => managed.includes(r));
    await different && member.client.tcn.editUser({ roles: rest.concat(expected) }).catch(() => {});
  }
}