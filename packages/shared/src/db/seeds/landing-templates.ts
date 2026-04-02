export interface TemplateSeed {
  id: string;
  name: string;
  description: string;
  isBuiltin: true;
}

export interface SectionSeed {
  blockType: string;
  sortOrder: number;
  visible: boolean;
  config: Record<string, unknown>;
  content: { en: Record<string, unknown>; de: Record<string, unknown> };
}

export const defaultTemplate: TemplateSeed = {
  id: "default",
  name: "Default",
  description: "A clean, minimal landing page suitable for any community.",
  isBuiltin: true
};

export const gamingTemplate: TemplateSeed = {
  id: "gaming",
  name: "Gaming",
  description: "Bold and energetic — designed for gaming communities with tournaments and competitive play.",
  isBuiltin: true
};

export const esportsTemplate: TemplateSeed = {
  id: "esports",
  name: "eSports",
  description: "Professional eSports layout with team showcase, stats, and tournament focus.",
  isBuiltin: true
};

export const templates: TemplateSeed[] = [defaultTemplate, gamingTemplate, esportsTemplate];

export const defaultSections: SectionSeed[] = [
  {
    blockType: "hero",
    sortOrder: 0,
    visible: true,
    config: { layout: "centered" },
    content: {
      en: {
        eyebrowLabel: "Applications Open",
        heading: "Build Your Legacy",
        subheading: "A competitive multi-game community for players who are serious about improving, competing, and belonging.",
        ctaText: "Apply Now",
        ctaLink: "/apply",
        ctaExploreLabel: "Learn More"
      },
      de: {
        eyebrowLabel: "Bewerbungen offen",
        heading: "Schreib deine Geschichte",
        subheading: "Eine kompetitive Multi-Game-Community für Spieler, die es ernst meinen mit Verbesserung, Wettkampf und Zugehörigkeit.",
        ctaText: "Jetzt bewerben",
        ctaLink: "/apply",
        ctaExploreLabel: "Mehr erfahren"
      }
    }
  },
  {
    blockType: "features",
    sortOrder: 1,
    visible: true,
    config: { columns: 3 },
    content: {
      en: {
        sectionTitle: "What We're About",
        features: [
          { icon: "trophy", title: "Tournaments", description: "Weekly in-house tournaments and external competitions across multiple titles." },
          { icon: "swords", title: "Ranked Scrims", description: "Structured scrim sessions against other guilds to keep your competitive edge sharp." },
          { icon: "video", title: "Content & Clips", description: "We clip it, we edit it, we post it. Join our content team or share your highlights." },
          { icon: "graduation-cap", title: "Coaching", description: "Dedicated coaches and veteran players who break down your gameplay and help you level up." },
          { icon: "party-popper", title: "Community Nights", description: "Regular game nights, watch parties, and events where the whole guild comes together." },
          { icon: "gamepad-2", title: "Multi-Game", description: "From FPS to Battle Royale to MMO — we cover multiple titles and are always expanding." }
        ]
      },
      de: {
        sectionTitle: "Was uns ausmacht",
        features: [
          { icon: "trophy", title: "Turniere", description: "Wöchentliche In-House-Turniere und externe Wettkämpfe über mehrere Titel." },
          { icon: "swords", title: "Ranked Scrims", description: "Strukturierte Scrim-Sessions gegen andere Guilds, um deine Wettkampfstärke zu schärfen." },
          { icon: "video", title: "Content & Clips", description: "Wir clippen es, schneiden es und posten es. Tritt unserem Content-Team bei." },
          { icon: "graduation-cap", title: "Coaching", description: "Coaches und erfahrene Spieler analysieren dein Gameplay und helfen dir, besser zu werden." },
          { icon: "party-popper", title: "Community Nights", description: "Regelmäßige Spieleabende, Watch Parties und Events für die ganze Guild." },
          { icon: "gamepad-2", title: "Multi-Game", description: "Von FPS über Battle Royale bis MMO — wir decken mehrere Titel ab." }
        ]
      }
    }
  },
  {
    blockType: "how-it-works",
    sortOrder: 2,
    visible: true,
    config: {},
    content: {
      en: {
        sectionTitle: "Your Path In",
        steps: [
          { title: "Apply", description: "Fill in our short application: your game, rank, and why you want in." },
          { title: "Review", description: "Our council reviews every application within 48 hours." },
          { title: "Onboarding", description: "Get your Discord roles, meet your team lead, and join your first session." },
          { title: "First Match", description: "Jump into your first scrim or tournament and start building your rank." }
        ]
      },
      de: {
        sectionTitle: "Dein Weg rein",
        steps: [
          { title: "Bewerben", description: "Füll unsere kurze Bewerbung aus: dein Game, dein Rang und warum du dabei sein willst." },
          { title: "Überprüfung", description: "Unser Council prüft jede Bewerbung innerhalb von 48 Stunden." },
          { title: "Onboarding", description: "Hol dir deine Discord-Rollen, lern deinen Team-Lead kennen und nimm teil." },
          { title: "Erster Match", description: "Spring in deinen ersten Scrim oder ein Turnier und bau deinen Rang auf." }
        ]
      }
    }
  },
  {
    blockType: "rich-text",
    sortOrder: 3,
    visible: true,
    config: {},
    content: {
      en: {
        title: "About Us",
        body: "Founded by a group of dedicated gamers who wanted something different: a guild with structure, ambition, and genuine respect for every member — no matter their skill level. Today we are 300+ strong across multiple game titles, running weekly tournaments, coaching sessions, and community events."
      },
      de: {
        title: "Über uns",
        body: "Gegründet von einer Gruppe leidenschaftlicher Gamer, die etwas Anderes wollten: eine Guild mit Struktur, Ehrgeiz und echtem Respekt für jedes Mitglied — unabhängig vom Skill-Level. Heute sind wir 300+ Mitglieder stark, verteilt auf mehrere Game-Titel, mit wöchentlichen Turnieren, Coaching-Sessions und Community-Events."
      }
    }
  },
  {
    blockType: "discord-invite",
    sortOrder: 4,
    visible: true,
    config: {},
    content: {
      en: {
        heading: "300+ Members. One Discord.",
        description: "All guild activity lives on Discord — matchmaking, announcements, coaching bookings, and after-game talk. Join now and introduce yourself."
      },
      de: {
        heading: "300+ Mitglieder. Ein Discord.",
        description: "Alle Guild-Aktivitäten laufen über Discord — Matchmaking, Ankündigungen, Coaching-Buchungen und After-Game-Talk. Tritt jetzt bei."
      }
    }
  },
  {
    blockType: "cta",
    sortOrder: 5,
    visible: true,
    config: { variant: "accent" },
    content: {
      en: {
        heading: "Applications Are Open — Limited Spots",
        description: "We accept new members in cohorts to keep quality high. Spots for this cycle are limited. Don't miss your chance to join.",
        buttonText: "Apply Now",
        buttonLink: "/apply"
      },
      de: {
        heading: "Bewerbungen offen — Begrenzte Plätze",
        description: "Wir nehmen neue Mitglieder in Kohorten auf, um die Qualität hoch zu halten. Plätze sind begrenzt.",
        buttonText: "Jetzt bewerben",
        buttonLink: "/apply"
      }
    }
  }
];
