import { ApplicationCommandOptionTypes, MessageFlags } from 'detritus-client/lib/constants';
import { InteractionAutoCompleteContext, InteractionContext } from 'detritus-client/lib/interaction';
import { User } from 'detritus-client/lib/structures';
import { ComponentActionRow, ComponentContext } from 'detritus-client/lib/utils';

import { BaseSlashCommand } from './baseCommand';
import guilds from '../guilds';
import { updateRoles } from '../lib/update';

const roles = {
  MODERATOR:  1<<0,
  EVENT:      1<<1,
  THEORY:     1<<2,
  LEAKS:      1<<3,
  ART:        1<<4,
  DEV:        1<<5,
  OWNER:      1<<6,
  ADVISOR:    1<<7,
  VOTER:      1<<8,
  EXEC:       1<<9,
  OBSERVER:   1<<10,
  
  DB:         (1<<6)-1,
  GUILD:     (1<<9)-1,
}

const names = {
  MODERATOR:  'Moderator',
  EVENT:      'Event Staff',
  THEORY:     'Theorycrafting Staff',
  LEAKS:      'Leak Staff',
  ART:        'Art Staff',
  DEV:        'Developer Staff',
  OWNER:      'Server Owner',
  ADVISOR:    'Council Advisor',
  VOTER:      'Voter',
  EXEC:       'Internal Committee',
  OBSERVER:   'External Committee',
}

export const COMMAND_NAME = 'roles';

export interface CommandArgs {
  user: User;
  for?: string;
}

export default class PromoteCommand extends BaseSlashCommand {
  name = COMMAND_NAME;
  description = 'set the roles a user fulfills';
  triggerLoadingAsEphemeral = true;

  constructor() {
    super({
      options: [{
        name: 'user',
        description: 'the user you want set the roles of',
        type: ApplicationCommandOptionTypes.USER,
        required: true,
      }, {
        name: 'for',
        description: 'the guild for which you want to set these roles',
        type: ApplicationCommandOptionTypes.STRING,
        async onAutoComplete(context: InteractionAutoCompleteContext) {
          const guilds = [...context.cluster!.tcn.guilds.values()];
          const query = context.value.toLowerCase();
          return context.respond({ choices: guilds
            .filter((guild) => guild.name.toLowerCase().startsWith(query) || guild.character.startsWith(query))
            .map(guild => ({ name: guild.name, value: guild.id }))
          });
        }
      }],
    });
  }


  async onBeforeRun(context: InteractionContext, args: CommandArgs) {
    const user = context.cluster!.tcn.users.get(context.userId);
    if (user?.exec || user?.observer) return true;
    if (!args.for) {
      context.editOrRespond({
        content: 'You are not allowed to set any roles without server',
        flags: MessageFlags.EPHEMERAL,
      });
      return false;
    } 
    if (
      user?.owner && user.owner.id === args.for
      || user?.advisor && user.advisor.id === args.for
    ) return true;

    context.editOrRespond({
      content: 'You are not allowed to set any roles for that user',
      flags: MessageFlags.EPHEMERAL,
    });

    return false;
  }


  async run(context: InteractionContext, args: CommandArgs) {
    const user = context.cluster!.tcn.users.get(context.userId);
    const subject = context.cluster!.tcn.users.get(args.user.id);

    const options = Object.keys(names).filter((role) => {
      if (user?.exec || user?.observer) {
        return ['EXEC', 'OBSERVER'].includes(role) ? true : !!args.for;
      };

      switch(role as keyof typeof names) {
        case 'VOTER': {
          return user?.owner && user.owner.id === args.for
            || user?.voter && user.voter.id === args.for
        }

        case 'ADVISOR': {
          return user?.owner && user.owner.id === args.for
            || user?.advisor && user.advisor.id === args.for
        }

        case 'OWNER': {
          if ((subject?.roles || 0) & roles.OWNER) return false;
          return user?.owner && user.owner.id === args.for
        }

        case 'EXEC':
        case 'OBSERVER': {
          return false;
        }

        default: {
          return true;
        }
      }
    }) as (keyof typeof names)[];


    context.editOrRespond({
      content: `<@${args.user.id}>${args.for ? ` **|** ${context.cluster!.tcn.guilds.get(args.for)?.name}` : ''}`,
      components: [new ComponentActionRow().addSelectMenu({
        label: 'roles',
        options: options.map(role => ({
          label: names[role],
          value: role,
          default: !!((subject ? (args.for ? subject.guilds[args.for] : 0) | (subject.roles & (roles.EXEC | roles.OBSERVER)) : 0) & roles[role]),
        })),
        maxValues: options.length,
        min_values: 0,
        run: (ctx) => this.runSelectMenu(ctx, { ...args, options }),
      })],
      flags: MessageFlags.EPHEMERAL,
    });
  }


  async runSelectMenu(context: ComponentContext, args: CommandArgs & { options: (keyof typeof names)[] }) {
    const user = context.cluster!.tcn.users.get(args.user.id);
    const guild = args.for && context.cluster!.tcn.guilds.get(args.for);

    const exec = context.data.values!.includes('EXEC');
    const observer = context.data.values!.includes('OBSERVER');
    
    const guildEdit = Object.fromEntries(['VOTER', 'OWNER', 'ADVISOR'].map(role => {
      const key = role.toLowerCase()
      const prop = role.toLowerCase() + 'Id' as 'voterId' | 'ownerId' | 'advisorId';
      if (!guild) return [key, ''];
      if (context.data.values!.includes(role)) return [key, args.user.id];
      if (args.options.includes(role as keyof typeof names) && guild[prop] === args.user.id) return [key, null]; 
      return [key, guild[prop]];
    } )) as { voter: string, owner: string, advisor: string };

    const guildRoles = args.options.reduce((acc, role) => (
      ['VOTER', 'OWNER', 'ADVISOR', 'EXEC', 'OBSERVER'].includes(role) ? acc 
        : context.data.values!.includes(role)
          ? acc | roles[role as keyof typeof names]
          : acc & ~roles[role as keyof typeof names]
    ), (args.for && user?.guilds[args.for] || 0) & roles.DB)
      | (guildEdit.owner === args.user.id ? roles.OWNER : 0)
      | (guildEdit.advisor === args.user.id ? roles.ADVISOR : 0)
      | (guildEdit.voter === args.user.id ? roles.VOTER : 0)
      | (exec ? roles.EXEC : 0)
      | (observer ? roles.OBSERVER : 0);


    const promises = [];

    if (user) {
      if (guild && (guildRoles & roles.DB) !== (user.guilds[guild.id] & roles.DB)) promises.push(context.cluster!.tcn.api.users(user.id).guilds.put({ guild: guild.id, roles: guildRoles & roles.DB }));
      if (user.exec !== exec) promises.push(exec
        ? context.cluster!.tcn.api.users.execs.put({ user: user.id })
        : context.cluster!.tcn.api.users.execs(user.id).delete()
      );
      if (user.observer !== observer) promises.push(observer
        ? context.cluster!.tcn.api.users.observers.put({ user: user.id })
        : context.cluster!.tcn.api.users.observers(user.id).delete()
      );
    } else {
      promises.push(context.cluster!.tcn.api.users.post({
        id: args.user.id,
        guilds: (guild && (guildRoles & roles.DB)) ? { [guild.id]: guildRoles & roles.DB } : {},
        exec, observer,
        roles: 0,
      }));
    }

    if (guild && (
      guild.advisorId !== guildEdit.advisor
      || guild.ownerId !== guildEdit.owner
      || guild.voterId !== guildEdit.voter
    )) promises.push(context.cluster!.tcn.api.guilds(guild.id).patch(guildEdit));

    const userGuilds = { ...user?.guilds };
    if (args.for) userGuilds[args.for] = guildRoles & roles.GUILD;

    const userRoles = Object.values(userGuilds).reduce((a,v) => a|v);

    for (const [,guild] of Object.entries(guilds)) {
      const member = context.client.guilds.get(guild.id)?.members.get(args.user.id);
      if (!member) continue;

      promises.push(await updateRoles(member, {
        roles: userRoles,
        guilds: userGuilds,
      }));
    }

    await Promise.all(promises);


    context.editOrRespond({
      content: 'roles updated!',
      components: [],
      flags: MessageFlags.EPHEMERAL,
    });
  }
}