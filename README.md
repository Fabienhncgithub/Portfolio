# Fabien Hance — Photography Portfolio

A mobile-first photography portfolio built around a quiet, editorial gallery experience.
It combines a Next.js frontend with a private Strapi CMS and is designed for touch, keyboard
and desktop navigation.

[View the portfolio](https://www.fabienhance.com)

## Highlights

- Responsive gallery, archive and immersive photo pages
- Swipe and keyboard navigation with precise gallery return
- Optimized AVIF and WebP images
- Private Strapi content with a local development fallback
- SEO metadata, sitemap, structured data and consent-based analytics
- Reduced-motion support and visible keyboard focus states

## Stack

Next.js 15, React 19, TypeScript, Strapi 5, GSAP, Sass Modules, OpenNext and pnpm.

## Run locally

Requirements: Node.js 20.9 or newer (up to 26) and pnpm 10.

```bash
git clone https://github.com/Fabienhncgithub/Portfolio.git
cd Portfolio
pnpm install
cp .env.example .env.local
pnpm dev
```

The frontend is available at [localhost:3000](http://localhost:3000). If Strapi is not
configured, it uses the fallback photographs in `src/content/photos.ts`.

To run the CMS:

```bash
cp cms/.env.example cms/.env
pnpm cms:dev
```

The Strapi admin is available at [localhost:1337/admin](http://localhost:1337/admin).

## Configuration

The main frontend variables are documented in `.env.example`:

| Variable | Purpose |
| --- | --- |
| `STRAPI_URL` | Public Strapi URL |
| `STRAPI_INTERNAL_URL` | Optional private server-to-server URL |
| `STRAPI_API_TOKEN` | Read-only token for published photos |
| `STRAPI_WEBHOOK_SECRET` | Secret used by the revalidation webhook |
| `CMS_REQUIRED` | Fails instead of using fallback content when set to `true` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 measurement ID |

Keep tokens and secrets server-side and never commit `.env.local` or `cms/.env`.

## Content

Each published Strapi `Photo` contains a title, slug, image and optional location, year,
category, camera and film details. Add alternative text to every image in the media library.

Production uses a private read-only API token. A Strapi webhook can call
`POST /api/revalidate` with the `x-revalidate-secret` header to refresh published photos
immediately.

## Checks

```bash
pnpm check
pnpm cms:build
pnpm build
pnpm build:hosting
```

`build:hosting` creates the OpenNext bundle for Cloudflare Workers. Docker and VPS deployment
files are available in `deploy/`; the production script validates the Compose configuration,
creates a backup and then rebuilds the services.
