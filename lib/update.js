import { util } from '@aroleaf/djs-bot';
import { AutoRoleType } from './constants.js';
import { groupArray } from './util.js';

export async function updateAPI(users) {
  if (!users?.length) return;
  const client = users[0].client;

  const api = {
    guilds: Object.fromEntries((await client.tcn.fetchGuilds()).map(guild => [guild.id, guild])),
    users: Object.fromEntries((await client.tcn.fetchUsers()).map(user => [user.id, user])),
  }

  const autoRoles = await client.db.autoRoles.find();
  const autoRolesByGuild = groupArray(autoRoles, ar => ar.guild);

  for (const user of users) {
    const apiUser = api.users[user.id];

    const expected = {
      roles: apiUser?.roles.filter(r => !autoRoles.some(ar => ar.type === AutoRoleType.DiscordToAPIRole && ar.api === r)) || [],
      guilds: apiUser?.guilds.filter(g => !autoRoles.some(ar => ar.type === AutoRoleType.DiscordToAPIGuild && ar.api === g)) || [],
    }

    for (const [,guild] of client.guilds.cache) {
      const roleAutoRoles  = autoRolesByGuild[guild.id].filter(ar => ar.type === AutoRoleType.DiscordToAPIRole);
      const guildAutoRoles = autoRolesByGuild[guild.id].filter(ar => ar.type === AutoRoleType.DiscordToAPIGuild);

      if (guildAutoRoles.some(ar => member.roles.resolve(ar.discord))) expected.guilds.push(guild.id);
      expected.roles.push(...roleAutoRoles
        .filter(ar => member.roles.resolve(ar.discord))
        .map(ar => ar.api)
      );
    }

    if (!apiUser) {
      if (expected.guilds.length || expected.roles.length) console.log(user.username, expected) /* client.tcn.createUser({
        id: user.id,
        ...expected,
      });*/
      continue;
    }

    expected.roles = [...new Set(expected.roles)];
    const different = expected.roles.length !== apiUser.roles.length
      || expected.guilds.length !== user.guilds.length
      || expected.roles.every(r => apiUser.roles.includes(r))
      || expected.guilds.every(g => user.guilds.includes(g));
    await different && console.log(user.username, apiUser.roles, expected); // client.tcn.editUser(expected).catch(() => {});
  }
}


export async function updateRoles(users) {
  if (!users?.length) return;
  const client = users[0].client;

  const api = {
    guilds: Object.fromEntries((await client.tcn.fetchGuilds()).map(guild => [guild.id, guild])),
    users: Object.fromEntries((await client.tcn.fetchUsers()).map(user => [user.id, user])),
  }

  const autoRoles = await client.db.autoRoles.find();
  const autoRolesByGuild = groupArray(autoRoles, ar => ar.guild);

  for (const [,guild] of client.guilds.cache) {
    const roleAutoRoles  = autoRolesByGuild[guild.id]?.filter(ar => ar.type === AutoRoleType.APIRoleToDiscord) || [];
    const guildAutoRoles = autoRolesByGuild[guild.id]?.filter(ar => ar.type === AutoRoleType.APIGuildToDiscord) || [];

    for (const user of users) {
      const member = guild.members.resolve(user);
      if (!member) continue;
      
      const [managed, rest] = util.partition([...member.roles.cache.keys()], id => [...roleAutoRoles, ...guildAutoRoles].some(ar => ar.discord === id));
      
      const apiUser = api.users[user.id];
      if (!apiUser) {
        if (managed.length) console.log(user.username, rest) //await member.roles.set(rest);
        continue;
      }

      if (apiUser.guilds.length) apiUser.roles.push('staff');

      const expected = roleAutoRoles
        .filter(ar => apiUser.roles.includes(ar.api))
        .concat(guildAutoRoles.filter(ar => guild.id === process.env.HQ
          ? api.guilds.some(g => g.id === ar.api && [g.owner, g.advisor].includes(apiUser.id))
          : apiUser.guilds.includes(ar.api)
        ))
        .map(ar => ar.discord);

      const different = expected.length !== managed.length || !expected.every(r => managed.includes(r));
      await different && console.log(user.username, managed, expected, rest) // member.roles.set(rest.concat(expected)).catch(() => {});
    }
  }
}