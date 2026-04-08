/**
 * Maps block type slugs (kebab-case) to Nuxt auto-imported component names.
 * Self-hosters can add custom blocks by dropping a .vue file in this directory —
 * Nuxt auto-imports them, and adding an entry here makes them available.
 */
export const blockComponentMap: Record<string, string> = {
  "hero": "LandingBlocksHero",
  "features": "LandingBlocksFeatures",
  "how-it-works": "LandingBlocksHowItWorks",
  "cta": "LandingBlocksCta",
  "rich-text": "LandingBlocksRichText",
  "gallery": "LandingBlocksGallery",
  "youtube": "LandingBlocksYoutube",
  "discord-invite": "LandingBlocksDiscordInvite",
  "testimonials": "LandingBlocksTestimonials",
  "stats": "LandingBlocksStats",
  "faq": "LandingBlocksFaq",
  "team": "LandingBlocksTeam",
  "applications": "LandingBlocksApplications"
};

/**
 * Resolves a block type to a Nuxt component name.
 * First checks the static map, then falls back to convention-based resolution:
 * "my-block" → "LandingBlocksMyBlock" (kebab-case to PascalCase).
 * This allows self-hosters to add custom blocks without modifying this file.
 */
export function resolveBlockComponent(blockType: string): string {
  if (blockComponentMap[blockType]) {
    return blockComponentMap[blockType];
  }

  // Convention: kebab-case → PascalCase, prefixed with LandingBlocks
  const pascal = blockType
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `LandingBlocks${pascal}`;
}
