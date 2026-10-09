import Link from "next/link";
import { SOCIALS } from "@/lib/socials";
import { OrbishIcon } from "./OrbishIcon";
import { HoverPhotoLink } from "./HoverPhotoLink";
import { WORDMARK_CLASS } from "./WordmarkBand";

const LINKS: readonly { href: string; label: string }[] = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/installation", label: "Installation" },
];

/**
 * Landing-page footer: the app icon, a one-line pitch, the main links, and a
 * giant wordmark that runs into the bottom edge of the page.
 *
 * The wordmark sitting flush with the page end is the point: the root layout
 * pins a GradualBlur over the bottom 7rem of the viewport on every route, so
 * at full scroll the bottom of the letters dissolves into it.
 */
export function Footer() {
  return (
    <footer className="mt-24 w-full overflow-hidden border-t border-white/6 pb-12 md:pb-0">
      {/* pb-12 on phones only: there the wordmark is ~60px tall, so flush with
          the page bottom it would sit entirely inside the 7rem page blur and
          smear into nothing. Lifted 48px, only its lower half dissolves — the
          same effect desktop gets by being flush (pb-0). */}
      <div className="flex flex-wrap items-start justify-between gap-8 px-6 pt-10 md:px-10">
        {/* Three columns from md up; on phones everything stacks, centred, with
            the icon on top. */}
        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-3 md:gap-3">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="max-w-xs font-display text-sm text-white/40">
              Built by{" "}
              {/* Hovering the name floats a photo above the cursor. 120×134 keeps
                  the source's 474×531 aspect. */}
              <HoverPhotoLink href="https://rushikeshmahajan.com" src="/images/rushikesh-hover.jpg" width={120} height={134}>
                Rushikesh Mahajan
              </HoverPhotoLink>
              . Copy the code, it&apos;s yours.
            </p>
            <ul className="flex items-center gap-4">
              {Object.values(SOCIALS).filter((s) => s.href).map((s) => (
                <li key={s.label}>
                  {/* Icon-only, so the label goes on the link for screen readers. */}
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="block rounded-sm text-white/40 transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <s.icon size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-first flex items-center justify-center md:order-none">
            {/* One fixed size for now: the placeholder icon sizes its inner orb
                from `size`, so a CSS override would not shrink the canvas. */}
            <OrbishIcon size={200} />
          </div>
          {LINKS.length > 0 ? (
            <nav aria-label="Footer" className="flex justify-center gap-6 pt-1 text-sm md:flex-col md:items-end md:gap-5">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="font-display text-white/50 transition-colors hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : (
            <div aria-hidden="true" className="hidden md:block" />
          )}
        </div>
      </div>

      {/* The hero's wordmark on the plain page, closing the page on the same
          word it opens with. A <p>, not a second <h1> — the hero is the page
          heading — and aria-hidden since the name is already read out above.
          min(250px, 25vw): 250px on desktop, shrinking so the whole word fits
          on narrow screens. -mb-[0.12em] pulls the box's bottom up to the ink;
          overflow-hidden on the footer clips what spills past the line. */}
      <p aria-hidden="true" className={`mt-16 -mb-[0.12em] md:mt-24 ${WORDMARK_CLASS} text-[min(250px,25vw)] leading-none lowercase`}>
        orbish
      </p>
    </footer>
  );
}
