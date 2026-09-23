# CoderCourajoe: portfolio & channel landing page

A fully static developer portfolio built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **MDX** and **react-three-fiber**, deployed to a VPS with **Dokploy + Nixpacks**. There's no database, no Dockerfile and no custom build config.

- A dark, terminal-style design with a typing hero terminal
- A dotted WebGL Earth in the background that **spins as you scroll**
- Coding stack, AI "toolbelt", a projects grid and contact sections, all driven by files in `content/`
- Project write-ups in MDX, syntax-highlighted at build time with Shiki (`rehype-pretty-code`)
- Every route is prerendered at build time (`○ Static` / `● SSG`)

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (all pages prerendered)
pnpm start        # serve the production build
```

Requires Node **20.9+** (Next.js 16's minimum) and pnpm (the version is pinned via `packageManager`, so `corepack enable` picks the right one).

## Project structure

```
app/
  layout.tsx                 fonts, metadata, navbar, footer, dot-grid texture
  page.tsx                   single-scroll landing page
  projects/[slug]/page.tsx   project detail pages (generateStaticParams)
  not-found.tsx              terminal-style 404
  globals.css                design tokens (@theme), glow borders, MDX/code styles
components/
  Hero.tsx  Terminal.tsx     hero + typing terminal
  HeroBackground.tsx         client wrapper: next/dynamic({ ssr: false }), reduced-motion gate
  EarthScene.tsx             the scroll-driven WebGL globe
  StackGrid.tsx              coding stack grouped by Frontend / Backend / Infra
  AiToolbelt.tsx             AI stack, styled as a "toolbelt"
  ProjectGrid.tsx  ProjectCard.tsx
  ContactSection.tsx  ContactForm.tsx (optional Formspree form)
  Navbar.tsx  Footer.tsx  SectionHeading.tsx  Icon.tsx
content/
  bio.json                   name, tagline, bios, socials, email, avatar, formspreeId
  coding-stack.json          { name, category, icon, level }[]
  ai-stack.json              { name, category, icon, description, usage }[]
  projects/*.mdx             one file per project: frontmatter + write-up
lib/
  content.ts                 typed loaders for everything in content/
  mdx.tsx                    MDX compile + syntax highlighting
  land-mask.ts               generated 1°×1° land bitmap for the globe
scripts/
  generate-land-mask.mjs     regenerates lib/land-mask.ts (pnpm gen:land-mask)
```

## Editing content

Everything on the site comes from `content/`. Edit a file, then rebuild.

**Add a project:** create `content/projects/my-thing.mdx`. The file name becomes the URL (`/projects/my-thing`).

````mdx
---
title: "My Thing"
description: "One or two sentences for the card."
date: "2026-10-01"            # newest first; the newest is the hero's "Latest project"
tags: ["Next.js", "Postgres"]
thumbnail: "/projects/my-thing.png"   # put the image in public/projects/
liveUrl: "https://…"          # optional
repoUrl: "https://github.com/…"      # optional
youtubeUrl: "https://youtu.be/…"     # optional; adds an "on youtube" badge
---

## Write-up in MDX

Code blocks get highlighted at build time, and can have titles and highlighted lines:

```ts title="src/example.ts" {2}
const a = 1;
const b = 2; // highlighted
```
````

**Icons:** `icon` keys in the JSON files map to [simple-icons](https://simpleicons.org) (`nextdotjs`, `postgresql`, `docker`, …) in `components/Icon.tsx`. To add one, import it there and add it to `BRANDS`.

**Contact form:** the contact section always shows a `mailto:` button. To also show a real form with no backend, create a free form at [formspree.io](https://formspree.io) and put its ID in `content/bio.json` → `"formspreeId": "abcdwxyz"`.

## The scroll-driven globe

`components/EarthScene.tsx` draws the Earth with no textures. It spreads about 18k points evenly over a sphere and keeps the ones that fall on land according to `lib/land-mask.ts`, a ~11 KB bitmask baked from public-domain [Natural Earth](https://www.naturalearthdata.com/) data. Scrolling sets a target angle, and the globe eases toward it each frame, which gives the spin its inertia.

- It's loaded client-only with `next/dynamic(..., { ssr: false })` inside a Client Component (`HeroBackground.tsx`). Next 16 doesn't allow `ssr: false` in Server Components.
- It lives in a `position: fixed; inset: 0; pointer-events: none` layer at `z-0`. All content sits at `z-10`, so it can never block clicks or scrolling.
- It isn't mounted (and three.js isn't even downloaded) when `prefers-reduced-motion` is set.
- Small or touch screens get a lighter version (fewer dots, lower pixel-ratio cap).
- Tweak the feel with the constants at the top of the file: `RADIANS_PER_PX`, `SCROLL_EASE`, `IDLE_SPIN`, `START_LONGITUDE`.

## Deploying to Dokploy with Nixpacks

This is the main point of the project: a standard Next.js app deploys with **zero Docker config**. Nixpacks inspects the repo, sees `package.json` plus `pnpm-lock.yaml`, and builds a container image on its own. There's no `Dockerfile`, no `docker-compose.yml` and no `nixpacks.toml`.

What Nixpacks detects here:

| Signal in the repo | What Nixpacks does |
| --- | --- |
| `pnpm-lock.yaml` + `"packageManager": "pnpm@…"` | Installs that exact pnpm via corepack, then runs `pnpm install --frozen-lockfile` |
| `"engines": { "node": ">=20.9.0" }` | Picks a Node version that satisfies Next 16's minimum |
| `"build": "next build"` | Build step: `pnpm run build` |
| `"start": "next start"` | Start command: `pnpm run start` (Next listens on `$PORT`, default 3000) |

### Step by step

1. **Push the repo to GitHub** (or GitLab/Gitea/Bitbucket).
2. **Get a server running Dokploy.** On a fresh VPS (e.g. Contabo, Ubuntu 22.04+), run the official installer as root:
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```
   Then open `http://<your-server-ip>:3000` and create the admin account.
3. **Connect your Git provider.** In Dokploy go to **Settings → Git** and connect GitHub (install the Dokploy GitHub App on your account or repo).
4. **Create the app.** Go to **Projects → Create Project** (e.g. `portfolio`), then **Create Service → Application**.
5. **Point it at the repo.** Under **General → Provider**, choose GitHub, then pick the repository and branch (`main`). Leave the build path as `/`.
6. **Pick Nixpacks as the build type.** Under **Build Type**, select **Nixpacks**. You don't need to enter any build or start commands, because Nixpacks reads them from `package.json`.
7. **(Optional) Environment variables.** Under **Environment**, set
   `NEXT_PUBLIC_SITE_URL=https://your-domain.com` so Open Graph URLs are absolute.
   To force a Node version, add `NIXPACKS_NODE_VERSION=22`.
8. **Add a domain.** Under **Domains**, add `your-domain.com`, set the **container port to `3000`** and enable HTTPS (Let's Encrypt). Point your domain's DNS `A` record at the server IP.
9. **Deploy.** Click **Deploy** and watch the logs. You'll see Nixpacks detect Node, run `pnpm install` and `pnpm run build` (listing the static routes), then start the container with `pnpm run start`.
10. **Turn on auto-deploy.** With the GitHub provider, every push to the branch triggers a new build. (Or copy the **Deploy webhook** URL into your repo's webhooks.)

To check what Nixpacks will do before deploying, you can run it locally with Docker installed:

```bash
nixpacks plan .     # prints the detected install/build/start phases
nixpacks build . --name portfolio && docker run -p 3000:3000 portfolio
```

## Before going live, replace placeholders

- `content/bio.json`: `email`, social URLs and (optionally) `formspreeId`
- `public/profile.svg`: swap in a real photo, then update `profileImage`
- `content/projects/`: `mcp-postgres-inspector.mdx` and `shiplog.mdx` are **sample write-ups**. Replace them with real projects, and fill in `repoUrl` / `liveUrl` / `youtubeUrl`.
