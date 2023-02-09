import { ComponentType, TextInputStyle } from 'discord.js';
import { baseReplyOptions, fetchThread, relay } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'reply-modal',
  description: 'Reply to this modmail thread (input content in a modal)',
  options: baseReplyOptions,
}, async interaction => {
  const { thread } = await fetchThread(interaction);
  if (!thread) return await interaction.reply({ content: 'This is not a modmail thread.', ephemeral: true });
  
  await interaction.showModal({
    title: 'Reply To Modmail Thread',
    customId: 'modmail/reply-modal',
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.TextInput,
        label: 'Message Content',
        customId: 'content',
        style: TextInputStyle.Paragraph,
        placeholder: 'You have half an hour to reply.',
        required: true,
      }],
    }],
  });

  let modal;

  try {
    modal = await interaction.awaitModalSubmit({ time: 30 * 60 * 1000 });
  } catch {
    return;
  }

  await relay(modal, {
    content: modal.fields.getTextInputValue('content'),
    anon: interaction.options.getBoolean('anon'),
    files: [...new Array(10).keys()].map(i => interaction.options.getAttachment(`file-${i + 1}`)).filter(x => x),
  });
});
