import { User } from '@aroleaf/tcn-api';
import { Member } from 'detritus-client/lib/structures';
import guilds from '../guilds';

const names = [
  'MODERATOR',
  'EVENT',
  'THEORY',
  'LEAKS',
  'ART',
  'DEV',
  'OWNER',
  'ADVISOR',
  'VOTER',
  'EXEC',
  'OBSERVER',
]

export async function updateRoles(member: Member, user: User | { roles: number, guilds: { [k: string]: number } } | undefined = member.client.cluster!.tcn.users.get(member.id)) {
  const guild = Object.entries(guilds).find(([,guild]) => guild.id === member.guildId)?.[1];
  if (!guild) return;

  const before = Array.from(member.roles.keys());
  const after = before.filter(role => !Object.values(guild.roles).includes(role));

  if (member.user.bot) after.push(guild.roles.BOT);

  if (user) {
    for (let i = 0; i <= 10; i++) {
      if (user.roles & (1<<i) && names[i] in guild.roles) after.push(guild.roles[names[i]]);
    }
    if (user.roles & ((1<<9)-1) && 'STAFF' in guild.roles) after.push(guild.roles['STAFF']);

    for (const [g, _r] of Object.entries(user.guilds)) {
      const r = user instanceof User && user.memberIn(g)?.roles || _r;
      const role = guild.roles[g];
      const allowed = guild.singleColorRole ? r & ((1<<6) | (1<<7)) : r;
      if (allowed && role) after.push(role);
    }
  }
  
  return (
    before.some(role => !after.includes(role))
    || after.some(role => !before.includes(role))
  ) && member.edit({ roles: after });
}