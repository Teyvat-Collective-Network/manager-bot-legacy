import { ApplicationCommandOptionType } from "@aroleaf/djs-bot";
import { baseReplyOptions, relay } from "../../../lib/modmail.js";

import parent from './index.js';

parent.subcommand({
  name: 'reply',
  description: 'Reply to this modmail thread',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'content',
    description: 'The content to reply with',
    maxLength: 1024,
  }, ...baseReplyOptions],
}, async interaction => {
  await relay(interaction, {
    content: interaction.options.getString('content'),
    anon: interaction.options.getBoolean('anon'),
    files: [...new Array(10).keys()].map(i => interaction.options.getAttachment(`file-${i + 1}`)).filter(x => x),
  });
});
