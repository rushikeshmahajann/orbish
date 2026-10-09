import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { PackageTabs } from "@/components/docs/PackageTabs";
import { Callout } from "@/components/docs/Callout";
import { A, C, DocHeader, DocPage, H2, P, Strong } from "@/components/docs/Prose";
import { ORB_STATES } from "@/lib/orbs";
import { registryOrigin } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Installation",
  description: "Add orbish to your project with the shadcn CLI: everything, or one orb at a time.",
};

const TOTAL = Object.keys(ORB_STATES).length;

const REQUIREMENTS = [
  ["React", "18 or later"],
  ["A shadcn project", "one with a components.json"],
  ["Tailwind CSS", "for OrbLoader's layout classes (ThinkingOrb needs none)"],
  ["TypeScript", "5 or later (optional but recommended)"],
];

export default function InstallationPage() {
  const origin = registryOrigin();

  return (
    <DocPage>
      <DocHeader eyebrow="Getting Started" title="Installation">
        orbish installs with the shadcn CLI. It copies the source into your project, so there&apos;s no package to update
        and you can edit anything.
      </DocHeader>

      <H2 id="requirements">Requirements</H2>
      <ul className="mb-4 space-y-2">
        {REQUIREMENTS.map(([pkg, ver]) => (
          <li key={pkg} className="flex items-center gap-3 text-sm">
            <span aria-hidden="true" className="size-1 rounded-full" style={{ background: "var(--brand)" }} />
            <span className="text-white/50">
              <Strong>{pkg}</Strong> {ver}
            </span>
          </li>
        ))}
      </ul>
      <P>
        No <C>components.json</C> yet? Run <C>npx shadcn@latest init</C> first.
      </P>

      <H2 id="install">Install</H2>
      <P className="mb-0">Add everything — the engine and all {TOTAL} orbs:</P>
      <PackageTabs origin={origin} />

      <H2 id="single">Add a single orb</H2>
      <P>
        Each orb is also available on its own, as a named component. The first one you add brings the engine with it;
        later ones skip files you already have.
      </P>
      <PackageTabs origin={origin} item="searching" />
      <CodeBlock
        lang="tsx"
        code={`import { SearchingOrb } from '@/components/orbish/orbs/searching';

<SearchingOrb size={48} />`}
      />
      <P>
        Find the one you want on the <A href="/">home page</A>. Hover an orb to copy its command, or open it to see its
        own settings.
      </P>

      <H2 id="files">What gets added</H2>
      <CodeBlock
        lang="tree"
        code={`components/orbish/
├── index.ts            # exports ThinkingOrb, OrbLoader, ShimmerText, types
├── ThinkingOrb.tsx     # the canvas component
├── OrbLoader.tsx       # orb + shimmering status label
├── ShimmerText.tsx · shimmer.css
├── config.ts           # the ${TOTAL} states, size tuning
├── core.ts             # projection, painter, math helpers
├── params.ts           # per-orb settings and their types
├── modes/              # one file per visual mode
└── orbs/               # one file per named orb you add`}
      />
      <Callout type="note">
        <C>ShimmerText</C> imports its own small stylesheet, so there&apos;s nothing to add to your global CSS. In a{" "}
        <C>src/</C> project, the files go in <C>src/components/orbish</C>.
      </Callout>

      <H2 id="verify">Check that it works</H2>
      <P>Drop this into any page:</P>
      <CodeBlock
        filename="app/page.tsx"
        lang="tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

export default function Page() {
  return <ThinkingOrb state="searching" />;
}`}
      />
      <P>
        You should see a dotted globe with a sweeping scan band. If the import fails, check your components alias — see{" "}
        <A href="/docs/quick-start">Quick Start</A>.
      </P>
    </DocPage>
  );
}
