import type { Metadata } from "next";
import { Example } from "@/components/docs/Example";
import { Callout } from "@/components/docs/Callout";
import { LiveOrb, LiveOrbGrid } from "@/components/docs/LiveOrb";
import { A, C, DocHeader, DocPage, H2, P } from "@/components/docs/Prose";

export const metadata: Metadata = {
  title: "Customization",
  description: "Change an orb's colour, size, speed, dot size and density, and tune each orb's own settings.",
};

export default function CustomizationPage() {
  return (
    <DocPage>
      <DocHeader eyebrow="Guides" title="Customization">
        Every orb takes the same props: <C>size</C>, <C>theme</C>, <C>color</C>, <C>speed</C>, <C>dotScale</C> and{" "}
        <C>density</C>. Each orb also has settings of its own, passed through <C>params</C>. All are optional.
      </DocHeader>

      <H2 id="color">Colour</H2>
      <P>
        Pass any CSS colour to <C>color</C> and the dots take it on; leave it out for grayscale. The depth shading
        carries over, so near dots show the full colour and far ones fade. CSS variables work too, so an orb can follow
        your theme: <C>color=&quot;var(--primary)&quot;</C>.
      </P>
      {/* Preview and Code are two views of one example, so they show the same
          orbs in the same order. */}
      <Example
        filename="color-example.tsx"
        code={`import { ThinkingOrb } from '@/components/orbish';

<ThinkingOrb state="searching" />                                  // grayscale
<ThinkingOrb state="searching" color="oklch(0.8 0.12 250)" />
<ThinkingOrb state="pondering" color="oklch(0.85 0.12 80)" />
<ThinkingOrb state="composing" color="oklch(0.8 0.13 160)" />`}
      >
        <LiveOrbGrid>
          <LiveOrb state="searching" label="no color" />
          <LiveOrb state="searching" color="oklch(0.8 0.12 250)" label="oklch(0.8 0.12 250)" />
          <LiveOrb state="pondering" color="oklch(0.85 0.12 80)" label="oklch(0.85 0.12 80)" />
          <LiveOrb state="composing" color="oklch(0.8 0.13 160)" label="oklch(0.8 0.13 160)" />
        </LiveOrbGrid>
      </Example>

      <H2 id="theme">Theme</H2>
      <P>
        <C>theme</C> picks light dots for dark backgrounds or dark dots for light ones. The default, <C>auto</C>, reads
        the nearest <C>data-theme</C> attribute and falls back to the system setting, following changes live.
      </P>
      <Example
        filename="theme-example.tsx"
        code={`<ThinkingOrb state="building" theme="dark" />
<div className="bg-white">
  <ThinkingOrb state="building" theme="light" />
</div>`}
      >
        <LiveOrbGrid>
          <LiveOrb state="building" theme="dark" label='theme="dark"' />
          <div className="mx-6 rounded-md bg-white">
            <LiveOrb state="building" theme="light" label='theme="light"' />
          </div>
        </LiveOrbGrid>
      </Example>

      <H2 id="size">Size</H2>
      <P>
        <C>size</C> is the orb&apos;s width and height in pixels; the default is <C>96</C>. Small orbs, 42px and under,
        switch to fewer, fatter dots so they stay legible at text size, and large ones over 160px get the full density.
      </P>
      <Example
        filename="size-example.tsx"
        code={`<ThinkingOrb state="exploring" size={20} />    // inline
<ThinkingOrb state="exploring" size={48} />
<ThinkingOrb state="exploring" size={96} />    // default`}
      >
        {/* Real sizes, not enlarged: the pixel size is what this shows. */}
        <div className="grid grid-cols-1 items-center gap-y-4 sm:grid-cols-3">
          {([20, 48, 96] as const).map((s) => (
            <LiveOrb key={s} state="exploring" size={s} label={`size=${s}`} />
          ))}
        </div>
      </Example>

      <H2 id="dots">Dot size and density</H2>
      <P>
        <C>dotScale</C> multiplies the size of every dot, and <C>density</C> multiplies how many there are:{" "}
        <C>0.5</C> halves them, <C>2</C> doubles them. Both default to <C>1</C> and work the same on every orb.
      </P>
      <Example
        filename="dots-example.tsx"
        code={`<ThinkingOrb state="harmonizing" density={0.5} />
<ThinkingOrb state="harmonizing" density={2} />
<ThinkingOrb state="harmonizing" dotScale={0.6} />
<ThinkingOrb state="harmonizing" dotScale={1.6} />`}
      >
        <LiveOrbGrid>
          <LiveOrb state="harmonizing" size={64} density={0.5} label="density={0.5}" />
          <LiveOrb state="harmonizing" size={64} density={2} label="density={2}" />
          <LiveOrb state="harmonizing" size={64} dotScale={0.6} label="dotScale={0.6}" />
          <LiveOrb state="harmonizing" size={64} dotScale={1.6} label="dotScale={1.6}" />
        </LiveOrbGrid>
      </Example>

      <H2 id="speed">Speed</H2>
      <P>
        <C>speed</C> multiplies the orb&apos;s tuned tempo. <C>1</C> is normal (the default), <C>2</C> is twice as fast,{" "}
        <C>0.5</C> is half. <C>paused</C> freezes it on the current frame.
      </P>
      <Example
        filename="speed-example.tsx"
        code={`<ThinkingOrb state="syncing" speed={0.5} />   // calm
<ThinkingOrb state="syncing" speed={1} />     // normal
<ThinkingOrb state="syncing" speed={2} />     // urgent
<ThinkingOrb state="syncing" paused />`}
      >
        <LiveOrbGrid>
          <LiveOrb state="syncing" size={56} speed={0.5} label="speed={0.5}" />
          <LiveOrb state="syncing" size={56} speed={1} label="speed={1}" />
          <LiveOrb state="syncing" size={56} speed={2} label="speed={2}" />
          <LiveOrb state="syncing" size={56} paused label="paused" message="Paused" />
        </LiveOrbGrid>
      </Example>
      <Callout type="tip">
        Orbs also pause themselves when scrolled off-screen or in a hidden tab, and hold still for visitors who prefer
        reduced motion.
      </Callout>

      <H2 id="params">Each orb&apos;s own settings</H2>
      <P>
        Beyond the shared props, each orb has settings of its own: the ring tilt of <C>exploring</C>, the glitch rate of{" "}
        <C>debugging</C>, and so on. Pass them through <C>params</C>. The named components type them per orb, so your
        editor only offers that orb&apos;s settings.
      </P>
      <Example
        filename="params-example.tsx"
        code={`import { ExploringOrb } from '@/components/orbish/orbs/exploring';
import { DebuggingOrb } from '@/components/orbish/orbs/debugging';

<ExploringOrb params={{ tilt: 0.9, lanes: 6 }} />
<DebuggingOrb params={{ chance: 0.7 }} />`}
      >
        <LiveOrbGrid>
          <LiveOrb state="exploring" size={64} params={{ tilt: 0.9, lanes: 6 }} label="tilt: 0.9, lanes: 6" />
          <LiveOrb state="debugging" size={64} params={{ chance: 0.7 }} label="chance: 0.7" />
        </LiveOrbGrid>
      </Example>
      <Callout type="note">
        Every orb&apos;s settings, with their defaults, are listed on its own page — open any orb from the{" "}
        <A href="/">home page</A>. Values in <C>params</C> are absolute and applied after <C>density</C> and{" "}
        <C>dotScale</C>.
      </Callout>

      <H2 id="combine">Combining props</H2>
      <P>Props combine freely. A few real-world setups:</P>
      <Example
        filename="combined.tsx"
        code={`import { OrbLoader, ThinkingOrb } from '@/components/orbish';

// Quiet background indicator
<ThinkingOrb state="idling" size={24} speed={0.6} />

// Branded assistant status line
<OrbLoader state="pondering" size={20} color="var(--primary)" />

// Hero animation
<ThinkingOrb state="imagining" size={160} density={1.4} speed={0.8} />`}
      >
        <div className="grid grid-cols-1 items-center gap-y-4 sm:grid-cols-2">
          <LiveOrb state="idling" size={24} speed={0.6} label="quiet" />
          <LiveOrb state="pondering" size={20} color="oklch(0.85 0.1 280)" label="branded status" />
          <LiveOrb state="imagining" size={160} density={1.4} speed={0.8} label="hero" />
        </div>
      </Example>
    </DocPage>
  );
}
