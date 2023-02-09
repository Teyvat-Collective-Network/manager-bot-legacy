import { ApplicationCommandOptionType } from "@aroleaf/djs-bot";

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

  let thread = await interaction.client.db.threadUserToObserver.findOne({ targetChannel: interaction.channel.id, open: true });
  let dm = true;
  
  if (!thread) {
    const participant = await interaction.client.db.threadParticipant.findOne({ channel: interaction.channel.id });
    if (participant) {
      if (silence) return await reply('You cannot silently close inter-server modmail threads.');
      else thread = await interaction.client.db.threadInterServer.findOne({ uuid: participant.thread, open: true });
      dm = false;
    }
  }

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
})
