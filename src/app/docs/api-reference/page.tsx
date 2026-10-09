import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PropsTable } from "@/components/docs/PropsTable";
import { A, C, DocHeader, DocPage, H2, P } from "@/components/docs/Prose";
import { ORB_STATES } from "@/lib/orbs";
import { COMMON_PROPS } from "@/lib/orb-docs";

export const metadata: Metadata = {
  title: "API Reference",
  description: "ThinkingOrb, OrbLoader and ShimmerText, their props and their TypeScript types.",
};

const STATES = Object.keys(ORB_STATES);

// Generated from the same state map the engine ships, so the union shown here
// can never fall out of step with the orbs that actually exist.
const STATE_UNION =
  ["type OrbState ="]
    .concat(
      Array.from({ length: Math.ceil(STATES.length / 4) }, (_, i) =>
        "  | " + STATES.slice(i * 4, i * 4 + 4).map((s) => `'${s}'`).join(" | "),
      ),
    )
    .join("\n") + ";";

// The shared props, as the API table shows them: state and mode first.
const ORB_PROPS = [
  { name: "state", type: "OrbState", default: '"searching"', description: `Which orb to show. Any of the ${STATES.length} OrbState values; your editor autocompletes them.` },
  { name: "mode", type: "OrbMode", description: "Pick a visual mode directly, bypassing the state map. Overrides state's mode." },
  ...COMMON_PROPS.map((p) => ({ name: p.name, type: p.type, default: p.default, description: p.description })),
];

export default function ApiReferencePage() {
  return (
    <DocPage>
      <DocHeader eyebrow="Reference" title="API Reference">
        <C>ThinkingOrb</C>, <C>OrbLoader</C> and <C>ShimmerText</C>, their props and their types.
      </DocHeader>

      <div className="mb-3 flex items-baseline gap-3">
        <H2 id="thinking-orb" className="mb-0">
          {"<ThinkingOrb />"}
        </H2>
        <span className="font-mono text-xs text-white/35">Client Component</span>
      </div>
      <P>Renders one orb on a canvas. It carries its own &quot;use client&quot;, so Server Components can render it too.</P>
      <CodeBlock
        filename="usage.tsx"
        lang="tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

<ThinkingOrb
  state="pondering"
  size={64}
  theme="auto"
  color="oklch(0.85 0.1 280)"
  speed={0.8}
  dotScale={1.2}
  density={1}
  params={{ /* this orb's own settings */ }}
  className="my-orb"
/>`}
      />

      <H2 id="props">Props</H2>
      <PropsTable props={ORB_PROPS} />
      <Callout type="note">
        Each orb&apos;s <C>params</C> keys, with defaults, are on its own page — open any orb from the{" "}
        <A href="/">home page</A>.
      </Callout>

      <H2 id="orb-loader">{"<OrbLoader />"}</H2>
      <P>
        An orb with a shimmering status label. It takes every <C>ThinkingOrb</C> prop, plus <C>label</C>. At 42px and
        under it lays out inline; larger, the label stacks under the orb.
      </P>
      <PropsTable
        props={[
          { name: "label", type: "string", default: "state's label", description: "The status text, e.g. “Tracing the failing test…”." },
          { name: "size", type: "number", default: "20", description: "As on ThinkingOrb, but defaults to inline size." },
          { name: "className", type: "string", description: "Class names for the wrapper, which is a status region (role=\"status\")." },
          { name: "…ThinkingOrb props", type: "ThinkingOrbProps", description: "Everything else passes to the orb." },
        ]}
      />

      <H2 id="shimmer-text">{"<ShimmerText />"}</H2>
      <P>
        Text with a highlight sweeping across it, as used for status labels. Its base colour comes from{" "}
        <C>className</C>; the highlight from the <C>--shimmer-hi</C> CSS variable, dark ink by default and white under{" "}
        <C>data-theme=&quot;dark&quot;</C> or <C>.dark</C>.
      </P>
      <CodeBlock lang="tsx" code={`<ShimmerText className="text-sm text-white/50">Thinking it through…</ShimmerText>`} />

      <H2 id="named-orbs">Named orbs</H2>
      <P>
        Each orb you add with its own install command is a small wrapper, e.g. <C>SearchingOrb</C> in{" "}
        <C>components/orbish/orbs/searching.tsx</C>. It takes every <C>ThinkingOrb</C> prop except <C>state</C> and{" "}
        <C>mode</C>, and types <C>params</C> to that orb&apos;s own settings.
      </P>

      <H2 id="orb-state">OrbState type</H2>
      <P>A union of all {STATES.length} state names.</P>
      <CodeBlock lang="ts" code={STATE_UNION} />

      <H2 id="typescript">TypeScript</H2>
      <P>
        The types ship with the source. Import them to use in your own components; <C>OrbStateParams</C> gives you a
        given orb&apos;s settings.
      </P>
      <CodeBlock
        filename="types-example.tsx"
        lang="tsx"
        code={`import { ThinkingOrb, type OrbState, type OrbStateParams, type ThinkingOrbProps } from '@/components/orbish';

// Drive the orb from your app's own status
interface AgentStatusProps {
  state: OrbState;
  busy: boolean;
}

function AgentStatus({ state, busy }: AgentStatusProps) {
  return busy ? <ThinkingOrb state={state} size={20} /> : null;
}

// Typed settings for one orb
const exploring: OrbStateParams<'exploring'> = { tilt: 0.9, lanes: 6 };

// Or spread ThinkingOrbProps
function MyOrb(props: ThinkingOrbProps) {
  return <ThinkingOrb {...props} />;
}`}
      />
      <Callout type="note">
        TypeScript 5 or later is recommended. The files compile with your own tsconfig — there&apos;s no separate build to
        keep in sync.
      </Callout>
    </DocPage>
  );
}
