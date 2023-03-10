import { util } from '@aroleaf/djs-bot';
import { AutoRoleType } from './constants.js';
import { groupArray } from './util.js';


class UniqueQueue extends Set {
  push(...items) {
    for (const item of items) this.add(item);
  }

  pop() {
    const item = this.values().next().value;
    this.delete(item);
    return item;
  }

  get empty() {
    return !this.size;
  }
}


export class Updater {
  constructor(client) {
    this.client = client;
    this.queue = new UniqueQueue();
    this.running = false;
  }

  add(...users) {
    this.queue.push(...users);
    this.run();
  }

  async run() {
    if (this.running) return;
    this.running = true;
    await this.update();
    this.running = false;
  }

  async updateAPI(user, autoRoles) {
    const apiUser = this.client.tcn.users.get(user.id);
    
    const expected = {
      roles: apiUser?.roles.filter(r => !autoRoles.some(ar => ar.type === AutoRoleType.DiscordToAPIRole && ar.api === r)) || [],
      guilds: apiUser?.guilds.filter(g => !autoRoles.some(ar => ar.type === AutoRoleType.DiscordToAPIGuild && ar.api === g)) || [],
    }

    for (const [,guild] of this.client.guilds.cache) {
      const roleAutoRoles  = autoRoles.byGuild[guild.id]?.DiscordToAPIRole || [];
      const guildAutoRoles = autoRoles.byGuild[guild.id]?.DiscordToAPIGuild || [];
      const member = guild.members.resolve(user);
      if (!member) continue;

      if (guildAutoRoles.some(ar => member.roles.resolve(ar.discord))) expected.guilds.push(guild.id);
      expected.roles.push(...roleAutoRoles
        .filter(ar => member.roles.resolve(ar.discord))
        .map(ar => ar.api)
      );
    }

    if (!apiUser) {
      if (expected.guilds.length || expected.roles.length) this.client.tcn.addUser({
        id: user.id,
        ...expected,
      });
      return;
    }

    expected.roles = [...new Set(expected.roles)];
    const different = expected.roles.length !== apiUser.roles.length
      || expected.guilds.length !== apiUser.guilds.length
      || !expected.roles.every(r => apiUser.roles.includes(r))
      || !expected.guilds.every(g => apiUser.guilds.includes(g));
    different && await this.client.tcn.editUser(user.id, expected).catch(console.error);
  }

  async updateRoles(user, autoRoles) {
    const apiUser = this.client.tcn.users.get(user.id);

    for (const [,guild] of this.client.guilds.cache) {
      const roleAutoRoles  = autoRoles.byGuild[guild.id]?.APIRoleToDiscord || [];
      const guildAutoRoles = autoRoles.byGuild[guild.id]?.APIGuildToDiscord || [];

      const member = guild.members.resolve(user);
      if (!member) continue;

      const [managed, rest] = util.partition([...member.roles.cache.keys()], id => roleAutoRoles.concat(guildAutoRoles).some(ar => ar.discord === id));

      if (!apiUser) {
        if (managed.length) await member.roles.set(rest);
        continue;
      }

      const expected = roleAutoRoles
        .filter(ar => ar.api === 'staff' ? apiUser.guilds.length : apiUser.roles.includes(ar.api))
        .concat(guildAutoRoles.filter(ar => guild.id === process.env.HQ
          ? [this.client.tcn.guilds.get(ar.api)?.owner, this.client.tcn.guilds.get(ar.api)?.advisor].includes(apiUser.id)
          : apiUser.guilds.includes(ar.api)
        ))
        .map(ar => ar.discord);

      const different = expected.length !== managed.length || !expected.every(r => managed.includes(r));
      different && await member.roles.set(rest.concat(expected)).catch(console.error);
    }
  }

  async update() {
    const autoRoles = await this.client.db.autoRoles.find();
    autoRoles.byGuild = groupArray(autoRoles, ar => ar.guild);

    for (const roles of Object.values(autoRoles.byGuild)) {
      roles.APIRoleToDiscord = roles.filter(ar => ar.type === AutoRoleType.APIRoleToDiscord);
      roles.APIGuildToDiscord = roles.filter(ar => ar.type === AutoRoleType.APIGuildToDiscord);
      roles.DiscordToAPIRole = roles.filter(ar => ar.type === AutoRoleType.DiscordToAPIRole);
      roles.DiscordToAPIGuild = roles.filter(ar => ar.type === AutoRoleType.DiscordToAPIGuild);
    }

    while (!this.queue.empty) {
      try {
        const user = this.queue.pop();
        await this.updateAPI(user, autoRoles);
        await this.updateRoles(user, autoRoles);
      } catch (error) {
        console.error(error);
      }
    }
  }
}