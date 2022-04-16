import { Interaction } from 'detritus-client';
import { BaseCommandOption } from '../baseCommand';
import guilds from '../../guilds';
import { MessageFlags } from 'detritus-client/lib/constants';

export const COMMAND_NAME = 'roles';

export class UpdateRolesCommand extends BaseCommandOption {
  name = COMMAND_NAME;
  description = 'force update all managed user roles';
  triggerLoadingAsEphemeral = true;

  async run(context: Interaction.InteractionContext) {
    if (!context.guild) return;
    const reply = (content: string) => context.editOrRespond({ content, flags: MessageFlags.EPHEMERAL });
    
    const guild = Object.entries(guilds).find(([,guild]) => guild.id === context.guildId)?.[1];
    if (!guild) return reply('I don\'t manage this guild');

    for (const member of context.guild.members.values()) {
      const user = context.client.cluster!.tcn.users.get(member.id);
      const current = Array.from(member.roles.keys());
      const roles = current.filter(role => !Object.values(guild.roles).includes(role));

      if (member.user.bot) roles.push(guild.roles.bot);

      if (user) {
        if (user.roles & (1<<6)) roles.push(guild.roles.owner);
        if (user.roles & (1<<7)) roles.push(guild.roles.advisor);
        if (user.roles & (1<<8) && guild.roles.voter) roles.push(guild.roles.voter);
  
        for (const [g] of Object.entries(user.guilds)) {
          const member = user.memberIn(g);
          const role = guild.roles[g];
          const allowed = !guild.singleColorRole || member && member.roles & ((1<<6) | (1<<7))
          if (allowed && role) roles.push(role);
        }
      }

      if (
        current.some(role => !roles.includes(role))
        || roles.some(role => !current.includes(role))
      ) await member.edit({ roles });
    }

    return reply('roles updated');
  }
}