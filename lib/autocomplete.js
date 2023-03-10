import fzy from 'fzy.js';
import characters from './characters.js';

function filter(list, query, map = i => i) {
  return query ? list.filter(i => fzy.hasMatch(query, map(i))).sort((a, b) => fzy.score(query, map(b)) - fzy.score(query, map(a))) : list;
}

export async function character(interaction) {
  return interaction.respond(filter(
    Object.entries(characters),
    interaction.options.getFocused(),
    ([k, v]) => `${k} ${v.name}`
  ).map(([k, v]) => ({ name: v.name, value: k })).slice(0, 25));
}

export async function server(interaction) {
  const servers = await interaction.client.tcn.fetchGuilds();
  return interaction.respond(filter(
    servers,
    interaction.options.getFocused(),
    s => (characters[s.character] ? [s.character, characters[s.character].name] : []).concat(s.name).join(' ')
  ).map(s => ({ name: s.name, value: s.id })).slice(0, 25));
}