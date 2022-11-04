import { Event, Events } from '@aroleaf/djs-bot';

export default new Event({
  event: Events.GuildCreate,
}, async guild => {
  await guild.members.fetch();
  console.log(`cached ${guild.members.cache.size} members for ${guild.name}`);
  console.log(`total cached users: ${client.users.cache.size}`);
})