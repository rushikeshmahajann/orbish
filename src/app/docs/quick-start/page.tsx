import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { LiveOrb, LiveOrbGrid } from "@/components/docs/LiveOrb";
import { Example } from "@/components/docs/Example";
import { A, C, DocHeader, DocPage, H2, P } from "@/components/docs/Prose";
import { ORB_STATES } from "@/lib/orbs";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Your first orb on screen in under a minute, in Next.js or Vite.",
};

const TOTAL = Object.keys(ORB_STATES).length;

export default function QuickStartPage() {
  return (
    <DocPage>
      <DocHeader eyebrow="Getting Started" title="Quick Start">
        Get your first orb on screen in under a minute.
      </DocHeader>

      <H2 id="basic-usage">Basic usage</H2>
      <P>
        Import <C>ThinkingOrb</C> and pass a <C>state</C>. That&apos;s it.
      </P>
      <Example
        filename="component.tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

export function MyComponent() {
  return <ThinkingOrb state="searching" />;
}`}
      >
        <LiveOrb state="searching" size={64} label="searching" />
      </Example>

      <Callout type="note">
        The import path follows the <C>components</C> alias in your <C>components.json</C>. It&apos;s usually{" "}
        <C>@/components</C>, which makes it <C>@/components/orbish</C>.
      </Callout>

      <H2 id="with-a-label">With a status label</H2>
      <P>
        <C>OrbLoader</C> pairs the orb with a shimmering label, the state&apos;s own (&ldquo;Searching…&rdquo;) unless
        you pass <C>label</C>. At 42px and under it sits inline, like an agent&apos;s status line; larger, it stacks.
      </P>
      <Example
        filename="status.tsx"
        code={`import { OrbLoader } from '@/components/orbish';

<OrbLoader state="pondering" size={20} />
<OrbLoader state="debugging" size={20} label="Tracing the failing test…" />`}
      >
        <LiveOrbGrid>
          <LiveOrb state="pondering" size={20} label="default label" />
          <LiveOrb state="debugging" size={20} message="Tracing the failing test…" label="custom label" />
        </LiveOrbGrid>
      </Example>

      <H2 id="nextjs">Next.js App Router</H2>
      <P>
        The orbs draw on a canvas, so <C>ThinkingOrb</C> is a Client Component; it carries its own{" "}
        <C>&quot;use client&quot;</C>. You can still render it straight from a Server Component, such as a route&apos;s{" "}
        <C>loading.tsx</C>:
      </P>
      <CodeBlock
        filename="app/loading.tsx"
        lang="tsx"
        code={`// A Server Component — no "use client" needed here.
import { OrbLoader } from '@/components/orbish';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <OrbLoader state="loading" size={64} />
    </div>
  );
}`}
      />
      <Callout type="tip">
        Next.js shows <C>loading.tsx</C> automatically while the page streams in.
      </Callout>

      <H2 id="vite">Vite and other React apps</H2>
      <P>Nothing to configure. Import it and use it.</P>
      <CodeBlock
        filename="src/App.tsx"
        lang="tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

function App() {
  return (
    <div>
      <ThinkingOrb state="composing" />
    </div>
  );
}`}
      />

      <H2 id="pick-a-state">Pick a state</H2>
      <P>
        <C>state</C> takes any of the {TOTAL} state names, and your editor autocompletes them. Pick the one that says what
        your app is doing:
      </P>
      <CodeBlock
        filename="examples.tsx"
        lang="tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

// Looking things up
<ThinkingOrb state="searching" />
<ThinkingOrb state="recalling" />
<ThinkingOrb state="exploring" />

// Working it out
<ThinkingOrb state="pondering" />
<ThinkingOrb state="solving" />
<ThinkingOrb state="debugging" />

// Producing output
<ThinkingOrb state="composing" />
<ThinkingOrb state="streaming" />
<ThinkingOrb state="speaking" />`}
      />
      <P className="mt-4">
        See all {TOTAL} on the <A href="/">home page</A>. Each one has its own page with install command and props.
      </P>
    </DocPage>
  );
}
