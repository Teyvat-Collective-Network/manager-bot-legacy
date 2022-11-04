import { Event, Events } from '@aroleaf/djs-bot';

export default new Event({
  event: Events.GuildCreate,
}, async guild => {
  await guild.members.fetch();
  console.log(`cached ${guild.members.cache.size} members for ${guild.name}\ntotal cached users: ${guild.client.users.cache.size}`);
})