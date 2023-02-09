import { Colors, Event, Events } from "@aroleaf/djs-bot";
import { copy_files, fetchModmailChannel, getUUID } from "../../lib/modmail.js";

export default new Event({
  event: Events.InteractionCreate,
}, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'modmail/confirm-send') {
      if (await interaction.client.db.bannedUsers.exists({ user: interaction.user.id })) {
        return await interaction.update({ content: 'You are banned from using TCN modmail.', embeds: [], components: [] });
      }

      await interaction.update({ components: [] });

      let message;

      try {
        message = await interaction.message.fetchReference();
      } catch {
        return await interaction.editReply({
          embeds: [{
            title: 'Could not obtain original message.',
            description: 'Please try again.',
            color: Colors.Red,
          }],
        });
      }
      
      let target = await interaction.client.db.threadUserToObserver.findOne({ user: interaction.user.id, open: true });
      let uuid = target?.uuid;

      const [channel, error] = await fetchModmailChannel(interaction.client.hq, target?.targetChannel, {
        name: interaction.user.tag,
        topic: `Modmail thread with ${interaction.user}`,
      });

      if (error)
        return await interaction.editReply({
          embeds: [{
            title: 'Sending failed.',
            description: error,
            color: Colors.Red,
          }],
        });

      let settings = null;
      
      if (channel.id !== target?.targetChannel) {
        settings = await interaction.client.db.modmailSettings.findOne({ guild: interaction.client.hq.id });

        if (target) {
          await interaction.client.db.threadUserToObserver.findOneAndUpdate(
            { uuid: target.uuid },
            { $set: { targetChannel: channel.id }}
          );

          try {
            await interaction.client.hq.channels.cache.get(settings?.logChannel)?.send({
              embeds: [{
                title: 'Modmail Thread Resumed',
                description: `A modmail thread was resumed in ${channel}. The transcript is available [here](${process.env.MODMAIL_DOMAIN}/transcript/${target.uuid}).`,
                color: 0x2d3136,
              }],
            })
          } catch (error) {
            console.error(error);
          }
        } else {
          uuid = await getUUID(interaction.client.db.threadUserToObserver);

          await interaction.client.db.threadUserToObserver.create({
            uuid,
            user: interaction.user.id,
            targetChannel: channel.id,
            open: true,
          });

          try {
            await interaction.client.hq.channels.cache.get(settings?.logChannel)?.send({
              embeds: [{
                title: 'Modmail Thread Opened',
                description: `A new modmail thread was opened: ${channel}. The transcript is available here: [here](${process.env.MODMAIL_DOMAIN}/transcript/${uuid}).`,
                color: 0x2d3136
              }],
            });
          } catch (error) {
            console.error(error);
          }
        }

        if (settings.ping)
          try {
            await channel.send(settings.ping);
          } catch (error) {
            console.error(error)
          }
      }

      await channel.send({
        embeds: [{
          title: 'Incoming Message',
          description: message.content,
          color: 0x2d3136,
          author: {
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          },
          footer: {
            text: message.url,
          },
        }],
        files: copy_files(message.attachments.values(), 1),
      });

      await interaction.client.db.modmailMessage.create({
        thread: uuid,
        type: 'user-incoming',
        time: new Date(),
        author: interaction.user.id,
        content: message.content,
        files: message.attachments.map(a => a.url),
      });

      await interaction.editReply({
        embeds: [{
          title: channel.id === target?.targetChannel ? 'Message sent.' : 'Thread opened',
          description: 'Your message has been sent!',
          color: Colors.Green,
          footer: channel.id === target?.targetChannel ? null : { text: 'We will get back to you as soon as possible.' },
        }],
      })
    } else if (interaction.customId === 'modmail/cancel-send') {
      await interaction.update({
        embeds: [{
          title: 'Sending canceled.',
          description: 'Sending of this message was canceled. To send it, just send the message again.',
          color: Colors.Red,
        }],
      })
    }
  }
})