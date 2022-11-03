import { Event, Events } from '@aroleaf/djs-bot';
import { updateRoles } from '../../lib/update.js';

export default new Event({
  event: Events.GuildMemberAdd,
}, async member => {
  await updateRoles([member.user]).catch(() => {});
});