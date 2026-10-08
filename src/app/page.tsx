import Link from "next/link";
import GradualBlur from "@/components/GradualBlur";
import { ORB_STATES, ThinkingOrb, type OrbState } from "@/lib/orbs";
import {
  PackageManagerProvider,
  PackageToggle,
} from "@/components/PackageToggle";
import { InstallField } from "@/components/InstallField";
import { UsageBlock } from "@/components/UsageBlock";
import { WordmarkBand } from "@/components/WordmarkBand";
import { Footer } from "@/components/Footer";
import { OrbInstallButton } from "@/components/OrbInstallButton";
import { registryOrigin } from "@/lib/registry";
import { SiteNav } from "@/components/SiteNav";

// The whole set, straight from the state map the engine ships, so the landing
// page can never fall behind the library.
const STATES = Object.keys(ORB_STATES) as OrbState[];
const TOTAL = STATES.length;

export default function Home() {
  return (
    <PackageManagerProvider>
      {/* data-theme="dark": the landing is dark-only, and this is what the
            `dark:` variant and the ShimmerText highlight key off. */}
      <main
        data-theme="dark"
        className="relative min-h-screen w-full bg-(--bg)"
      >
        {/* Floats over the hero field: absolutely placed so the hero keeps
              its full height and the wordmark stays centred. z-20 clears the
              band's blur (z-5) and wordmark (z-10). */}
        <SiteNav className="absolute inset-x-0 top-0 z-20 py-5" />
        <WordmarkBand />

        {/* Full width with a gutter on phones, capped on tablets, 40vw from lg up. */}
        <div className="mx-auto flex w-full max-w-2xl flex-col justify-center gap-8 px-6 py-2 lg:max-w-[40vw] lg:px-0">
          {/* Install */}
          <div className="flex flex-col gap-4">
            <h2 className="px-1 font-display text-2xl font-normal tracking-tight text-white">
              Install
            </h2>
            <PackageToggle />
            {/* Installs the engine with every orb via the shadcn registry.
                  The toggle above also sets the runner for each tile's copy button. */}
            <InstallField origin={registryOrigin()} />
            <p className="px-1 text-xs text-white/40">
              Adds all {TOTAL} orbs to{" "}
              <code className="font-mono text-white/60">components/orbish</code>
              . Want just one? Hover an orb below and copy its command.
            </p>
          </div>

          {/* Usage */}
          <div className="flex flex-col gap-4">
            <h2 className="mt-4 px-1 font-display text-2xl font-normal tracking-tight text-white">
              Usage
            </h2>
            {/* Tabs + panel live together in a client component because the
                  view is stateful; the snippet and the preview are both derived
                  there from one state name so they cannot disagree. */}
            <UsageBlock />
          </div>

          {/* Orbs */}
          {/* items-baseline so the small mono count sits on the same baseline
                as the 2xl heading instead of floating at its vertical middle. */}
          <h2 className="mt-4 flex items-baseline justify-between px-1 font-display text-2xl font-normal tracking-tight text-white">
            Orbs
            <span className="font-mono text-sm text-white/35">{TOTAL}</span>
          </h2>

          {/* Bare orbs — no card, so the canvases are the grid items themselves.
                Each ThinkingOrb already pauses its own animation while off-screen
                (IntersectionObserver in the component), so no lazy wrapper is
                needed; content-visibility just skips the paint as well. */}
          <div className="grid w-full grid-cols-2 sm:grid-cols-3 items-center justify-items-center gap-3">
            {STATES.map((state) => {
              const { mode } = ORB_STATES[state];
              return (
                <div
                  key={state}
                  // w-full so every tile is the same width regardless of label
                  // length, keeping the orbs lined up in columns.
                  className="group relative w-full"
                  style={{
                    contentVisibility: "auto",
                    // Orb + gap + label + padding. An estimate only — it reserves
                    // the collapsed height so the scrollbar does not jump.
                    containIntrinsicSize: "120px 184px",
                  }}
                >
                  {/* The tile opens the orb's page. The copy button is a
                      sibling, not a child: a button inside a link is invalid
                      and would also navigate on click. */}
                  <Link
                    href={`/orbs/${state}`}
                    title={`${state} → ${mode}`}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-md bg-white/2 py-8 transition-colors outline-none hover:bg-white/4 focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    {/* 120px uses the regular tuning bucket (43–160px): the full
                        dot density. */}
                    <ThinkingOrb state={state} size={120} theme="dark" />
                    <span className="w-full truncate text-center font-mono text-xs leading-none tracking-tight text-white/40">
                      {state}
                    </span>
                  </Link>
                  {/* Copies `npx shadcn add …/r/<state>.json`. Hidden until the
                      tile is hovered, but always shown on touch screens (no
                      hover) and whenever it has keyboard focus. */}
                  <OrbInstallButton
                    name={state}
                    className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
        {/* Page-bottom fade: target="page" pins it to the viewport, so at
            full scroll the footer wordmark dissolves into it. Home page
            only — on the orb pages it would blur the docs. zIndex 100 lands
            at 200 (the component adds 100 for page targets); pointerEvents
            is none, so it never blocks clicks. */}
        <GradualBlur
          target="page"
          position="bottom"
          height="7rem"
          strength={1}
          saturation={1.5}
          divCount={5}
          curve="bezier"
          exponential
          opacity={1}
          zIndex={100}
        />
      </main>
    </PackageManagerProvider>
  );
}
