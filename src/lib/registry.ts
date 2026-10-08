// Shared by the (future) registry build script and the site, so the command a
// tile copies always points at a file the build actually produces.

/** Registry item holding the orb engine; every per-orb item depends on it. */
export const REGISTRY_CORE = "orbish";

/**
 * The site's public origin, baked into the registry at build time.
 *
 * Set REGISTRY_URL explicitly for a custom domain. On Vercel the production
 * domain is picked up automatically; locally it falls back to the dev server.
 */
export function registryOrigin(): string {
  const explicit = process.env.REGISTRY_URL ?? process.env.NEXT_PUBLIC_REGISTRY_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

// How each package manager runs a one-off CLI without installing it.
const RUNNERS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

/**
 * The install command for a registry item — one orb mode, or REGISTRY_CORE for
 * the whole engine. The /r/*.json files do not exist yet; this is the shape the
 * registry build will produce, mirroring soonish.
 */
export function installCommand(name: string, origin: string, pm: PackageManager = "npm"): string {
  return `${RUNNERS[pm]} shadcn@latest add ${origin}/r/${name}.json`;
}

/** PascalCase from a kebab-case slug: "searching" → "Searching". */
const pascal = (slug: string) => slug.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

/**
 * Source of one orb's named wrapper, exactly as the registry ships it to
 * components/orbish/orbs/<state>.tsx. Shared by the registry build and the
 * orb pages' Manual tab, so the two can never differ.
 */
export function orbWrapperSource(state: string, mode: string): string {
  const name = pascal(state);
  return `import { ThinkingOrb, type OrbParams, type ThinkingOrbProps } from "..";

export type ${name}OrbProps = Omit<ThinkingOrbProps, "state" | "mode" | "params"> & {
  /** Settings specific to this orb (${mode} mode), applied after \`density\` and \`dotScale\`. */
  params?: OrbParams<"${mode}">;
};

/** The "${state}" orb from orbish. Accepts every <ThinkingOrb /> prop except \`state\` and \`mode\`. */
export function ${name}Orb(props: ${name}OrbProps) {
  return <ThinkingOrb state="${state}" {...props} />;
}
`;
}
