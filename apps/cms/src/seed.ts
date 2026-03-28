import { getPayload } from "payload";
import config from "../payload.config";

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ensureMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  filename: string,
  alt: string
): Promise<number> {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true
  });
  if (existing.docs.length > 0) {
    const id = existing.docs[0].id as number;
    console.log(`Media exists: ${filename} → id ${id}`);
    return id;
  }
  const data = await downloadImage(url);
  const result = await payload.create({
    collection: "media",
    data: { alt },
    file: { data, mimetype: "image/jpeg", name: filename, size: data.length },
    overrideAccess: true
  });
  console.log(`Uploaded: ${filename} → id ${result.id}`);
  return result.id as number;
}

const richTextContent = {
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "heading",
        tag: "h2",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "text", text: "About Guildora", format: 0, style: "", mode: "normal", detail: 0, version: 1 }
        ]
      },
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Guildora was founded in 2021 by a group of dedicated gamers tired of communities that felt either too casual or too elitist. We set out to build something different: a guild with structure, ambition, and genuine respect for every member — no matter their skill level.",
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
            version: 1
          }
        ]
      },
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Today we are 300+ strong across 6 game titles, running weekly tournaments, coaching sessions, and community events. Whether you're hitting Masters rank or just getting started in competitive play, there's a place for you here.",
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
            version: 1
          }
        ]
      }
    ]
  }
};

const richTextContentDe = {
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "heading",
        tag: "h2",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          { type: "text", text: "Über Guildora", format: 0, style: "", mode: "normal", detail: 0, version: 1 }
        ]
      },
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Guildora wurde 2021 von einer Gruppe leidenschaftlicher Gamer gegründet, die genug von Communities hatten, die sich entweder zu casual oder zu elitär anfühlten. Wir haben uns vorgenommen, etwas anderes aufzubauen: eine Guild mit Struktur, Ehrgeiz und echtem Respekt für jedes Mitglied — unabhängig vom Skill-Level.",
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
            version: 1
          }
        ]
      },
      {
        type: "paragraph",
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: "Heute sind wir 300+ Mitglieder stark, verteilt auf 6 Game-Titel, und veranstalten wöchentlich Turniere, Coaching-Sessions und Community-Events. Ob du Masters-Rang anstrebst oder gerade erst mit kompetitivem Spielen anfängst — hier ist Platz für dich.",
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
            version: 1
          }
        ]
      }
    ]
  }
};

async function seed() {
  const payload = await getPayload({ config });

  // Ensure all images exist (idempotent — skips upload if filename already in DB)
  const [heroId, arenaId, teamId, tournamentId, streamId] = await Promise.all([
    ensureMedia(payload, "https://picsum.photos/seed/guildora-hero/1920/1080", "guildora-hero.jpg", "Guildora community banner"),
    ensureMedia(payload, "https://picsum.photos/seed/guildora-arena/1280/720", "guildora-arena.jpg", "Guildora community competing"),
    ensureMedia(payload, "https://picsum.photos/seed/guildora-team/800/600", "guildora-team.jpg", "Guildora team photo"),
    ensureMedia(payload, "https://picsum.photos/seed/guildora-tournament/800/600", "guildora-tournament.jpg", "Guildora tournament stage"),
    ensureMedia(payload, "https://picsum.photos/seed/guildora-stream/800/600", "guildora-stream.jpg", "Guildora community stream night")
  ]);

  const layoutEn = [
    // 1. HERO — full-width hook with background image
    {
      blockType: "hero",
      eyebrowLabel: "Applications Open · Season 4",
      heading: "Guildora – Build Your Legacy",
      subheading:
        "A competitive multi-game community for players who are serious about improving, competing, and belonging. 300+ members. 6 game titles. One home.",
      backgroundImage: heroId,
      ctaText: "Apply Now",
      ctaLink: "/apply",
      ctaExploreLabel: "Learn More"
    },

    // 2. FEATURES — 6 community pillars
    {
      blockType: "features",
      sectionTitle: "What We're About",
      features: [
        {
          icon: "🏆",
          title: "Tournaments",
          description: "Weekly in-house tournaments and external competitions across multiple titles. Every match counts."
        },
        {
          icon: "⚔️",
          title: "Ranked Scrims",
          description: "Structured scrim sessions against other guilds to keep your competitive edge sharp."
        },
        {
          icon: "📺",
          title: "Content & Clips",
          description: "We clip it, we edit it, we post it. Join our content team or share your highlights."
        },
        {
          icon: "🎓",
          title: "Coaching",
          description: "Dedicated coaches and veteran players who break down your gameplay and help you level up."
        },
        {
          icon: "🎉",
          title: "Community Nights",
          description: "Regular game nights, watch parties, and events where the whole guild comes together."
        },
        {
          icon: "🎮",
          title: "Multi-Game",
          description: "From FPS to Battle Royale to MMO — we cover 6 titles and are always expanding."
        }
      ]
    },

    // 3. HOW IT WORKS — 4-step application funnel
    {
      blockType: "how-it-works",
      sectionTitle: "Your Path In",
      steps: [
        { title: "Apply", description: "Fill in our short application: your game, rank, and why you want in." },
        { title: "Review", description: "Our council reviews every application within 48 hours." },
        { title: "Onboarding", description: "Get your Discord roles, meet your game team lead, and join your first session." },
        { title: "First Match", description: "Jump into your first scrim or tournament and start building your rank." }
      ]
    },

    // 4. IMAGE — wide atmospheric shot with caption
    {
      blockType: "image",
      image: arenaId,
      alt: "Guildora community competing",
      caption: "We compete across 6 game titles with 300+ active members — from casual to top-tier competitive."
    },

    // 5. GALLERY — team / tournament / stream
    {
      blockType: "gallery",
      layout: "grid",
      images: [
        { image: teamId, alt: "Guildora team photo" },
        { image: tournamentId, alt: "Guildora tournament stage" },
        { image: streamId, alt: "Guildora community stream night" }
      ]
    },

    // 6. ABOUT — founding story and values
    {
      blockType: "richText",
      content: richTextContent
    },

    // 7. DISCORD — social proof
    {
      blockType: "discordInvite",
      heading: "300+ Members. One Discord.",
      description:
        "All guild activity lives on Discord — matchmaking, announcements, coaching bookings, and after-game talk. Join now and introduce yourself.",
      inviteCode: "guildora"
    },

    // 8. CTA — final conversion with urgency
    {
      blockType: "cta",
      heading: "Applications Are Open — Limited Spots",
      description:
        "We accept new members in cohorts to keep quality high. Spots for this cycle are limited. Don't miss your chance to join.",
      buttonText: "Apply to Guildora",
      buttonLink: "/apply",
      variant: "accent"
    }
  ];

  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "landing" } },
    limit: 1,
    overrideAccess: true
  });

  let pageId: number | string;

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: "pages",
      id: existing.docs[0].id,
      locale: "en",
      data: {
        title: "Landing Page",
        slug: "landing",
        status: "published",
        layout: layoutEn as any,
        seo: {
          title: "Guildora – Build Your Legacy",
          description:
            "Guildora is a competitive multi-game community for serious players. 300+ members. 6 game titles. Applications are open."
        }
      },
      overrideAccess: true
    });
    pageId = updated.id;
    console.log("Updated landing page (EN)");
  } else {
    const created = await payload.create({
      collection: "pages",
      locale: "en",
      data: {
        title: "Landing Page",
        slug: "landing",
        status: "published",
        layout: layoutEn as any,
        seo: {
          title: "Guildora – Build Your Legacy",
          description:
            "Guildora is a competitive multi-game community for serious players. 300+ members. 6 game titles. Applications are open."
        }
      },
      overrideAccess: true
    });
    pageId = created.id;
    console.log("Created landing page (EN)");
  }

  const saved = await payload.findByID({
    collection: "pages",
    id: pageId,
    locale: "en",
    overrideAccess: true
  });

  const layoutDe = (saved.layout ?? []).map((block: Record<string, unknown>) => {
    if (block.blockType === "hero") {
      return {
        ...block,
        eyebrowLabel: "Bewerbungen offen · Saison 4",
        heading: "Guildora – Schreib deine Geschichte",
        subheading:
          "Eine kompetitive Multi-Game-Community für Spieler, die es ernst meinen mit Verbesserung, Wettkampf und Zugehörigkeit. 300+ Mitglieder. 6 Game-Titel. Ein Zuhause.",
        ctaText: "Jetzt bewerben",
        ctaExploreLabel: "Mehr erfahren"
      };
    }
    if (block.blockType === "features") {
      const deFeatures = [
        { title: "Turniere", description: "Wöchentliche In-House-Turniere und externe Wettkämpfe über mehrere Titel. Jedes Match zählt." },
        { title: "Ranked Scrims", description: "Strukturierte Scrim-Sessions gegen andere Guilds, um deine Wettkampfstärke zu schärfen." },
        { title: "Content & Clips", description: "Wir clippen es, wir schneiden es, wir posten es. Tritt unserem Content-Team bei oder teile deine Highlights." },
        { title: "Coaching", description: "Dedizierte Coaches und erfahrene Spieler, die dein Gameplay analysieren und dir helfen, besser zu werden." },
        { title: "Community Nights", description: "Regelmäßige Spieleabende, Watch Parties und Events, bei denen die ganze Guild zusammenkommt." },
        { title: "Multi-Game", description: "Von FPS über Battle Royale bis MMO — wir decken 6 Titel ab und expandieren ständig." }
      ];
      const features = ((block.features as Record<string, unknown>[]) ?? []).map(
        (f: Record<string, unknown>, i: number) => ({
          ...f,
          title: deFeatures[i]?.title ?? f.title,
          description: deFeatures[i]?.description ?? f.description
        })
      );
      return { ...block, sectionTitle: "Was uns ausmacht", features };
    }
    if (block.blockType === "how-it-works") {
      const deSteps = [
        { title: "Bewerben", description: "Füll unsere kurze Bewerbung aus: dein Game, dein Rank und warum du dabei sein willst." },
        { title: "Überprüfung", description: "Unser Council prüft jede Bewerbung innerhalb von 48 Stunden." },
        { title: "Onboarding", description: "Hol dir deine Discord-Rollen, lern deinen Game-Team-Lead kennen und nimm an deiner ersten Session teil." },
        { title: "Erster Match", description: "Spring in deinen ersten Scrim oder ein Turnier und fang an, deinen Rang aufzubauen." }
      ];
      const steps = ((block.steps as Record<string, unknown>[]) ?? []).map(
        (s: Record<string, unknown>, i: number) => ({
          ...s,
          title: deSteps[i]?.title ?? s.title,
          description: deSteps[i]?.description ?? s.description
        })
      );
      return { ...block, sectionTitle: "Dein Weg rein", steps };
    }
    if (block.blockType === "image") {
      return {
        ...block,
        alt: "Guildora Community im Wettkampf",
        caption: "Wir treten über 6 Game-Titel mit 300+ aktiven Mitgliedern an — von casual bis top-kompetitiv."
      };
    }
    if (block.blockType === "gallery") {
      const deAlts = ["Guildora Teamfoto", "Guildora Turnierbühne", "Guildora Community Stream Abend"];
      const images = ((block.images as Record<string, unknown>[]) ?? []).map(
        (img: Record<string, unknown>, i: number) => ({ ...img, alt: deAlts[i] ?? img.alt })
      );
      return { ...block, images };
    }
    if (block.blockType === "richText") {
      return { ...block, content: richTextContentDe };
    }
    if (block.blockType === "discordInvite") {
      return {
        ...block,
        heading: "300+ Mitglieder. Ein Discord.",
        description:
          "Alle Guild-Aktivitäten laufen über Discord — Matchmaking, Ankündigungen, Coaching-Buchungen und After-Game-Talk. Tritt jetzt bei und stell dich vor."
      };
    }
    if (block.blockType === "cta") {
      return {
        ...block,
        heading: "Bewerbungen offen — Begrenzte Plätze",
        description:
          "Wir nehmen neue Mitglieder in Kohorten auf, um die Qualität hoch zu halten. Die Plätze für diesen Zyklus sind begrenzt. Verpasse nicht deine Chance.",
        buttonText: "Bei Guildora bewerben"
      };
    }
    return block;
  });

  await payload.update({
    collection: "pages",
    id: pageId,
    locale: "de",
    data: {
      title: "Startseite",
      layout: layoutDe as any,
      seo: {
        title: "Guildora – Schreib deine Geschichte",
        description:
          "Guildora ist eine kompetitive Multi-Game-Community für ernsthafte Spieler. 300+ Mitglieder. 6 Game-Titel. Bewerbungen sind offen."
      }
    },
    overrideAccess: true
  });
  console.log("Updated landing page (DE)");

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
