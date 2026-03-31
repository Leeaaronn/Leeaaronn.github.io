<!-- GSD:project-start source:PROJECT.md -->
## Project

**Aaron Lee — Portfolio Website**

A personal portfolio website for Aaron Lee, an entry-level Data Analyst / Data Operations professional based in Rosemead, CA. Deployed to GitHub Pages at leeaaronn.github.io. Features a 3D Earth globe with Three.js, scroll-snap sections, and a space-themed dark aesthetic. Built with Vite + vanilla JS — no frameworks.

**Core Value:** A polished, visually striking portfolio that makes hiring managers and recruiters remember Aaron Lee — the 3D globe and clean design signal technical craft beyond a typical resume site.

### Constraints

- **Tech stack**: Vite + vanilla JS + Three.js only. No React, no Tailwind, no GSAP yet.
- **Deployment**: GitHub Pages from main branch
- **Color**: Black + white + light blue (#60a5fa) ONLY. No green, purple, or orange.
- **Typography**: Minimum 16px body text. Readability is non-negotiable.
- **Globe texture**: Must use real NASA Blue Marble texture, not procedural generation.
- **Stars**: Must be visible on every section, not just hero.
- **Phase boundary**: This milestone covers ONLY hero + about. Projects, skills, contact are Phase 2.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Build Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | 8.0.3 | Dev server + production bundler | Fastest cold-start of any bundler; native ESM in dev means no transform overhead for vanilla JS; single-file HTML entry point with zero config; Rolldown-powered builds in v8 are 10–30x faster than previous esbuild+Rollup. No React overhead needed. |
| Node.js | 20.19+ or 22.12+ | Runtime for Vite | Vite 8 hard requirement; Node 20 is LTS, Node 22 is current. |
### 3D Rendering
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| three | 0.183.x (r183) | WebGL rendering, globe, starfield | Industry standard for WebGL; enormous ecosystem; `TextureLoader`, `SphereGeometry`, `MeshPhongMaterial`, and `WebGLRenderer` are the core primitives for a globe — none of these have changed meaningfully since r150. Latest is safe for this usage. |
### Fonts
| Technology | Source | Purpose | Why |
|------------|--------|---------|-----|
| Instrument Serif | Google Fonts | Display / hero headings | Elegant serif; pairs with space aesthetic; free, CDN-hosted |
| Syne | Google Fonts | Body + UI text | Geometric sans-serif with a technical personality; good readability at 16px+ |
| JetBrains Mono | Google Fonts | Monospace / code detail chips | Clean monospace; optimized for screen rendering; free |
### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Hand-written CSS | — | All layout, animation, design tokens | Scroll-snap is a native CSS feature requiring zero JS for the snap behavior; `backdrop-filter: blur()` is native in all modern browsers; `@keyframes` covers globe rotation, star drift, and load animations. CSS custom properties serve as the design token system (colors, sizes, timing). No framework needed and any framework would add friction. |
### Deployment
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Pages | — | Static hosting | Free; HTTPS auto-provisioned; serves from `main` branch via GitHub Actions; custom domain available in Phase 2 |
| GitHub Actions | — | CI/CD pipeline | Official approach recommended by Vite docs; uses `actions/upload-pages-artifact` + `actions/deploy-pages`; no third-party actions needed |
## Earth Texture CDN Resources
### Primary: unpkg.com (three-globe package assets)
| Asset | URL | Use |
|-------|-----|-----|
| Earth Blue Marble (day texture) | `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg` | Primary color/diffuse map |
| Topology / bump map | `https://unpkg.com/three-globe/example/img/earth-topology.png` | Terrain relief (bump map) |
| Water / specular mask | `https://unpkg.com/three-globe/example/img/earth-water.png` | Ocean specularity (water vs land) |
### Fallback: Local assets in `/public/textures/`
### TextureLoader CORS setup for CDN URLs
## Vite Configuration for GitHub Pages
### GitHub Actions workflow
## Scroll-Snap + Section Detection: No Library Needed
- Detecting which section is active (for dot navigation and progress bar)
- Triggering Three.js globe behavior (zoom, fade) at section boundaries
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
## Installation
# Verify Node version first
# Scaffold (from repo root, if repo already exists use --force or scaffold into a temp dir)
# Core 3D dependency
# Dev dependencies come with the vite scaffold; no additional dev installs needed
## package.json scripts
## Sources
- [three npm package](https://www.npmjs.com/package/three) — version 0.183.x confirmed as latest
- [Three.js GitHub releases](https://github.com/mrdoob/three.js/releases) — r175–r183 breaking changes reviewed; none affect globe primitives
- [Vite 8 release announcement](https://vite.dev/blog/announcing-vite8) — v8.0.3, Node.js requirements, Rolldown integration
- [Vite static deploy guide](https://vite.dev/guide/static-deploy) — base path distinction (user vs project page) and GitHub Actions workflow
- [Vite migration from v7](https://vite.dev/guide/migration) — breaking changes reviewed for vanilla JS impact
- [unpkg three-globe asset listing](https://unpkg.com/three-globe/example/img/) — Earth texture URLs confirmed active; CORS headers confirmed from unpkg design
- [three-globe npm](https://www.npmjs.com/package/three-globe) — v2.45.1 reviewed and rejected (unnecessary dependency)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
