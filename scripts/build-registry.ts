// Generates the shadcn registry for orbish, then builds it into public/r.
//
//   npm run registry:build
//
// Two kinds of item come out of this, mirroring soonish:
//
//   orbish         The whole engine — <ThinkingOrb />, <OrbLoader />,
//                  <ShimmerText /> and every visual mode. Installing it alone
//                  gives you the full set.
//   <state-name>   One per semantic state (searching, debugging, …): a tiny
//                  named wrapper, e.g. <SearchingOrb />, that depends on
//                  `orbish`, so the CLI installs the engine alongside it the
//                  first time.
//
// Everything is derived from ORB_STATES and the library folder itself, so a
// state or mode added to the library gets shipped on the next build with no
// edits here.
//
// registryDependencies must be absolute URLs — the shadcn CLI reads a "./"
// dependency as a local file path, not relative to the item's own URL — so
// the site's origin is baked in at build time (REGISTRY_URL, see
// src/lib/registry.ts).

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ORB_STATES } from "../src/lib/orbs/config";
import { REGISTRY_CORE, orbWrapperSource, registryOrigin } from "../src/lib/registry";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "registry"); // generated, gitignored
const SRC = "src/lib/orbs";
// Where the files land in the user's project.
const TARGET = "components/orbish";

const origin = registryOrigin();
const STATES = Object.keys(ORB_STATES);

/** Every file in the library, relative to SRC. The library imports only relatively, so it moves as a unit. */
function walk(dir: string, prefix = ""): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((entry) => {
      const full = path.join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      return statSync(full).isDirectory() ? walk(full, rel) : [rel];
    });
}
const CORE_FILES = walk(path.join(ROOT, SRC)).filter((f) => /\.(ts|tsx|css)$/.test(f) && !/\.test\./.test(f));

const pascal = (slug: string) => slug.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(path.join(OUT_DIR, "orbs"), { recursive: true });

const items = [
  {
    name: REGISTRY_CORE,
    type: "registry:lib",
    title: "orbish",
    description: `The orbish engine: <ThinkingOrb state="…" /> with all ${STATES.length} thinking-state orbs, plus <OrbLoader /> and <ShimmerText />.`,
    files: CORE_FILES.map((f) => ({
      path: `${SRC}/${f}`,
      type: "registry:file",
      target: `${TARGET}/${f}`,
    })),
  },
  ...STATES.map((state) => {
    const file = `registry/orbs/${state}.tsx`;
    writeFileSync(path.join(ROOT, file), orbWrapperSource(state, ORB_STATES[state as keyof typeof ORB_STATES].mode));
    return {
      name: state,
      type: "registry:component",
      title: `${pascal(state)} orb`,
      description: `The "${state}" thinking orb from orbish.`,
      registryDependencies: [`${origin}/r/${REGISTRY_CORE}.json`],
      files: [{ path: file, type: "registry:file", target: `${TARGET}/orbs/${state}.tsx` }],
    };
  }),
];

const registryPath = path.join(OUT_DIR, "registry.json");
writeFileSync(
  registryPath,
  JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry.json", name: "orbish", homepage: origin, items }, null, 2),
);

rmSync(path.join(ROOT, "public/r"), { recursive: true, force: true });
execFileSync("npx", ["shadcn@latest", "build", registryPath, "--output", "public/r"], { cwd: ROOT, stdio: "inherit" });

console.log(`\nRegistry: ${items.length} items (${STATES.length} orbs + core, ${CORE_FILES.length} engine files) for ${origin}`);
