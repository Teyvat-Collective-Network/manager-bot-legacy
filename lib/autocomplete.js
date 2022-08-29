import fzy from 'fzy.js';
import { CHARACTER_NAMES } from './constants.js';

function filter(list, query, map = i => i) {
  return query ? list.filter(i => fzy.hasMatch(query, map(i))).sort((a, b) => fzy.score(query, map(b)) - fzy.score(query, map(a))) : list;
}

export async function character(interaction) {
  return interaction.respond(filter(
    CHARACTER_NAMES,
    interaction.options.getFocused().toLowerCase(),
    n => n.join(' ').toLowerCase()
  ).map(n => ({ name: n[1], value: n[0] })).slice(0, 25));
}

export async function server(interaction) {
  const servers = await interaction.client.tcn.fetchGuilds();
  return interaction.respond(filter(
    servers,
    interaction.options.getFocused().toLowerCase(),
    s => (CHARACTER_NAMES.find(n => n[0] === s.character) || []).concat(s.name).join(' ').toLowerCase()
  ).map(s => ({ name: s.name, value: s.id })).slice(0, 25));
}