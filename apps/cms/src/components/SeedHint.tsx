import { getPayload } from "payload";
import config from "@payload-config";

export const SeedHint: React.FC = async () => {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: "landing" } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });

  if (result.totalDocs > 0) return null;

  return (
    <div
      style={{
        background: "var(--theme-elevation-50, #f0f4ff)",
        border: "1.5px solid var(--theme-success-500, #3b82f6)",
        borderRadius: "6px",
        padding: "14px 18px",
        marginBottom: "24px",
        fontSize: "13px",
        lineHeight: "1.6"
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
        Landing page not seeded yet
      </div>
      <div style={{ marginBottom: "10px", color: "var(--theme-elevation-800, #374151)" }}>
        No published landing page was found. Run the following command in the project root to
        populate the CMS with example content:
      </div>
      <code
        style={{
          display: "block",
          background: "var(--theme-elevation-100, #e5e7eb)",
          borderRadius: "4px",
          padding: "8px 12px",
          fontFamily: "monospace",
          fontSize: "13px",
          letterSpacing: "0.01em"
        }}
      >
        pnpm --filter @guildora/cms seed
      </code>
      <div style={{ marginTop: "8px", color: "var(--theme-elevation-600, #6b7280)", fontSize: "12px" }}>
        After running seed, refresh this page. The hint will disappear once the landing page exists.
      </div>
    </div>
  );
};
