import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/docs/Callout";
import { PlaygroundCard } from "@/components/docs/PlaygroundCard";
import { A, C, DocPage, H2, P, Strong } from "@/components/docs/Prose";
import { ORB_STATES, ThinkingOrb, type OrbState } from "@/lib/orbs";

export const metadata: Metadata = {
  title: "Introduction",
  description: "What orbish is and what it gives you.",
};

const TOTAL = Object.keys(ORB_STATES).length;

// Each feature is fronted by a live orb as its icon, so the cards show the
// library off rather than just describing it.
const FEATURES: { title: string; desc: string; state: OrbState }[] = [
  { title: `${TOTAL} orbs`, desc: "One for every state an agent can be in: searching, debugging, pondering and more.", state: "searching" },
  { title: "Yours to edit", desc: "The source is copied into your project. No dependency to update.", state: "building" },
  { title: "Shared props", desc: "Size, theme, colour, speed, dot size and density work the same on every orb.", state: "layering" },
  { title: "Typed per orb", desc: "Each orb's own settings are typed, so your editor knows what it accepts.", state: "decoding" },
  { title: "One canvas engine", desc: "Every orb is shaded 3D dots on a 2D canvas. No WebGL, no dependencies.", state: "exploring" },
  { title: "Pauses itself", desc: "Stops off-screen and in hidden tabs, and holds still under reduced motion.", state: "idling" },
];

const NEXT = [
  { href: "/docs/installation", label: "Installation", desc: "Add orbish with the shadcn CLI." },
  { href: "/docs/quick-start", label: "Quick Start", desc: "Your first orb in a minute." },
  { href: "/docs/customization", label: "Customization", desc: "Colour, size, speed and each orb's settings." },
];

export default function IntroductionPage() {
  return (
    <DocPage>
      {/* The page has no header, so its first heading is the h1. */}
      <H2 id="what-is" as="h1">
        What is orbish?
      </H2>
      <P>
        <Strong>orbish</Strong> gives you {TOTAL} thinking-state orbs for React: animated spheres of dots that show what
        an AI agent, or any long task, is doing right now. Each one is a state, like <C>searching</C> or{" "}
        <C>debugging</C>, with its own motion.
      </P>
      <P>
        You install it with the shadcn CLI, which copies the code into your project, so it&apos;s yours to change. Then
        use <C>{"<ThinkingOrb />"}</C> anywhere in your app, or <C>{"<OrbLoader />"}</C> for an orb with a status label.
      </P>

      <H2 id="features">Features</H2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="group rounded-md bg-white/2 p-5 transition-colors hover:bg-white/3">
            <ThinkingOrb state={f.state} size={28} theme="dark" />
            <p className="mt-4 mb-1 font-display text-sm font-medium text-white/85 transition-colors group-hover:text-white">
              {f.title}
            </p>
            <p className="text-sm leading-6 text-white/45">{f.desc}</p>
          </div>
        ))}
        {/* Spans both columns, under the six feature tiles. */}
        <PlaygroundCard />
      </div>

      <Callout type="tip">
        Browse all {TOTAL} orbs on the <A href="/">home page</A>. Hover one to copy its install command, or open it for its
        own page of props.
      </Callout>

      <H2 id="next-steps">Next steps</H2>
      <div className="grid gap-3 sm:grid-cols-3">
        {NEXT.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block rounded-md bg-white/2 p-4 transition-colors outline-none hover:bg-white/4 focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <p className="mb-1 font-display text-sm font-medium text-white/85 transition-colors group-hover:text-white">
              {card.label} →
            </p>
            <p className="text-xs leading-5 text-white/40">{card.desc}</p>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
