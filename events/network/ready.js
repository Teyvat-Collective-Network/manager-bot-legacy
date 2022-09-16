import { Event, Events } from '@aroleaf/djs-bot';

export default new Event({
  event: Events.ClientReady,
}, async () => {
  console.log('ready');
});