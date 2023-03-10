import { Event, Events } from '@aroleaf/djs-bot';
import { Events as TCNEvents } from '@aroleaf/tcn-api';

export default new Event({
  event: Events.ClientReady,
}, async client => {
  client.tcn.connect();
  await new Promise(res => client.tcn.on(TCNEvents.Init, () => res()));
  console.log('connected to the TCN API');
  
  for (const [,guild] of client.guilds.cache) {
    await guild.members.fetch();
    console.log(`cached ${guild.members.cache.size} members for ${guild.name}`);
  }
  console.log(`total cached users: ${client.users.cache.size}`);

  console.log('ready!');
});