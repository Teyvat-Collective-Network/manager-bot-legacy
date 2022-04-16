import { Interaction, Structures } from 'detritus-client';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, InteractionCallbackTypes, MessageFlags } from 'detritus-client/lib/constants';
import guilds from '../guilds';

export class BaseCommand<ParsedArgsFinished = Interaction.ParsedArgs> extends Interaction.InteractionCommand<ParsedArgsFinished> {
  permissionsIgnoreClientOwner = true;
  triggerLoadingAfter = 1000;

  constructor(data: Interaction.InteractionCommandOptions = {}) {
    super(Object.assign({
      global: false,
      guildIds: [
        guilds.hq.id,
        guilds.hub.id,
      ],
    }, data));
  }

  onLoadingTrigger(context: Interaction.InteractionContext) {
    return context.responded || context.respond(
      InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      { flags: this.triggerLoadingAsEphemeral ? MessageFlags.EPHEMERAL : 0 },
    );
  }
}


export class BaseSlashCommand<ParsedArgsFinished = Interaction.ParsedArgs> extends BaseCommand<ParsedArgsFinished> {
  type = ApplicationCommandTypes.CHAT_INPUT;
}


export class BaseCommandOption<ParsedArgsFinished = Interaction.ParsedArgs> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
  type = ApplicationCommandOptionTypes.SUB_COMMAND;
}


export interface ContextMenuMessageArgs {
  message: Structures.Message,
}

export class BaseMessageCommand extends BaseCommand<ContextMenuMessageArgs> {
  type = ApplicationCommandTypes.MESSAGE;
  triggerLoadingAsEphemeral = true;
}


export interface ContextMenuUserArgs {
  member?: Structures.Member,
  user: Structures.User,
}

export class BaseUserCommand extends BaseCommand<ContextMenuUserArgs> {
  type = ApplicationCommandTypes.USER;
  triggerLoadingAsEphemeral = true;
}