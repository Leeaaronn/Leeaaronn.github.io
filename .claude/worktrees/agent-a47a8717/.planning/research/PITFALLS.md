# Domain Pitfalls

**Domain:** Three.js portfolio site — 3D Earth globe, scroll-snap sections, GitHub Pages
**Project:** Aaron Lee — leeaaronn.github.io
**Researched:** 2026-03-31
**Overall confidence:** HIGH (most pitfalls verified against official Three.js forum, MDN, and community post-mortems)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken production deployments, or unusable UX.

---

### Pitfall 1: Procedural Globe Texture Instead of Real NASA Image

**What goes wrong:** The globe looks fake — grainy, aliased, obviously computer-generated. Confirmed failure in the previous prototype.

**Why it happens:** Three.js examples and tutorials often show MeshStandardMaterial with noise or placeholder colors before teaching texture loading. Developers copy-paste the wrong example.

**Consequences:** The globe — the visual centerpiece of the portfolio — loses all impact. Hiring managers see a demo, not a polished product.

**Prevention:**
- Load the Blue Marble texture from a reliable CDN at scene initialization, before the first frame renders.
- Confirmed working URLs (HIGH confidence):
  - `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg`
  - `https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg`
- Use `THREE.TextureLoader` and assign to `MeshStandardMaterial.map`.
- Set `texture.colorSpace = THREE.SRGBColorSpace` after load — otherwise colors are washed out.
- Add a bump map (`earth-topology.png` from same CDN) for surface relief at minimal GPU cost.

**Detection:** If the globe looks grey, noisy, or has visible banding — texture did not load. Open the Network tab; a 404 on the texture URL is the most common cause.

**Phase:** Phase 1 (globe scaffold). Address in the very first Three.js commit.

---

### Pitfall 2: Vite Base URL Not Set for GitHub Pages User Site

**What goes wrong:** The built site loads a blank page on `leeaaronn.github.io`. All assets 404. The dev server works perfectly but production is broken.

**Why it happens:** Vite defaults `base` to `/`. This is correct for a user site (`<username>.github.io`) deploying from the `main` branch root. If the config is accidentally set to a repo subdirectory path (e.g., `/leeaaronn.github.io/`) the assets path doubles up and breaks.

**Consequences:** Complete production failure. Zero visibility for recruiters clicking the portfolio link.

**Prevention:**
- Since this is a **user site** (not a project page), `vite.config.js` must have `base: '/'` or omit `base` entirely (defaults to `/`).
- Never set `base` to `'/<repo-name>/'` — that is only for project pages at `github.io/<repo>`.
- Run `npm run build && npx serve dist` locally before every push to main.
- Confirm `dist/index.html` references assets as `/assets/...` not as relative `./assets/...` after build.

**Detection:** After `npm run build`, inspect `dist/index.html` — script and link tags must point to `/assets/`. If they point to `/<repo-name>/assets/` the base is wrong.

**Phase:** Phase 1 deployment step. Set correctly once and do not touch again.

---

### Pitfall 3: CORS Block on Externally Hosted Textures

**What goes wrong:** Globe renders as solid grey/black in production even though it worked locally. Browser console shows: `Cross-Origin Request Blocked` or `No 'Access-Control-Allow-Origin' header`.

**Why it happens:** When Three.js loads a texture from a CDN cross-origin, the browser requires CORS headers. Without the `crossOrigin` attribute on the underlying `<img>` element, WebGL cannot use the image data (canvas taint protection). Both `unpkg.com` and `jsdelivr.net` serve correct CORS headers, but the Three.js `TextureLoader` must be told to request the resource with `crossOrigin = 'anonymous'`.

**Consequences:** Globe silently fails to texture. The Three.js error is easy to miss without the console open.

**Prevention:**
```javascript
const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';
const texture = loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
```
- Alternatively, download the texture file and bundle it in `/public/textures/` to avoid CORS entirely. This is more reliable but adds ~5 MB to the repo.
- Test in production (GitHub Pages), not just localhost — CORS behavior differs.

**Detection:** Check the browser Network tab in production. If the texture request returns 200 but the globe is grey, look for a console warning about canvas taint or CORS.

**Phase:** Phase 1 (globe scaffold).

---

### Pitfall 4: Uncapped Device Pixel Ratio Destroying Mobile Performance

**What goes wrong:** The globe animation runs at acceptable fps on desktop but drops to ~15–20 fps on mobile, making the site feel broken.

**Why it happens:** Mobile devices report `window.devicePixelRatio` of 2–4. If you pass this directly to `renderer.setPixelRatio(window.devicePixelRatio)`, a 390×844 iPhone becomes a 1560×3376 render target. Mobile GPU is completely overwhelmed.

**Consequences:** Janky globe rotation, scroll-snap stutter, general impression of a broken site on the most common device type recruiters use.

**Prevention:**
```javascript
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```
- Cap at 2. Most Retina displays are indistinguishable above 2x. Pixel ratio 3–4 is pure GPU waste.
- For very low-end devices, consider capping at 1.5 or detecting via `navigator.hardwareConcurrency < 4`.

**Detection:** Test on a real mid-range Android device (not just iPhone). Chrome DevTools mobile emulation does not simulate GPU limitations. Look for consistent frame times above 16 ms in the Performance panel.

**Phase:** Phase 1 (renderer setup). Set during the first render loop commit.

---

### Pitfall 5: Rendering Loop Continues Off-Screen (CPU/Battery Drain)

**What goes wrong:** The Three.js `requestAnimationFrame` loop runs at full speed even when the user has scrolled past the globe section. The GPU renders frames that are never seen, draining battery and competing with scroll animations.

**Why it happens:** Beginners set up `requestAnimationFrame` and never add visibility logic. The loop runs forever once started.

**Consequences:** On mobile, the battery drain is significant. Scroll performance on later sections degrades because the GPU is still rendering the globe.

**Prevention:**
- Use `IntersectionObserver` on the globe's parent element. Pause the animation loop when it exits the viewport; resume when it enters.
- Simpler alternative: check `document.visibilityState === 'hidden'` and skip rendering.
- The globe's own "fades out past about section" requirement in PROJECT.md means the canvas can be fully paused after the about section.

```javascript
const observer = new IntersectionObserver(([entry]) => {
  isGlobeVisible = entry.isIntersecting;
});
observer.observe(globeContainer);

function animate() {
  requestAnimationFrame(animate);
  if (!isGlobeVisible) return; // skip render
  renderer.render(scene, camera);
}
```

**Detection:** Open DevTools Performance while scrolled to the Contact section. If GPU activity is still high, the loop is not paused.

**Phase:** Phase 1 (animation loop). Add pause logic alongside the initial loop setup.

---

### Pitfall 6: Three.js Memory Leak — No dispose() on Scene Cleanup

**What goes wrong:** If the globe scene is ever torn down and rebuilt (e.g., during hot-module reload in Vite dev, or if the user navigates away and back in a future SPA version), GPU memory leaks. Over time, the browser's VRAM fills up.

**Why it happens:** Three.js does not garbage-collect GPU resources automatically. Geometry, material, texture, and renderer objects each hold GPU memory. Calling `scene.remove(mesh)` detaches the JS reference but does NOT free VRAM.

**Consequences:** Progressive performance degradation during development. In a long dev session with frequent HMR saves, the browser can slow down significantly.

**Prevention:**
- On cleanup, explicitly call:
  ```javascript
  geometry.dispose();
  material.dispose();
  texture.dispose();
  renderer.dispose();
  ```
- For Vite HMR, add a cleanup in `import.meta.hot.dispose()`.
- Monitor `renderer.info.memory.geometries` and `renderer.info.memory.textures` in dev — they should stay constant, not grow.

**Detection:** In Chrome DevTools Memory panel, take heap snapshots before and after HMR save. If `WebGLTexture` or `WebGLBuffer` count grows, there is a leak.

**Phase:** Phase 1 (globe setup). Add dispose logic from the start to prevent bad habits.

---

## Moderate Pitfalls

Mistakes that cause UX degradation or mobile breakage but are recoverable without a rewrite.

---

### Pitfall 7: scroll-snap-type: y mandatory on iOS Safari — Stuck Sections

**What goes wrong:** On iOS Safari, using `scroll-snap-type: y mandatory` can cause the page to get "stuck" — the user cannot scroll past a section, or fast-flick gestures scroll all the way to the last section.

**Why it happens:** iOS Safari's momentum scrolling interacts poorly with mandatory snap. A fast swipe can carry momentum past several snap points, then the browser snaps to the last one. Apple's WebKit implementation of scroll-snap mandatory has known bugs documented in their bug tracker (WebKit bugs 153852 and 160622).

**Prevention:**
- Apply scroll-snap to a wrapper div, NOT to `html` or `body`. iOS Safari has the most compatibility with snap on a child container element.
- Use `scroll-snap-type: y mandatory` on the scroll container, `scroll-snap-align: start` on each section.
- Test specifically on iOS Safari 16+ and 17+ (not just Chrome DevTools mobile emulation).
- As fallback, consider `scroll-snap-type: y proximity` on mobile via `@media` query if mandatory causes persistent issues.

**Detection:** Test on a real iPhone by swiping fast. If sections are skipped or the page jumps to the bottom, the snap behavior is broken.

**Phase:** Phase 1 (scroll-snap setup). Mobile testing required before marking complete.

---

### Pitfall 8: 100vh Sections Cut Off by Mobile Browser Chrome

**What goes wrong:** On mobile Chrome and Safari, the browser address bar occupies screen real estate that is NOT included in `100vh`. The bottom of each section is clipped. CTAs, scroll indicators, and stat rows get partially hidden.

**Why it happens:** Mobile browsers define `1vh` as 1% of the "layout viewport" which includes the address bar height. When the address bar hides on scroll, `100vh` sections overflow.

**Prevention:**
- Use `height: 100svh` for sections where you want the safe minimum (address bar always visible).
- Use `height: 100dvh` for sections that should fill whatever is visible — but be aware this causes layout recalculation as the user scrolls.
- The safest pattern: `min-height: 100svh` on section elements, combined with scroll-snap.
- Do NOT use `100dvh` with scroll-snap sections — the live viewport size change causes glitchy re-snapping.

**Detection:** Load the site on an Android phone with Chrome. If content is cut off at the bottom before scrolling, `100vh` is the culprit.

**Phase:** Phase 1 (CSS layout). Address during global CSS setup.

---

### Pitfall 9: Star Field Canvas Not Truly Persistent Across Sections

**What goes wrong:** Stars disappear on non-hero sections, exactly as occurred in the previous prototype. The star canvas is scoped to the hero section height rather than being fixed behind the entire page.

**Why it happens:** The canvas is positioned `absolute` inside the hero section div rather than `fixed` on the `body`. When the hero scrolls out of view, the canvas goes with it.

**Prevention:**
- The star canvas MUST be positioned as:
  ```css
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  ```
- It must be a direct child of `<body>` (or the topmost wrapper), not nested inside a section.
- The scroll-snap container sits above it. Sections have `background: transparent` so stars show through.

**Detection:** Scroll to the About or Skills section. If the background is solid black with no stars, the canvas is not fixed.

**Phase:** Phase 1 (star field). This is a known failure from the previous prototype — address first.

---

### Pitfall 10: Portrait Image 404 From Wrong Path

**What goes wrong:** The About section portrait is a broken image icon. Confirmed failure in the previous prototype.

**Why it happens:** The asset is at `./assets/portrait.jpg` but code references `/assets/portrait.jpg` (absolute) or `assets/portrait.jpg` (no leading `./`). Vite resolves these differently in dev vs. production builds.

**Prevention:**
- In HTML: `<img src="./assets/portrait.jpg">` — use explicit relative path.
- In Vite, assets in `/public/` are served at `/`. Assets referenced via `import` are fingerprinted and bundled.
- For a simple `<img>` tag in HTML, place `portrait.jpg` in `public/assets/` and reference it as `/assets/portrait.jpg` in the HTML. Vite copies `public/` verbatim to `dist/`.
- Verify the file exists: `ls public/assets/portrait.jpg` — the path matters and must match exactly (case-sensitive on Linux/GitHub Pages).

**Detection:** After `npm run build`, open `dist/index.html` in a browser served from `dist/`. If the portrait is missing, check the Network tab for the exact path requested vs. where the file actually landed in `dist/`.

**Phase:** Phase 1 (about section). Verify path before writing the about section markup.

---

### Pitfall 11: Font Size Below 16px Minimum

**What goes wrong:** Body copy, caption text, chips, and nav links render too small to read comfortably. Confirmed failure in the previous prototype (body was ~14px).

**Why it happens:** Browser default body font-size is 16px, but many CSS resets set it to a smaller unitless value. Developers then set component-level sizes in `em` relative to a too-small base, cascading smallness everywhere.

**Prevention:**
- Set `html { font-size: 16px; }` explicitly in the CSS reset — never lower.
- Use `clamp()` for responsive type, with a minimum argument never below 16px for body text.
- Detail chips, stat labels, and navigation: minimum 14px is acceptable for supplementary UI, but body paragraphs must be 16px+.
- Instruments Serif (display), Syne (body), JetBrains Mono (mono) — load all three from Google Fonts using a single `<link>` with `display=swap`.

**Detection:** Chrome DevTools Accessibility panel will flag text below 12px. Manually check computed font-size on `<p>`, `.bio`, and `.chip` elements.

**Phase:** Phase 1 (global CSS). Address in the CSS reset/variables commit before any section content.

---

### Pitfall 12: Wrong Accent Color (Green or Purple Instead of Light Blue)

**What goes wrong:** An unintended color — most likely CSS `hsl(120, ...)` green or `purple` — appears on interactive elements, borders, or glow effects instead of `#60a5fa`. Confirmed failure in the previous prototype.

**Why it happens:** Three.js examples use green for debug helpers (`THREE.AxesHelper`) and glow effects. CSS custom property names like `--accent` can get overwritten by example code. The atmospheric glow on the globe is a `THREE.Mesh` with emissive color that defaults to white or green in tutorials.

**Prevention:**
- Define `--accent: #60a5fa` in `:root` CSS from day one and use it everywhere. Never hardcode color hex values outside of the custom properties block.
- For the globe atmosphere mesh: set `emissive: new THREE.Color(0x60a5fa)`, not any tutorial default.
- HARD RULE from PROJECT.md: no green, no purple, no orange anywhere in the product.
- Add a linting comment in `CLAUDE.md`: "Color constraint: only black, white, light greys, and #60a5fa."

**Detection:** Visual inspection — do a search in the codebase for `green`, `purple`, `#00ff`, `hsl(120` and remove any matches.

**Phase:** Phase 1. Enforce via `--accent` custom property from the first CSS commit.

---

## Minor Pitfalls

Issues that are annoying but easy to fix once detected.

---

### Pitfall 13: Z-Fighting on Globe Atmosphere Mesh

**What goes wrong:** The atmosphere glow flickers at the globe's edge, especially when the globe rotates.

**Why it happens:** Z-fighting — two meshes at almost exactly the same depth. The globe sphere and the slightly-larger atmosphere sphere render the same depth values depending on the viewing angle.

**Prevention:**
- Make the atmosphere sphere meaningfully larger (1.02–1.05× the globe radius), not 1.001×.
- Set `depthWrite: false` on the atmosphere material.
- Use `THREE.AdditiveBlending` on the atmosphere material.

**Phase:** Phase 1 (globe visual polish).

---

### Pitfall 14: Globe Clip Space Bleed — Canvas Visible Outside Scroll Container

**What goes wrong:** The Three.js renderer canvas bleeds outside its container div, covering nav or other sections on some browsers.

**Why it happens:** The renderer canvas is `display: block` but the container has no explicit `overflow: hidden`. WebGL canvases sometimes render outside their box model bounds.

**Prevention:**
- Wrap the canvas in a container div with `overflow: hidden` and `position: relative`.
- Set canvas to `width: 100%; height: 100%; display: block`.

**Phase:** Phase 1 (globe layout).

---

### Pitfall 15: Dot Navigation Not Updating When Scroll-Snap Jumps Sections

**What goes wrong:** Clicking a dot navigates correctly, but scrolling manually does not update the active dot.

**Why it happens:** Developers bind the active state update to click events only, not to actual scroll position. With `scroll-snap-type: y mandatory`, programmatic scroll via `scrollTo` fires the scroll event, but fast manual snapping may fire it late or once.

**Prevention:**
- Use the `scrollend` event (supported in modern Chrome/Firefox) instead of `scroll` to detect the final snap position.
- Fallback to `IntersectionObserver` on each section — mark a section as active when >50% is in the viewport.
- `scrollend` is the correct modern primitive; MDN documents it as supported in Chrome 114+ and Firefox 109+.

**Phase:** Phase 1 (scroll navigation).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Globe texture loading | CORS block (CDN) | Set `crossOrigin = 'anonymous'` on loader |
| Globe texture loading | Procedural noise instead of real image | Use confirmed unpkg/jsdelivr Blue Marble URL |
| Globe atmosphere | Wrong accent color (green glow) | Hardcode `0x60a5fa` for emissive value |
| Globe renderer setup | Uncapped pixel ratio on mobile | `Math.min(window.devicePixelRatio, 2)` |
| Animation loop | Runs off-screen, drains battery | IntersectionObserver pause/resume |
| Scene lifecycle | Memory leak from no dispose() | Call dispose on geometry, material, texture |
| Star field | Canvas scoped to hero only | `position: fixed` on body, `z-index: -1` |
| Global CSS | Font below 16px minimum | Set `html { font-size: 16px }` in reset |
| Global CSS | 100vh cut off by mobile address bar | Use `min-height: 100svh` on sections |
| Global CSS | Wrong accent color leaking in | Use `--accent: #60a5fa` custom property |
| About section | Portrait 404 | Use `/assets/portrait.jpg` from `public/` |
| Scroll-snap | iOS Safari stuck/flick-to-end bug | Apply snap to wrapper div, not html/body |
| Scroll-snap | Active dot out of sync | Use `scrollend` event + IntersectionObserver |
| Deployment | Blank page on GitHub Pages | Confirm `base: '/'` in vite.config.js |

---

## Sources

- Three.js Tips and Tricks (discoverthreejs.com): https://discoverthreejs.com/tips-and-tricks/
- Three.js Performance (Codrops, 2025): https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/
- Three.js 100 Tips (utsubo.com, 2026): https://www.utsubo.com/blog/threejs-best-practices-100-tips
- Three.js Mobile Performance (CoderLegion): https://coderlegion.com/4191/performance-of-three-mobile-devices-and-lower-end-hardware-for-games-and-creative-resumes
- Three.js Memory Leak Prevention (MindfulChase): https://www.mindfulchase.com/explore/troubleshooting-tips/frameworks-and-libraries/fixing-performance-drops-and-memory-leaks-in-three-js-applications.html
- setPixelRatio mobile performance (Three.js forum): https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelration/4963
- TextureLoader CORS (Three.js forum): https://discourse.threejs.org/t/textureloader-cors-problem-when-texture-has-external-link/57163
- three-globe Blue Marble texture URL (unpkg): https://unpkg.com/browse/three-globe@2.18.3/
- CSS scroll-snap challenges (Adrian Roselli): https://adrianroselli.com/2021/07/scroll-snap-challenges.html
- iOS Safari scroll-snap flick bug: https://github.com/bvaughn/react-window/issues/290
- 100vh mobile address bar (codegenes.net): https://www.codegenes.net/blog/css-100vh-is-too-tall-on-mobile-due-to-browser-ui/
- 100dvh with scroll-snap warning: https://www.codegenes.net/blog/100vh-height-when-address-bar-is-shown-chrome-mobile/
- Vite GitHub Pages deployment (official): https://vite.dev/guide/static-deploy
- scrollend event (MDN): https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap
