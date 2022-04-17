import { Interaction } from 'detritus-client';
import { BaseCommandOption } from '../baseCommand';
import guilds from '../../guilds';
import { MessageFlags } from 'detritus-client/lib/constants';
import { updateRoles } from '../../lib/update';

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

    console.log(context.guild.members.size);
    
    for (const member of context.guild.members.values()) {
      await updateRoles(member);
    }

    return reply('roles updated');
  }
}