import { util } from '@aroleaf/djs-bot';
import { AutoRoleType } from './constants.js';

export async function updateMembers(members) {
  const autoRoles = await member.client.db.autoRoles.find({
    guild: member.guild.id,
    type: { $in: [AutoRoleType.APIGuildToDiscord, AutoRoleType.APIRoleToDiscord] },
  });
  const [roleAutoRoles, guildAutoRoles] = util.partition(autoRoles, ar => ar.type === AutoRoleType.APIRoleToDiscord);

  for (const member of members) {
    const [managed, rest] = util.partition([...member.roles.cache.keys()], id => autoRoles.some(ar => ar.discord === id));
    
    const user = await member.client.tcn.fetchUser(member.id).catch(() => {});
    if (!user) {
      if (managed.length) await member.roles.set(rest).catch(() => {});
      continue;
    }

    const expected = roleAutoRoles
      .filter(ar => user.roles.includes(ar.api))
      .concat(guildAutoRoles.filter(ar => user.guilds.includes(ar.discord)))
      .map(ar => ar.discord);
  
    const different = expected.length !== managed.length || expected.every(r => managed.includes(r));
    await different && member.roles.set(rest.concat(expected)).catch(() => {});
  }
}

export async function updateAPI(members) {
  const autoRoles = await member.client.db.autoRoles.find({
    guild: member.guild.id,
    type: { $in: [AutoRoleType.DiscordToAPIGuild, AutoRoleType.DiscordToAPIRole] },
  });
  const [roleAutoRoles, guildAutoRoles] = util.partition(autoRoles, ar => ar.type === AutoRoleType.DiscordToAPIRole);

  for (const member of members) {
    const user = await member.client.tcn.fetchUser(member.id).catch(() => {});
    
    const isStaff = guildAutoRoles.some(ar => member.roles.resolve(ar.role));
    const expected = roleAutoRoles
      .filter(ar => member.roles.resolve(ar.discord))
      .map(ar => ar.api);

    if (!user) {
      if (expected.length) await member.client.tcn.createUser({
        id: member.id,
        roles: expected,
        guilds: isStaff ? [member.guild.id] : [],
      })
      continue;
    }
  
    await (isStaff && !user?.guilds.includes(member.guild.id)
      ? member.client.tcn.addUserGuild(member.id, member.guild.id)
      : member.client.tcn.removeUserGuild(member.id, member.guild.id)
    ).catch(() => {});

    const [managed, rest] = util.partition(user?.roles || [], role => roleAutoRoles.some(ar => ar.api === role));
    
    const different = expected.length !== managed.length || expected.every(r => managed.includes(r));
    await different && member.client.tcn.editUser({ roles: rest.concat(expected) }).catch(() => {});
  }
}