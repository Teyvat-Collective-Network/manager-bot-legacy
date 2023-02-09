import { ButtonStyle, ChannelType, ComponentType, Event, Events } from "@aroleaf/djs-bot";

export default new Event({
  event: Events.MessageCreate,
}, async message => {
  if (message.author.id === message.client.user.id) return;

  // Check DMs for user-to-observer
  if (message.channel.type === ChannelType.DM) {
    // If the user is banned, immediately abort
    if (await message.client.db.bannedUsers.exists({ user: message.author.id })) {
      return await message.reply('You are banned from using TCN modmail.');
    }

    // If a thread exists, prompt to send; otherwise, prompt to create
    let embed;

    if (await message.client.db.threadUserToObserver.exists({ user: message.author.id, open: true })) {
      embed = {
        title: 'Confirm sending message.',
        description:
          'You have a modmail thread open with the observer team right now. Click "Confirm" to send your message. You can edit it before, but not after, sending.',
        color: 0x2d3136,
      };
    } else {
      embed = {
        title: 'Confirm creating thread.',
        description: 'You have reached the Teyvat Collective Network observer team. Click "Confirm" if you are sure you would like to open a new modmail thread with the team. You can edit it before, but not after, sending.',
        color: 0x2d3136,
      };
    }

    if (message.stickers.size > 0)
      if (message.content || message.attachments.size > 0)
        embed.footer = { text: 'Stickers cannot be relayed. Please cancel and re-send your message if you need to change your message.' };
      else return await message.reply('Stickers cannot be sent through modmail.');

    await message.reply({
      embeds: [embed],
      components: [{
        type: ComponentType.ActionRow,
        components: [{
          type: ComponentType.Button,
          customId: 'modmail/confirm-send',
          style: ButtonStyle.Success,
          label: 'Confirm',
        }, {
          type: ComponentType.Button,
          customId: 'modmail/cancel-send',
          style: ButtonStyle.Danger,
          label: 'Cancel',
        }]
      }]
    })
  }
})