import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { fetchThread } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'close',
  description: 'Close this modmail thread',
  options: [{
    type: ApplicationCommandOptionType.Boolean,
    name: 'silence',
    description: 'Set this to skip notifying the user (only works for DM-to-observer threads)'
  }]
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  const silence = interaction.options.getBoolean('silence');

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');

  if (dm) {
    await interaction.client.db.threadUserToObserver.findOneAndUpdate({ uuid: thread.uuid }, { $set: { open: false } });
    await reply(
      `This thread is now closed. Once you no longer need it, use **/tcn-mail delete** to remove this channel. A transcript is available at ${process.env.MODMAIL_DOMAIN}/transcript/${thread.uuid}.`,
      false
    );

    if (!silence)
      await interaction.client.users.cache.get(thread.user).send({
        embeds: [{
          title: 'Modmail Thread Closed',
          description:
            'Thank you for reaching out to the TCN observer team. We hope we were able to help you. If you have any further inquiries, please open another modmail thread by simply sending another message.',
          color: 0x2d3136,
        }],
      }).catch(() => {});    
  } else {
    // TODO
  }
});
