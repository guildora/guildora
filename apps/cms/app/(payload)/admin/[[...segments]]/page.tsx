import type { Metadata } from "next";
import config from "@payload-config";
import { RootPage } from "@payloadcms/next/views";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const resolved = await config;
    return { title: (resolved as { admin?: { meta?: { title?: string } } })?.admin?.meta?.title ?? "Admin" };
  } catch {
    return { title: "Admin" };
  }
}

type PageProps = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ params, searchParams }: PageProps) {
  const segments = (await params).segments;
  // Pass undefined when no segments (root /admin) so Payload's formatAdminURL gets path: null
  // and currentRoute stays "/admin"; passing [] yields path: "/" and currentRoute "/admin/" !== adminRoute.
  const paramsForPayload = Promise.resolve({
    segments: Array.isArray(segments) ? segments : segments !== undefined ? [segments] : undefined
  }) as Promise<{ segments: string[] }>;
  const raw = await searchParams;
  const searchParamsForPayload = Promise.resolve(
    Object.fromEntries(
      Object.entries(raw ?? {}).filter(([, v]) => v !== undefined) as [string, string | string[]][]
    )
  );
  // Dynamic import so the generated importMap is always resolved at runtime (avoids bundling issues).
  const { importMap } = await import("../importMap");
  return RootPage({
    config,
    importMap,
    params: paramsForPayload,
    searchParams: searchParamsForPayload
  });
}
