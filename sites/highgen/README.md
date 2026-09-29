# HighGen (`sites/highgen`)

The HighGen site (highgen.org, public Cannabis sativa genomes) is a standalone Next.js app living under `sites/highgen/`. It
builds from its own `pages/` and imports all shared, site-agnostic code from the
`@repo/shared` workspace package (`packages/shared`).

## Layout

```text
sites/highgen/
  pages/            route files (resolve HighGen content directly — no runtime site branching)
  views/            HighGen-specific views/components
  config/           HighGen site config resolver (config/config.ts)
  meta/             HighGen page metadata
  public/           HighGen static assets
  tests/e2e/        HighGen Playwright smoke suite
  playwright.config.ts
  next.config.mjs
  tsconfig.json
  mdx-components.tsx
  _app / _document / _error
```

## Build & run

All commands are run **from the repo root** (the static-export and catalog data
paths resolve relative to it):

| Command                                                    | What it does                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `npm run dev:highgen`                                      | Dev server (`next dev sites/highgen`) on `localhost:3000`   |
| `npm run build-local:highgen`                              | Production export using the local env → `sites/highgen/out` |
| `npm run build-dev:highgen` / `npm run build-prod:highgen` | Export using the dev / prod env                             |
| `npm run start:highgen`                                    | Serve the built export (`npx serve sites/highgen/out`)      |
| `npm run test:e2e:highgen`                                 | Build, serve, and run the Playwright smoke suite            |

Each build script copies the site's env, favicons, and catalog `/api/*.json`
into `sites/highgen/` before running Next, so the produced app is self-contained.

## Keeping the sites clean and separate

The `sites/<site>/` folders hold **only site-specific** code. Anything
view-agnostic or shared belongs in `@repo/shared`.

**If you find yourself duplicating a file (component, hook, util, type) between
`sites/highgen` and another site, that is the signal to move it into
`@repo/shared` and import it from both.** Copy-paste across sites is how the
shared layer silently rots — promote the shared piece instead. Keep in
`sites/highgen` only what is genuinely HighGen-only.

Conversely, `@repo/shared` must never import from `sites/*` or from another
site's config — it stays site-neutral so every site can consume it.
