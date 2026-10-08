import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ORB_STATES, type OrbState } from "@/lib/orbs";
import {
  COMMON_PROPS,
  DOC_SIZE,
  orbComponent,
  orbDescription,
  orbTitle,
  paramRows,
} from "@/lib/orb-docs";
import { REPO } from "@/lib/socials";
import {
  REGISTRY_CORE,
  orbWrapperSource,
  registryOrigin,
} from "@/lib/registry";
import { PackageManagerProvider } from "@/components/PackageToggle";
import { InstallField } from "@/components/InstallField";
import GradualBlur from "@/components/GradualBlur";
import { BackButton } from "@/components/orb-page/BackButton";
import { CodeBlock } from "@/components/orb-page/CodeBlock";
import { Expandable } from "@/components/orb-page/Expandable";
import { InstallPanel } from "@/components/orb-page/InstallPanel";
import { OrbShowcase } from "@/components/orb-page/OrbShowcase";
import { PropsTable } from "@/components/orb-page/PropsTable";

const STATES = Object.keys(ORB_STATES) as OrbState[];
const isState = (value: string): value is OrbState => value in ORB_STATES;

// Every orb is prerendered; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return STATES.map((state) => ({ state }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  if (!isState(state)) return {};
  return { title: orbTitle(state), description: orbDescription(state) };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="px-1 font-display text-xl font-normal tracking-tight text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function OrbPage({ params }: Props) {
  const { state } = await params;
  if (!isState(state)) notFound();

  const { mode } = ORB_STATES[state];
  const name = orbComponent(state);
  const file = `components/orbish/orbs/${state}.tsx`;
  const importLine = `import { ${name} } from "@/components/orbish/orbs/${state}";`;
  const params_ = paramRows(state);
  const index = STATES.indexOf(state);
  const prev = STATES[(index - 1 + STATES.length) % STATES.length];
  const next = STATES[(index + 1) % STATES.length];

  const demo = `${importLine}

export function Example() {
  return <${name} />;
}`;

  const everyProp = `${importLine}

export function Example() {
  return (
    <${name}
      size={${DOC_SIZE}}
      theme="dark"
      color="#ffffff"
      speed={1}
      dotScale={1}
      density={1}
      paused={false}
      params={{
${params_.map((p) => `        ${p.name}: ${p.default},`).join("\n")}
      }}
    />
  );
}`;

  return (
    <PackageManagerProvider>
      <main
        data-theme="dark"
        className="min-h-dvh w-full bg-(--bg) lg:grid lg:grid-cols-2"
      >
        {/* Left: the orb, pinned while the docs scroll. */}
        <aside className="relative flex flex-col border-white/6 px-6 pt-5 pb-8 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:px-10">
          {/* Positioned by a wrapper: .custom-button sets position: relative,
              which would beat an absolute class on the link itself. */}
          <div className="absolute top-5 left-6 z-10 lg:left-10">
            <BackButton />
          </div>
          <div className="min-h-[60vh] flex-1 lg:min-h-0">
            <OrbShowcase state={state} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-4xl font-normal tracking-tight text-white">
                {orbTitle(state)}
              </h1>
              <span className="rounded-full bg-white/6 px-2.5 py-0.5 font-mono text-xs text-white/50">
                {mode} mode
              </span>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-white/55">
              {orbDescription(state)}
            </p>
            <nav aria-label="Other orbs" className="mt-3 flex gap-4 text-sm">
              <Link
                href={`/orbs/${prev}`}
                className="text-white/45 transition-colors hover:text-white"
              >
                ← {orbTitle(prev)}
              </Link>
              <Link
                href={`/orbs/${next}`}
                className="text-white/45 transition-colors hover:text-white"
              >
                {orbTitle(next)} →
              </Link>
            </nav>
          </div>
        </aside>

        {/* Right: install, usage, props. The wrapper is the grid cell, so the
            sticky blur below spans this column only, never the orb preview. */}
        <div className="relative">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 pt-10 pb-32 lg:px-12 lg:pt-14">
            <Section title="Installation">
              <InstallPanel
                origin={registryOrigin()}
                item={state}
                manual={
                  <>
                    <p className="px-1 text-sm leading-relaxed text-white/50">
                      1. Add the engine to{" "}
                      <code className="font-mono text-white/70">
                        components/orbish
                      </code>
                      , with the CLI or by copying{" "}
                      <code className="font-mono text-white/70">
                        src/lib/orbs
                      </code>{" "}
                      from the{" "}
                      <a
                        href={REPO.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 underline-offset-4 hover:underline"
                      >
                        repository
                      </a>
                      .
                    </p>
                    <InstallField
                      origin={registryOrigin()}
                      item={REGISTRY_CORE}
                    />
                    <p className="px-1 text-sm leading-relaxed text-white/50">
                      2. Add this orb:
                    </p>
                    <CodeBlock
                      code={orbWrapperSource(state, mode)}
                      filename={file}
                    />
                  </>
                }
              />
            </Section>

            <Section title="Usage">
              <CodeBlock code={demo} title="Demo usage" />
              <Expandable>
                <CodeBlock code={everyProp} title="Every prop" />
              </Expandable>
            </Section>

            <Section title="Props">
              <p className="px-1 text-sm leading-relaxed text-white/50">
                Every orb shares these.
              </p>
              <PropsTable rows={COMMON_PROPS} />
            </Section>

            <Section title={`${orbTitle(state)} settings`}>
              <p className="px-1 text-sm leading-relaxed text-white/50">
                Passed through{" "}
                <code className="font-mono text-white/70">params</code>; these
                are specific to the {mode} mode. Defaults are shown at{" "}
                {DOC_SIZE}px. Other sizes are retuned automatically, and any
                value you pass is used as-is.
              </p>
              <PropsTable rows={params_} />
            </Section>
          </div>

          {/* Bottom fade for the docs column: sticky at the viewport's bottom
              edge while the column scrolls under it. -mt cancels its height so
              it takes no space; pb-32 above lets the last table clear it at
              full scroll. target="parent" keeps it inside this column, and
              zIndex 10 keeps it under the nav-free page's controls. */}
          <div
            aria-hidden="true"
            className="pointer-events-none sticky bottom-0 -mt-28 h-28"
          >
            <GradualBlur
              target="parent"
              position="bottom"
              height="7rem"
              strength={1}
              saturation={1.5}
              divCount={5}
              curve="bezier"
              exponential
              opacity={1}
              zIndex={10}
            />
          </div>
        </div>
      </main>
    </PackageManagerProvider>
  );
}
