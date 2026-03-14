export function getDiscordAvatarUrl(discordId: string, avatarHash: string | null | undefined) {
  if (!avatarHash) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
}
