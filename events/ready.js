import { Event, Events } from '@aroleaf/djs-bot';

export default new Event({
  event: Events.ClientReady,
}, async client => {
  for (const [,guild] of client.guilds.cache) {
    await guild.members.fetch();
    console.log(`cached ${guild.members.cache.size} members for ${guild.name}`);
  }
  console.log(`total cached users: ${client.users.cache.size}`);

  console.log('ready!');
});