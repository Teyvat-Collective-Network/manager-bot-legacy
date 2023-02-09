import { Colors, Event, Events } from '@aroleaf/djs-bot';
import { copy_files, fetchModmailChannel, getUUID, serverAddPrompt } from '../../lib/modmail.js';

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
            { $set: { targetChannel: channel.id } }
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
                description: `A new modmail thread was opened: ${channel}. The transcript is available [here](${process.env.MODMAIL_DOMAIN}/transcript/${uuid}).`,
                color: 0x2d3136
              }],
            });
          } catch {}
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
        components: [],
      })
    } else if (interaction.customId === 'modmail/confirm-add') {
      const participant = await interaction.client.db.threadParticipant.findOne({ channel: interaction.channel.id });
      const thread = participant && await interaction.client.db.threadInterServer.findOne({ uuid: participant.thread });

      if (!thread)
        return await interaction.update({ content: 'This does not appear to be a modmail thread.', embeds: [], components: [] });

      const guilds = interaction.message.components.slice(0, -1).map(row => row.components[0].options.filter(option => option.default)).flat();

      await interaction.update({
        embeds: [{
          title: 'Adding servers...',
          color: 0x2d3136,
        }],
        components: [],
      });

      const success = [];
      const failed = [];

      for (const guild of guilds) {
        const id = guild.value;
        const name = guild.label;

        const settings = await interaction.client.db.modmailSettings.findOne({ guild: id });

        if (!settings?.logChannel) {
          failed.push(`${name} has not enabled modmail.`);
          continue;
        }

        const participant = await interaction.client.db.threadParticipant.findOne({ thread: thread.thread })

        const [channel, error] = await fetchModmailChannel(interaction.client.guilds.cache.get(id), participant?.channel, {
          name: thread.name,
          topic: `Modmail thread opened by **${interaction.guild.name}**`,
        });

        if (error) {
          failed.push(error);
          continue;
        }

        if (channel.id !== participant?.channel) {
          await interaction.client.db.threadParticipant.findOneAndUpdate(
            { thread: thread.uuid, guild: id },
            { $set: { channel: channel.id }, $setOnInsert: { subscribers: [], silenced: 0 } },
            { upsert: true }
          );

          if (settings.ping) await channel.send(settings.ping).catch(() => {});

          await channel.send({
            embeds: [{
              title: 'Modmail Thread Connected',
              description:
                `This channel is now connected to a modmail thread started by ${interaction.guild.name}. Use **/tcn-mail info** to see thread details, **/tcn-mail leave** if this was a mistake, and **/tcn-mail add** if you would like to add the observer team to this thread.`,
              color: 0x2d3136,
            }],
          });

          await interaction.client.channels.cache
            .get(settings.logChannel)
            ?.send({
              embeds: [{
                title: 'Modmail Thread Opened',
                description: `A new modmail thread was opened: ${channel}. The transcript is available [here](${process.env.MODMAIL_DOMAIN}/transcript/${thread.uuid})`,
                color: 0x2d3136,
              }],
            })
            .catch(() => {});
        }

        success.push(id);
      }

      if (success.length > 0) {
        await interaction.client.db.modmailMessage.create({
          thread: thread.uuid,
          type: 'cross-server-add',
          time: new Date(),
          author: interaction.user.id,
          origin: interaction.guild.id,
          files: success,
        });
      }

      if (failed.length === 0) {
        await interaction.editReply({
          embeds: [{
            title: 'All servers added successfully!',
            color: Colors.Green,
          }],
        });
      } else {
        await interaction.editReply({
          embeds: [{
            title: 'Adding some servers failed!',
            description: failed.join(' '),
            color: Colors.Yellow,
          }],
        });
      }
    } else if (interaction.customId === 'modmail/cancel-add') {
      await interaction.update({
        embeds: [{
          title: 'Adding servers canceled.',
          description: 'Use **/tcn-mail add** to add more servers.',
          color: Colors.Red,
        }],
        components: [],
      });
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId.match(/modmail\/update-server-add-list\[\d+\]/)) {
      const selected = interaction.message.components
        .slice(0, -1)
        .map(row => row.components[0])
        .filter(dropdown => dropdown.data.custom_id !== interaction.customId)
        .map(dropdown => dropdown.data.options.filter((option) => option.default).map((option) => option.value))
        .flat()
        .concat(interaction.values);

      await interaction.update(
        await serverAddPrompt(
          interaction,
          interaction.message.components
            .slice(0, -1)
            .map(row => row.components[0].options.map(option => ({
              id: option.value,
              name: option.label,
            })))
            .flat(),
          selected
        )
      );
    }
  }
})