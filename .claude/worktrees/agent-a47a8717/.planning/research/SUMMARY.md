# Research Summary

**Project:** Aaron Lee Portfolio — leeaaronn.github.io
**Synthesized:** 2026-03-31
**Research files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Executive Summary

This is a single-page personal portfolio for a data analyst with a space-themed 3D design. The defining technical centerpiece is a Three.js Earth globe rendered via WebGL using real NASA Blue Marble imagery, persisted as a fixed-position canvas layer behind scroll-snap HTML sections. Research across four domains converges on a consistent verdict: build this with Vite 8 + vanilla JS + Three.js only. No React, no scroll library, no animation framework in Phase 1. The native browser platform (CSS scroll-snap, IntersectionObserver, CSS @keyframes) handles all non-WebGL behavior at zero bundle cost. Three.js primitives — `SphereGeometry`, `MeshPhongMaterial`, `THREE.Points` for stars — are sufficient for everything the design requires.

The highest-risk area is the globe itself, specifically texture loading. The previous prototype failed with procedural noise instead of real imagery, and a broken texture silently undermines the entire purpose of including a 3D element. The research provides confirmed CDN URLs, CORS configuration patterns, and a local `/public/textures/` fallback strategy for production. Secondary risks are mobile performance (uncapped device pixel ratio destroying frame rate) and deployment (Vite `base` URL mis-configuration for a user site vs. project site). Both have clear, one-line fixes documented in the research.

The recommended build sequence prioritizes getting a correct, textured, performant globe rendering before any section content is written — this "globe-first" order validates the hardest technical dependencies early and avoids discovering WebGL/CORS/texture issues late when they are tangled with HTML content work.

---

## Key Findings

### From STACK.md

| Technology | Version | Rationale |
|------------|---------|-----------|
| Vite | 8.0.3 | Fastest cold-start; zero-config vanilla JS; Rolldown builds 10–30x faster; `base: '/'` is correct for user pages |
| three | 0.183.x (latest) | Industry standard for WebGL; TextureLoader, SphereGeometry, MeshPhongMaterial all stable across r150–r183 |
| Node.js | 20.19+ or 22.12+ | Vite 8 hard requirement |
| CSS | Hand-written | Scroll-snap, backdrop-filter, and @keyframes are native; no framework adds value |
| Google Fonts | CDN | Instrument Serif (display), Syne (body), JetBrains Mono (mono); single <link> preconnect |
| GitHub Pages + Actions | — | Free HTTPS hosting; official Vite static deploy pattern |

**Critical version note:** Do NOT use the `three-globe` npm package — it is a data-visualization wrapper adding ~200 KB of overhead. Reference its CDN-hosted assets (unpkg) directly for Earth textures without installing the package.

**Earth texture CDN (dev):** `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg` — CORS-enabled, confirmed active. Switch to `/public/textures/` local copies before first production deploy.

### From FEATURES.md

**Must-have (table stakes — site is not shippable without these):**
- Name + role visible immediately above the fold
- Clear value proposition headline ("Data that tells the real story" or equivalent)
- CTA trio (GitHub, LinkedIn, resume download)
- About section with portrait photo
- Resume as a direct download (not a Google Doc link)
- Working scroll navigation (dot nav + floating nav bar)
- Section progress indicator (disorientation without it in snap model)
- Responsive mobile layout with WebGL degradation on low-power devices
- Fast initial load (LCP < 2.5s — never block first paint on globe texture)

**Strong differentiators (include in Phase 1):**
- Three.js Earth globe with real NASA Blue Marble texture — signals WebGL skill immediately
- Globe tied to scroll (centers on hero, shifts right on about, zooms toward LA)
- Persistent star field across all sections — cohesive immersive environment
- Atmospheric globe glow + LA location marker
- Staggered load animation on hero (eyebrow → title → subtitle → CTAs)
- Stats row in about section (graduation year, projects count, key tools)
- Skill chips (scannable technology badges, no false-precision percentage bars)

**Defer to Phase 2:**
- Project panels / case studies
- Skills visualization section
- Contact form (requires backend/service)
- GSAP animations

**Hard anti-features (do not build):**
- Dark/light theme toggle
- Blog / writing section (content debt with 0–1 posts)
- Real-time GitHub activity feed (fragile API dependency)
- Skills progress bars with percentages (not credible)
- Splash / loading gate blocking content
- React or any JS framework

### From ARCHITECTURE.md

**Layer model (4 z-index layers):**
```
z-index: 3  Floating Nav Bar        — DOM, fixed
z-index: 2  Scroll Sections         — DOM, scroll-snap container
z-index: 1  Globe + Stars Canvas    — Three.js WebGLRenderer, position: fixed
z-index: 0  (background)
```

Stars and globe share ONE Three.js scene on ONE canvas. Two WebGLRenderer instances would waste GPU contexts. Stars are `THREE.Points` with `BufferGeometry` — single draw call.

**Module boundaries:**
- `globe.js` — owns renderer, scene, camera, globe mesh, atmosphere, LA marker. Exposes `initGlobe()`, `updateGlobe(scrollState)`, `resizeGlobe()`
- `stars.js` — receives scene reference from globe, adds Points object. Exposes `initStars(scene)`, `updateStars(elapsed)`
- `scroll.js` — owns scroll container events, section detection, progress bar, dot nav. Exposes `initScroll()`, `getScrollState()` → `{ sectionIndex, progress }`. **Never touches Three.js.**
- `main.js` — initialization order, single RAF loop. Wires modules together. **globe.js never touches DOM.**

**Single RAF pattern in main.js:**
```javascript
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const state = getScrollState();
  updateGlobe(state, clock.getElapsedTime());
  updateStars(clock.getElapsedTime());
  renderer.render(scene, camera);
}
tick();
```

**Critical: scroll listener targets the container element, NOT `window`.** With `scroll-snap-type` on the container, `window.scrollY` does not update. This is the most common vanilla JS + scroll-snap bug.

**Texture loading:** Create globe mesh immediately with placeholder material (`color: 0x1a3a6e`), swap texture in the `TextureLoader` callback. Never block first render on texture load.

**Globe behavior by section:**
| Section | Globe Position | Globe Opacity |
|---------|---------------|--------------|
| 0 Hero | Center (x:0) | 1.0 |
| 1 About | Right (x:+2.5) | 1.0 |
| 2+ | Right (x:+2.5) | 0.0 |

Lerp easing constant: `0.05` per frame at 60fps (~0.95 damping).

**Build order:** scaffold → CSS → scroll.js → globe.js → stars.js → main.js (wiring) → textures → globe scroll behavior → section content → responsive.

### From PITFALLS.md

**Top pitfalls with prevention (all Phase 1):**

1. **Procedural texture instead of real NASA image** — The primary known failure from the previous prototype. Use confirmed unpkg URLs. Set `texture.colorSpace = THREE.SRGBColorSpace`. Globe is grey without this fix.

2. **Vite base URL misconfigured** — `base: '/'` is correct for a user site (`leeaaronn.github.io`). Setting it to `/leeaaronn.github.io/` breaks all asset paths in production. Run `npm run build && npx serve dist` before every push.

3. **CORS block on external textures** — Set `loader.crossOrigin = 'anonymous'` before calling `.load()`. Both unpkg and jsdelivr have CORS headers but TextureLoader must request with `crossOrigin`. Globe silently goes grey without this.

4. **Uncapped device pixel ratio** — `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. A 390px wide iPhone at 3x DPR becomes a 1170px render target without this cap. Mobile drops to 15–20 fps.

5. **RAF loop continues off-screen** — Use IntersectionObserver to pause/resume the animation loop. Globe fades out after the about section anyway — stop rendering at that point to preserve battery and scroll performance.

6. **Three.js memory leak — no dispose()** — Call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()` on scene teardown. Add `import.meta.hot.dispose()` for Vite HMR. Prevents VRAM accumulation during development.

7. **iOS Safari scroll-snap stuck/flick-to-end** — Apply `scroll-snap-type: y mandatory` to a wrapper div, NOT `html` or `body`. Test on real iPhone with fast swipes.

8. **100vh sections cut off by mobile browser chrome** — Use `min-height: 100svh` on sections, not `100vh`. Do NOT use `100dvh` with scroll-snap (causes live recalculation and glitchy re-snapping).

9. **Star field scoped to hero section** — Known failure from previous prototype. Canvas must be `position: fixed` on `<body>`, not positioned inside the hero `<div>`. Stars must be visible on all sections.

10. **Portrait 404** — Place `portrait.jpg` in `public/assets/` and reference as `/assets/portrait.jpg`. Path is case-sensitive on Linux/GitHub Pages.

11. **Wrong accent color** — Define `--accent: #60a5fa` in `:root` CSS from day one. Hard constraint: no green, purple, or orange anywhere. Globe atmosphere emissive must be `new THREE.Color(0x60a5fa)`, not tutorial defaults.

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1 — Foundation & Globe** (current)

Rationale: The globe is the highest-risk deliverable. Validate it working — textured, performant, scroll-linked — before building content sections. All other visual work depends on the star field canvas and layering model being correct. Mobile performance validation belongs here, not as a cleanup task.

Delivers: Working 3D globe with real NASA texture, star field, hero section, about section, scroll-snap navigation, mobile-responsive layout. The portfolio is usable and shippable at end of Phase 1.

Features from FEATURES.md: All table stakes + globe, star field, scroll behavior, hero stagger animation, about section with portrait/stats/chips, dot nav, floating nav, scroll indicator.

Pitfalls to prevent: #1 (texture), #3 (CORS), #4 (pixel ratio), #5 (RAF off-screen), #6 (memory leak), #7 (iOS scroll-snap), #8 (100svh), #9 (star persistence), #10 (portrait path), #11 (accent color), #2 (Vite base URL at deploy).

Research flag: **Phase 1 is well-documented.** ARCHITECTURE.md provides a complete build-order checklist. No phase-level research needed — execute against existing research.

---

**Phase 2 — Content Depth & Animation Polish**

Rationale: Once the Phase 1 shell is stable and deployed, add project showcase content and enhanced animations. The contact form requires a third-party backend choice (Formspree vs. EmailJS) that is out of scope until the form is actually needed.

Delivers: Project panels/case studies, skills visualization section, contact form, GSAP scroll animations replacing CSS-only transitions.

Features from FEATURES.md: Project panels, skills section, contact form, GSAP ScrollTrigger integration with existing scroll-snap system.

Pitfalls to watch: GSAP + scroll-snap integration requires care — ScrollTrigger must not fight the native snap behavior. Research the integration pattern when Phase 2 begins.

Research flag: **Phase 2 needs research.** GSAP ScrollTrigger + `scroll-snap-type: y mandatory` compatibility and the correct integration pattern (disable snap for certain sections? trigger by IntersectionObserver?) should be validated before GSAP is introduced to the codebase.

---

**Phase N (later) — SEO, Performance, Custom Domain**

Rationale: After the portfolio is published and job search is active, optimize for discoverability and performance baseline metrics.

Delivers: Google Fonts → fontsource self-hosting, custom domain configuration, Google Analytics (backend-only, no widget), meta tags and Open Graph for social share previews.

Research flag: **Standard patterns, no research needed** — all of this is well-documented Vite + GitHub Pages territory.

---

### Build Sequence Recommendation

Follow the build order from ARCHITECTURE.md exactly:

1. Scaffold (`index.html`, `vite.config.js`, `package.json`) — verify dev server
2. `style.css` — CSS custom properties (`--accent: #60a5fa`), Google Fonts, reset, `min-height: 100svh`, `html { font-size: 16px }`
3. `scroll.js` — scroll container HTML, section shells, scroll-snap CSS, progress bar, dot nav
4. `globe.js` — Three.js renderer, scene, camera, globe mesh with placeholder material
5. `stars.js` — `THREE.Points` added to same scene (fixed canvas, behind all content)
6. `main.js` — wire all modules, single RAF loop
7. Globe textures — NASA Blue Marble via TextureLoader with CORS config; local `/public/textures/` copy for production
8. Globe scroll behavior — lerp states per section via `updateGlobe(scrollState)`
9. Section content — hero copy, about layout, portrait
10. Responsive — media queries, globe scale on mobile

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vite 8.0.3 and three 0.183.x confirmed via npm registry. Breaking changes reviewed — none affect this project. |
| Features | HIGH | Based on 2025–2026 hiring manager surveys, portfolio design trend analysis, and Three.js portfolio case studies. Anti-features well-evidenced. |
| Architecture | HIGH | Patterns confirmed from Three.js official docs, canonical community examples (Three.js Journey, Codrops), and MDN. Module boundaries are straightforward for a project this size. |
| Pitfalls | HIGH | Most confirmed against official Three.js forum posts, MDN, and the project's own previous prototype failures. CDN URLs at MEDIUM confidence — availability can change. |

**Overall: HIGH**

### Gaps to Address

1. **Earth texture CDN durability** — unpkg URLs are confirmed active but third-party CDN availability is not guaranteed. Mitigation is already specified: download to `/public/textures/` before the first production deploy. This is not a planning gap; it is an execution checklist item.

2. **GSAP + scroll-snap compatibility** — Intentionally deferred. Do not attempt to integrate GSAP ScrollTrigger with `scroll-snap-type: y mandatory` in Phase 1. This requires dedicated research at the start of Phase 2 before touching the scroll system.

3. **Portrait content** — The research validates the path (`/assets/portrait.jpg` from `public/`), but the actual photo asset must exist before Phase 1 can ship. Confirmed `portrait.jpg` is already in the repo root (`git status` shows it untracked). Move to `public/assets/portrait.jpg` during execution.

4. **Resume PDF asset** — Not researched explicitly. Same pattern as portrait: PDF should live in `public/` and be referenced as `/resume.pdf` or `/assets/resume.pdf`. Direct download requires `download` attribute on the `<a>` tag.

---

## Sources (Aggregated)

### Stack
- [Vite 8 release announcement](https://vite.dev/blog/announcing-vite8)
- [Vite static deploy guide](https://vite.dev/guide/static-deploy)
- [three npm package](https://www.npmjs.com/package/three)
- [Three.js GitHub releases](https://github.com/mrdoob/three.js/releases)
- [unpkg three-globe asset listing](https://unpkg.com/three-globe/example/img/)

### Features
- [21 Best Developer Portfolio Websites (2026) - Colorlib](https://colorlib.com/wp/developer-portfolios/)
- [Best Three.js Portfolio Examples (2026)](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
- [Don't waste time on a (React) portfolio website - 60+ hiring managers survey](https://profy.dev/article/portfolio-websites-survey)
- [How to Create a Stand Out Data Analyst Portfolio (2025)](https://www.interviewquery.com/p/how-to-create-a-data-analyst-portfolio)
- [15 Portfolio Mistakes to Avoid in 2025](https://fueler.io/blog/portfolio-mistakes-to-avoid)

### Architecture
- [Three.js WebGLRenderer docs](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
- [Crafting Scroll Based Animations in Three.js - Codrops](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/)
- [Three.js Journey — Scroll based animation](https://threejs-journey.com/lessons/scroll-based-animation)
- [MDN — scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type)
- [Three.js forum — Multiple renderer vs multiple canvas](https://discourse.threejs.org/t/multiple-renderer-vs-multiple-canvas/3085)

### Pitfalls
- [Three.js Tips and Tricks - discoverthreejs.com](https://discoverthreejs.com/tips-and-tricks/)
- [Three.js Performance - Codrops 2025](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [TextureLoader CORS - Three.js forum](https://discourse.threejs.org/t/textureloader-cors-problem-when-texture-has-external-link/57163)
- [CSS scroll-snap challenges - Adrian Roselli](https://adrianroselli.com/2021/07/scroll-snap-challenges.html)
- [100vh mobile address bar fix](https://www.codegenes.net/blog/css-100vh-is-too-tall-on-mobile-due-to-browser-ui/)
- [scrollend event - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap)
