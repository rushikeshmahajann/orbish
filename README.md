<div align="center">

# orbish

**64 thinking-state orbs for React, drawn as shaded 3D dots.**

One canvas engine · no dependencies · copied into your project with the shadcn CLI

[Website](https://orbish.rushikeshmahajan.com) · [Docs](https://orbish.rushikeshmahajan.com/docs) · [Installation](https://orbish.rushikeshmahajan.com/docs/installation)

![React](https://img.shields.io/badge/React-18%2B-0a0a0a?style=flat-square&logo=react&logoColor=ffffff)
![shadcn registry](https://img.shields.io/badge/shadcn-registry-0a0a0a?style=flat-square)
![Canvas 2D](https://img.shields.io/badge/Canvas_2D-no_WebGL-0a0a0a?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-typed-0a0a0a?style=flat-square&logo=typescript&logoColor=ffffff)

</div>

---

## Install

Add everything — the engine and all 64 orbs:

```bash
npx shadcn@latest add https://orbish.rushikeshmahajan.com/r/orbish.json
```

Or add just the one you want. Every orb is its own registry item, with a named component — copy any orb's command from the [website](https://orbish.rushikeshmahajan.com):

```bash
npx shadcn@latest add https://orbish.rushikeshmahajan.com/r/searching.json
```

The code lands in `components/orbish` and is yours to edit. No package to keep updated.

## Use

```tsx
import { ThinkingOrb, OrbLoader } from "@/components/orbish";

// An orb on its own
<ThinkingOrb state="searching" size={64} />

// An orb with a shimmering status line, the way an agent shows its work
<OrbLoader state="pondering" size={20} label="Thinking it through…" />
```

`ThinkingOrb` carries its own `"use client"`, so you can render it straight from a Server Component — a natural fit for a Next.js `loading.tsx`.

Every orb shares these props:

| Prop | Default | |
| --- | --- | --- |
| `state` | `"searching"` | Any of the 64 states. Typed, so your editor autocompletes them. |
| `size` | `96` | Width and height in px. Small and large orbs are retuned automatically. |
| `theme` | `"auto"` | `"dark"`, `"light"`, or `"auto"` to follow the nearest `data-theme`, then the system. |
| `color` | grayscale | Tints the dots. Any CSS colour, including `var(--your-token)`. |
| `speed` | `1` | Playback speed. `2` is twice as fast. |
| `dotScale` | `1` | Multiplies every dot's size. |
| `density` | `1` | Multiplies the number of dots. |
| `paused` | `false` | Freeze on the current frame. |
| `params` | — | The orb's own settings. See below. |

Each orb also has settings of its own — the ring tilt of `exploring`, the glitch rate of `debugging` — passed through `params` and typed per orb:

```tsx
import { ExploringOrb } from "@/components/orbish/orbs/exploring";

<ExploringOrb params={{ tilt: 0.9, lanes: 6 }} />
```

Every orb's settings, with their defaults, are listed on its own page on the website.

## What's inside

| Kind | | |
| --- | --- | --- |
| **Looking things up** | | searching, recalling, exploring, sensing, surveying… |
| **Working it out** | | pondering, solving, decoding, debugging, comparing… |
| **Producing output** | | composing, streaming, speaking, drafting, printing… |
| **Coordinating** | | connecting, delegating, syncing, pairing, organizing… |
| **Waiting and idling** | | waiting, loading, idling, ticking, settling… |

Every orb is the same pipeline — generate 3D points, rotate, depth-sort, paint shaded dots — with its own motion on top. They pause themselves off-screen and in hidden tabs, and hold still for visitors who prefer reduced motion.

---

## Develop

This repo is the website (landing page, orb pages, docs, registry) and the orb source.

```bash
npm install
npm run dev              # http://localhost:3000
npm run registry:build   # regenerate public/r/ so install commands work locally
npm run lint
```

| Path | |
| --- | --- |
| `src/lib/orbs/` | The orb library — `ThinkingOrb`, `OrbLoader`, the engine and all 64 modes. What the registry ships. |
| `src/app/` | The Next.js site: `/`, `/orbs/[state]` and `/docs/*`. |
| `scripts/build-registry.ts` | Builds the registry — one item per orb plus the core — into `public/r/`. |
| `patches/` | A fix for a dependency of the website, applied on install by `patch-package`. |

`npm run build` runs `registry:build` first, so a production build always ships a fresh registry. `public/r/` and `registry/` are generated and gitignored.

### Deploy

Registry links are baked in at build time. Set **`REGISTRY_URL`** to the production URL (e.g. `https://orbish.rushikeshmahajan.com`) — it also sets `metadataBase` for the site's metadata. On Vercel it falls back to the production domain automatically. Redeploy after changing the domain.

## License

[MIT](LICENSE) © Rushikesh Mahajan — use it, change it, ship it.

---

<div align="center">

Built by [Rushikesh Mahajan](https://rushikeshmahajan.com) · [GitHub](https://github.com/rushikeshmahajann) · [X](https://x.com/rushy_0) · [LinkedIn](https://www.linkedin.com/in/rushikeshmahajann/)

<sub>Copy the code, it's yours.</sub>

</div>
