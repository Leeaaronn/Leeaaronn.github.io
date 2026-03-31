# Technology Stack

**Project:** Aaron Lee Portfolio — leeaaronn.github.io
**Researched:** 2026-03-31

---

## Recommended Stack

### Core Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | 8.0.3 | Dev server + production bundler | Fastest cold-start of any bundler; native ESM in dev means no transform overhead for vanilla JS; single-file HTML entry point with zero config; Rolldown-powered builds in v8 are 10–30x faster than previous esbuild+Rollup. No React overhead needed. |
| Node.js | 20.19+ or 22.12+ | Runtime for Vite | Vite 8 hard requirement; Node 20 is LTS, Node 22 is current. |

**Confidence: HIGH** — Vite 8.0.3 confirmed via npm; Node requirements confirmed from official Vite 8 migration guide.

**Vite 8 vanilla JS compatibility:** The breaking changes in Vite 8 (Rolldown replacing Rollup, Lightning CSS for minification, CommonJS interop tightening) do not affect vanilla JS projects. The `--template vanilla` scaffold requires no changes and no migration from v7. The only relevant change is that `optimizeDeps.esbuildOptions` is deprecated — this option is unused in a vanilla project anyway.

---

### 3D Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| three | 0.183.x (r183) | WebGL rendering, globe, starfield | Industry standard for WebGL; enormous ecosystem; `TextureLoader`, `SphereGeometry`, `MeshPhongMaterial`, and `WebGLRenderer` are the core primitives for a globe — none of these have changed meaningfully since r150. Latest is safe for this usage. |

**Version rationale — use `three@latest` (currently 0.183.x):**

Three.js releases every 3–4 weeks. The r175–r183 breaking changes are limited to: removed deprecated geometry aliases, blending formula corrections, ExtrudeGeometry cleanup, and addon-level changes. None of these touch `TextureLoader`, `SphereGeometry`, `MeshPhongMaterial`, `PointsMaterial` (starfield), or `WebGLRenderer`. Running `npm install three` will install 0.183.x and is safe.

Do NOT use the `three-globe` npm package (vasturiano/three-globe) — it wraps Three.js in a data-visualization layer (flight arcs, country polygons, hex bins) that this project does not need. It adds ~200 KB of unused overhead. All globe functionality is implemented directly with Three.js primitives.

**Confidence: HIGH** — version confirmed via npm registry; breaking change scope confirmed from GitHub releases page.

---

### Fonts

| Technology | Source | Purpose | Why |
|------------|--------|---------|-----|
| Instrument Serif | Google Fonts | Display / hero headings | Elegant serif; pairs with space aesthetic; free, CDN-hosted |
| Syne | Google Fonts | Body + UI text | Geometric sans-serif with a technical personality; good readability at 16px+ |
| JetBrains Mono | Google Fonts | Monospace / code detail chips | Clean monospace; optimized for screen rendering; free |

Load all three in a single `<link>` preconnect + stylesheet call to minimize round trips:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Confidence: HIGH** — Google Fonts API is stable; these exact families are confirmed available.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Hand-written CSS | — | All layout, animation, design tokens | Scroll-snap is a native CSS feature requiring zero JS for the snap behavior; `backdrop-filter: blur()` is native in all modern browsers; `@keyframes` covers globe rotation, star drift, and load animations. CSS custom properties serve as the design token system (colors, sizes, timing). No framework needed and any framework would add friction. |

---

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Pages | — | Static hosting | Free; HTTPS auto-provisioned; serves from `main` branch via GitHub Actions; custom domain available in Phase 2 |
| GitHub Actions | — | CI/CD pipeline | Official approach recommended by Vite docs; uses `actions/upload-pages-artifact` + `actions/deploy-pages`; no third-party actions needed |

---

## Earth Texture CDN Resources

This is the most operationally critical part of the stack. The previous prototype failed by using procedural noise generation instead of a real texture. These are verified CDN URLs that serve real NASA Blue Marble imagery.

### Primary: unpkg.com (three-globe package assets)

The `three-globe` npm package ships example image assets derived from NASA Blue Marble. These are hosted on unpkg with `Access-Control-Allow-Origin: *` headers — unpkg enables CORS on all packages by design. You do NOT need to install the `three-globe` npm package to use these image files. Reference the URLs directly.

| Asset | URL | Use |
|-------|-----|-----|
| Earth Blue Marble (day texture) | `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg` | Primary color/diffuse map |
| Topology / bump map | `https://unpkg.com/three-globe/example/img/earth-topology.png` | Terrain relief (bump map) |
| Water / specular mask | `https://unpkg.com/three-globe/example/img/earth-water.png` | Ocean specularity (water vs land) |

**Confidence: MEDIUM** — URLs confirmed active from unpkg browse interface and referenced in multiple open-source globe projects. unpkg is CORS-enabled by design. CDN availability can change; see local fallback below.

### Fallback: Local assets in `/public/textures/`

For production deployment, download these files once and commit them to the repo:

```
public/
  textures/
    earth-blue-marble.jpg
    earth-topology.png
    earth-water.png
```

Files in `/public/` are served verbatim by Vite in dev and copied to `dist/` on build. Reference them as `/textures/earth-blue-marble.jpg` — no import needed. This is the recommended approach for the final production build because a broken CDN URL on a live portfolio is a career-damaging first impression.

**Workflow recommendation:** Use CDN URLs during development (faster iteration, no large binary in commits). Before the first production deploy, download the three files and switch the paths to `/textures/...`.

### TextureLoader CORS setup for CDN URLs

When loading from any external URL, set `crossOrigin` on the loader before calling `.load()`:

```javascript
const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

const earthTexture = loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
const bumpTexture   = loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
const waterTexture  = loader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
```

This is not needed when textures are served from `/public/textures/` (same origin).

---

## Vite Configuration for GitHub Pages

This site deploys to `https://leeaaronn.github.io/` — a **user page** (the repo is named `leeaaronn.github.io`, matching `<username>.github.io`). This is distinct from a project page.

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',        // User pages deploy to root — NOT '/repo-name/'
  build: {
    outDir: 'dist', // GitHub Actions workflow uploads this directory
  },
});
```

**Critical distinction:** Project pages (`username.github.io/my-project`) need `base: '/my-project/'`. User pages (`username.github.io`) need `base: '/'` (which is the Vite default). Setting `base` to a subdirectory on a user page causes all asset paths to 404 in production while appearing to work locally.

**Confidence: HIGH** — confirmed from Vite official static deploy documentation and multiple deployment guides.

### GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Enable GitHub Pages via Settings → Pages → Source: GitHub Actions (not the legacy "Deploy from branch" option).

---

## Scroll-Snap + Section Detection: No Library Needed

CSS scroll-snap handles the snapping behavior natively. JavaScript is only needed for:
- Detecting which section is active (for dot navigation and progress bar)
- Triggering Three.js globe behavior (zoom, fade) at section boundaries

The right tool for section detection is the **Intersection Observer API** — it fires callbacks when a section crosses the viewport threshold, is significantly more performant than listening to `scroll` events, and is supported in all modern browsers with no polyfill needed.

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // entry.target is the section that became visible
      }
    });
  },
  { threshold: 0.5 } // fire when 50% of section is visible
);

document.querySelectorAll('section').forEach(s => observer.observe(s));
```

No scroll library (locomotive-scroll, lenis, GSAP ScrollTrigger) is needed for Phase 1.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 8 | webpack, Parcel | Webpack is configuration-heavy for a static site; Parcel lacks the same documentation depth for GitHub Pages deployment |
| 3D library | three (bare) | three-globe, globe.gl, babylon.js | three-globe is data-visualization overhead; globe.gl is React-oriented; Babylon.js is enterprise-scale with a different API philosophy |
| Scroll handling | Native CSS scroll-snap + IntersectionObserver | locomotive-scroll, lenis, GSAP ScrollTrigger | Native scroll-snap requires zero bundle cost; IntersectionObserver is purpose-built for section detection; GSAP ScrollTrigger is Phase 2 scope |
| Texture hosting | unpkg CDN (dev) + local /public/ (prod) | jsDelivr, self-hosted NASA direct | NASA direct links depend on NASA server availability; jsDelivr works but unpkg already hosts the exact files from the three-globe package |
| Animations | CSS @keyframes | GSAP | GSAP is Phase 2 scope; globe rotation, star drift, and load stagger animations are all achievable with CSS keyframes at zero bundle cost |
| Deployment | GitHub Actions | gh-pages npm package | gh-pages npm is the legacy approach; GitHub Actions with pages/deploy-pages is the current official pattern with better permission scoping |
| Fonts | Google Fonts CDN | fontsource (self-hosted) | Google Fonts is simpler for Phase 1; switching to fontsource for privacy/performance is a 30-minute task in Phase 2 if needed |

---

## Installation

```bash
# Verify Node version first
node --version   # Must output v20.19+ or v22.12+

# Scaffold (from repo root, if repo already exists use --force or scaffold into a temp dir)
npm create vite@latest . -- --template vanilla

# Core 3D dependency
npm install three

# Dev dependencies come with the vite scaffold; no additional dev installs needed
```

No other runtime dependencies for Phase 1. Total `node_modules` footprint is small — Vite + Three.js only.

---

## package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`npm run preview` serves the `dist/` output locally over HTTP — always run this before pushing to catch asset path issues (especially texture paths) before they surface on GitHub Pages.

---

## Sources

- [three npm package](https://www.npmjs.com/package/three) — version 0.183.x confirmed as latest
- [Three.js GitHub releases](https://github.com/mrdoob/three.js/releases) — r175–r183 breaking changes reviewed; none affect globe primitives
- [Vite 8 release announcement](https://vite.dev/blog/announcing-vite8) — v8.0.3, Node.js requirements, Rolldown integration
- [Vite static deploy guide](https://vite.dev/guide/static-deploy) — base path distinction (user vs project page) and GitHub Actions workflow
- [Vite migration from v7](https://vite.dev/guide/migration) — breaking changes reviewed for vanilla JS impact
- [unpkg three-globe asset listing](https://unpkg.com/three-globe/example/img/) — Earth texture URLs confirmed active; CORS headers confirmed from unpkg design
- [three-globe npm](https://www.npmjs.com/package/three-globe) — v2.45.1 reviewed and rejected (unnecessary dependency)
