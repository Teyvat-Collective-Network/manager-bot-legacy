export async function getAPIData(interaction) {
  const guild = await interaction.client.tcn.fetchGuild(interaction.options.getString('server', false) || interaction.guildId).catch(() => {});
  const user = await interaction.client.tcn.fetchUser(interaction.user.id).catch(() => {});
  return {
    guild,
    user,
    observer: user?.roles.includes('observer'),
    owner: guild?.owner === interaction.user.id,
    advisor: guild?.advisor === interaction.user.id,
    voter: guild?.voter === interaction.user.id,
  }
}