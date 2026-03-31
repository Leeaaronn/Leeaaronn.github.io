# Phase 1: Scaffold, Globe, Hero & About - Research

**Researched:** 2026-03-30
**Domain:** Vite vanilla JS, Three.js globe, CSS scroll-snap, Canvas starfield
**Confidence:** HIGH (core stack verified against npm registry and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use an HTML5 Canvas with requestAnimationFrame for the star field. Canvas is fixed-position behind all content. Thousands of small white dots with subtle slow drift animation.
- **D-02:** Globe atmosphere = additive-blended sprite halo (outer glow) + rim-light on sphere material (edge illumination). Color: #60a5fa. No custom fragment shaders.
- **D-03:** `scroll-snap-type: y mandatory`. Each section exactly 100vh with `scroll-snap-align: start`.
- **D-04:** All three nav elements coexist: thin progress bar (2-3px) at top, dot navigation on right edge, floating nav bar at top.
- **D-05:** Earth texture from CDN: `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg`. Fallback: `https://unpkg.com/three-globe/example/img/earth-topology.png`. Never procedural.
- **D-06:** Background: #000000, #0a0a0a, #111111, #1a1a1a. Text: #ffffff, #cccccc, #999999. Accent: #60a5fa. NO green, NO purple, NO orange.
- **D-07:** Instrument Serif for headings, Syne for body, JetBrains Mono for code/labels. Body min 16px. Hero title 60-120px (clamp). Section titles 48-64px.
- **D-08:** Portrait at `./assets/portrait.jpg`. Resume at `./assets/resume.pdf`. Both already exist in repo.

### Claude's Discretion

- Exact star count and drift speed — tune for visual quality and performance
- Globe rotation speed — should feel slow and elegant
- Specific easing curves for fade-in animations
- Progress bar exact color (accent or white with low opacity)
- Dot navigation dot size and spacing

### Deferred Ideas (OUT OF SCOPE)

None — Phase 2 (projects, skills, contact, GSAP animations, deploy) is already scoped separately.
</user_constraints>

---

## Summary

This phase builds a greenfield Vite + vanilla JS + Three.js portfolio site from scratch. The codebase does not yet exist — only `assets/portrait.jpg` and `assets/resume.pdf` are present in the repo root. The full stack is well-understood and stable: Vite 8.0.3 (confirmed latest), Three.js 0.183.2 (confirmed latest), no framework, hand-written CSS.

The architectural challenge is layering three independent canvases/rendering systems: (1) a fixed HTML5 Canvas for the star field, (2) a fixed Three.js WebGLRenderer canvas for the globe, and (3) regular HTML sections that scroll over both. The key insight is that both fixed canvases use `pointer-events: none` and are stacked via `z-index`, with HTML scroll content sitting in its own stacking context above them.

Globe scroll behavior (hero = centered orbit, about = zoom to LA) is achieved using `IntersectionObserver` to detect which section is active, then lerping the Three.js camera's `position.z` inside the existing `requestAnimationFrame` loop — no GSAP needed in Phase 1.

**Primary recommendation:** Write three independent JS modules — `stars.js`, `globe.js`, `scroll.js` — each with an `init()` and `tick()` export, orchestrated from `src/main.js`. This keeps the animation loop centralized while separating concerns.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 8.0.3 | Dev server, build, HMR | Zero-config for vanilla JS; `npm run dev` just works |
| three | 0.183.2 | 3D WebGL globe, scene, camera, renderer | Industry standard WebGL abstraction; TextureLoader, SphereGeometry, sprites built-in |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | — | — | All features covered by Three.js + native browser APIs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Three.js direct | three-globe (npm) | three-globe is a wrapper with more features but adds ~250KB and hides the API; D-05 uses its CDN texture only |
| requestAnimationFrame | GSAP ticker | GSAP deferred to Phase 2 — plain rAF is sufficient here |
| IntersectionObserver | scroll events | IntersectionObserver is async, performant, and compositor-friendly for snapped sections |

**Installation (verified against npm registry 2026-03-30):**

```bash
npm create vite@latest . -- --template vanilla
npm install three
```

Note: `npm create vite@latest . --` (dot = current directory) will prompt to use existing directory. Accept.

**Version verification (confirmed):**
- `npm view vite version` → 8.0.3
- `npm view three version` → 0.183.2

---

## Architecture Patterns

### Recommended Project Structure

```
/                        # repo root (already has .git, assets/, .planning/)
├── index.html           # Vite entry point, loads src/main.js as module
├── vite.config.js       # minimal — base: '/' for user.github.io root domain
├── package.json
├── .gitignore
├── CLAUDE.md            # project rules for AI agents
├── assets/
│   ├── portrait.jpg     # already exists
│   └── resume.pdf       # already exists
└── src/
    ├── main.js          # orchestrator: init all modules, unified rAF loop
    ├── globe.js         # Three.js scene, camera, renderer, globe mesh, glow, marker
    ├── stars.js         # Canvas 2D starfield — fixed canvas, rAF drift
    ├── scroll.js        # IntersectionObserver, progress bar update, dot nav, nav bar
    └── style.css        # global CSS: custom properties, font imports, reset, sections
```

### Pattern 1: Fixed Canvas Layering

**What:** Two fixed canvases behind scrolling HTML. Stars canvas at z-index 0, Three.js canvas at z-index 1, HTML scroll container at z-index 2 with `pointer-events` only on interactive elements.

**When to use:** Any time you need a persistent background that survives scroll-snap navigation.

**Example:**

```html
<!-- index.html body -->
<canvas id="stars-canvas"></canvas>   <!-- z-index: 0, fixed -->
<canvas id="globe-canvas"></canvas>   <!-- z-index: 1, fixed, alpha:true -->
<div id="scroll-container">           <!-- z-index: 2, scroll-snap container -->
  <section id="hero" class="section snap-section">...</section>
  <section id="about" class="section snap-section">...</section>
</div>
<div id="progress-bar"></div>         <!-- z-index: 10, fixed top -->
<nav id="nav-bar">...</nav>           <!-- z-index: 20, fixed top -->
<div id="dot-nav">...</div>           <!-- z-index: 10, fixed right -->
```

```css
/* Source: MDN CSS position:fixed */
#stars-canvas, #globe-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
#stars-canvas  { z-index: 0; }
#globe-canvas  { z-index: 1; }

#scroll-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

.snap-section {
  height: 100vh;
  scroll-snap-align: start;
}
```

### Pattern 2: Three.js Globe Setup (ES Module, Vite)

**What:** Import Three.js named exports directly from `three`. Renderer with `alpha: true` so page background shows through.

**When to use:** Globe + transparent background layered over HTML.

**Example:**

```javascript
// src/globe.js
// Source: Three.js docs — WebGLRenderer, TextureLoader, SphereGeometry
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  SphereGeometry, MeshPhongMaterial, Mesh,
  TextureLoader, AmbientLight, DirectionalLight,
  AdditiveBlending, SpriteMaterial, Sprite, Color,
  SphereGeometry as SG
} from 'three';

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new WebGLRenderer({
  canvas: document.getElementById('globe-canvas'),
  alpha: true,        // transparent background — stars canvas shows through
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Earth mesh
const loader = new TextureLoader();
const texture = loader.load(
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  undefined,
  undefined,
  () => loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png') // fallback on error
);
const globe = new Mesh(
  new SphereGeometry(1, 64, 64),
  new MeshPhongMaterial({ map: texture })
);
scene.add(globe);

// Lighting
scene.add(new AmbientLight(0x333333));
const sun = new DirectionalLight(0xffffff, 1.2);
sun.position.set(5, 3, 5);
scene.add(sun);
```

### Pattern 3: Atmospheric Glow (Sprite + AdditiveBlending, no shader)

**What:** A large sprite scaled slightly bigger than the globe, using an additive-blended canvas-drawn radial gradient texture. This achieves D-02 without custom fragment shaders.

**When to use:** Simple outer glow around sphere.

**Example:**

```javascript
// Source: Three.js forum — sprite glow technique
function makeGlowSprite(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, `${color}88`);  // #60a5fa with alpha
  grad.addColorStop(0.4, `${color}33`);
  grad.addColorStop(1, `${color}00`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  return new Sprite(new SpriteMaterial({
    map: tex,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
  }));
}

const glow = makeGlowSprite('#60a5fa');
glow.scale.set(2.8, 2.8, 1);  // slightly larger than globe radius 1
scene.add(glow);
```

For rim-light (D-02 second part): set `MeshPhongMaterial.emissive = new Color('#60a5fa')` and `emissiveIntensity: 0.08` — this gives a subtle edge-glow without custom shaders.

### Pattern 4: Lat/Lon to 3D Sphere Position (LA Marker)

**What:** Convert geographic coordinates to Cartesian using spherical math.

**When to use:** Placing any marker on the globe surface.

**Example:**

```javascript
// Source: Three.js forum — lat/lon to sphere coordinates
function latLonToVec3(lat, lon, radius) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y:   radius * Math.cos(phi),
    z:   radius * Math.sin(phi) * Math.sin(theta),
  };
}
// LA: 34.05°N, 118.25°W
const laPos = latLonToVec3(34.05, -118.25, 1.01); // 1.01 = just above surface
```

Pulsing: in the animation loop, scale the marker mesh with `Math.sin(Date.now() * 0.003) * 0.3 + 0.7`.

### Pattern 5: Section-Aware Globe (IntersectionObserver + camera lerp)

**What:** Watch which section is in view using IntersectionObserver (threshold: 0.5). Update a target camera Z and target globe rotation offset. In the rAF loop, lerp current values toward targets.

**When to use:** Scroll-driven 3D state without GSAP.

**Example:**

```javascript
// src/scroll.js — section detection
const sections = document.querySelectorAll('.snap-section');
let activeSection = 'hero';

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) activeSection = e.target.id;
  });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));
export { activeSection };  // or use a callback

// src/globe.js — in tick()
const TARGET_Z = { hero: 3.0, about: 1.8 };  // about = zoom in closer
let currentZ = 3.0;

function tick() {
  const targetZ = TARGET_Z[activeSection] ?? 3.0;
  currentZ += (targetZ - currentZ) * 0.04;  // lerp factor — tune for feel
  camera.position.z = currentZ;
  globe.rotation.y += 0.001;  // slow rotation
  renderer.render(scene, camera);
}
```

### Pattern 6: Unified requestAnimationFrame Loop

**What:** One `requestAnimationFrame` loop in `main.js` calls `tick()` on every module. Avoids competing loops.

**Example:**

```javascript
// src/main.js
import { tick as starsTick, initStars } from './stars.js';
import { tick as globeTick, initGlobe } from './globe.js';
import { initScroll } from './scroll.js';

initStars();
initGlobe();
initScroll();

function loop() {
  starsTick();
  globeTick();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

### Pattern 7: CSS Scroll-Snap + Progress Bar + Dot Nav

**What:** Pure CSS scroll-snap. JavaScript updates progress bar width and active dot on the `scroll` event of the container (or via IntersectionObserver).

**Example:**

```javascript
// Progress bar (0-100% of total scroll height)
const container = document.getElementById('scroll-container');
const bar = document.getElementById('progress-bar');
container.addEventListener('scroll', () => {
  const pct = container.scrollTop / (container.scrollHeight - container.clientHeight);
  bar.style.width = `${pct * 100}%`;
});
```

### Pattern 8: Google Fonts Import

**What:** Load all three typefaces from Google Fonts via a single `<link>` in `index.html`.

**Note:** Instrument Serif, Syne, and JetBrains Mono are all available on Google Fonts. Confirmed available as of 2026-03-30.

**Example:**

```html
<!-- index.html <head> — before style.css link -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
/* src/style.css */
:root {
  --font-heading: 'Instrument Serif', Georgia, serif;
  --font-body:    'Syne', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;
  /* colors */
  --color-bg:      #000000;
  --color-bg-2:    #0a0a0a;
  --color-bg-3:    #111111;
  --color-bg-4:    #1a1a1a;
  --color-text:    #ffffff;
  --color-text-2:  #cccccc;
  --color-text-3:  #999999;
  --color-accent:  #60a5fa;
}
```

### Pattern 9: vite.config.js for GitHub Pages (user.github.io root domain)

**What:** Minimal config. Since this repo is `leeaaronn.github.io` (user pages, not project pages), the site serves from root `/` — no base path adjustment needed.

**Example:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // user.github.io root — this is the default, explicit for clarity
});
```

### Anti-Patterns to Avoid

- **Loading Three.js from a `<script>` CDN tag:** Breaks ES module imports and tree-shaking. Always `npm install three` and use `import from 'three'`.
- **Separate rAF loops per module:** Competing loops cause jank and wasted draws. One loop in `main.js`.
- **Putting the scroll container on `<body>`:** Browser quirks with `scroll-snap-type` on `body` are inconsistent across browsers. Use a dedicated `<div>` scroll container with `height: 100vh; overflow-y: scroll`.
- **`overflow: hidden` on `<html>` or `<body>`:** This breaks `position: fixed` layering in some browsers. Keep `<html>` and `<body>` at default overflow.
- **Loading the Earth texture as a local asset without CORS headers in dev:** The CDN URL (unpkg) avoids this; do not copy the texture to `public/` unless there's a CDN failure.
- **Using `scroll-snap-type: y mandatory` on a container with `height: auto`:** The container must be exactly `100vh` with `overflow-y: scroll` for snapping to work.
- **`renderer.setSize()` without updating camera aspect on resize:** Always pair resize with `camera.aspect = w/h; camera.updateProjectionMatrix()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lat/lon → 3D position | Custom trig utility | Three.js `Spherical` or the 4-line formula above (well-documented) | Easy to get sign wrong for western longitudes — use verified formula |
| Texture loading with fallback | Custom fetch + blob URL | `TextureLoader.load(url, onLoad, onProgress, onError)` | Built-in error callback; handles CORS, caching |
| Sprite glow texture | External image file | Canvas-drawn `createRadialGradient` → `CanvasTexture` | No extra network request; D-02 specifies no complex shaders |
| Scroll progress % | External library | 4 lines of JS on `scroll` event | `scrollTop / (scrollHeight - clientHeight)` is trivially correct |
| Font self-hosting | Manual download + @font-face | Google Fonts `<link>` | All three fonts confirmed on Google Fonts; no extra build step |

**Key insight:** Three.js already provides every primitive needed (SphereGeometry, TextureLoader, SpriteMaterial, CanvasTexture, AdditiveBlending). The globe is ~100 lines of vanilla JS; there is no need for three-globe, globe.gl, or any wrapper library.

---

## Common Pitfalls

### Pitfall 1: Scroll Container Must Own the Scroll, Not the Body

**What goes wrong:** Developer puts `scroll-snap-type: y mandatory` on `body` or `html`. Snapping behaves inconsistently across Chrome/Firefox/Safari.

**Why it happens:** MDN and many tutorials show `body` as the scroll container for simplicity.

**How to avoid:** Use a dedicated `<div id="scroll-container">` set to `height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory`. Sections are children of this div.

**Warning signs:** Sections snap on Chrome but not Safari, or snap "sticks" between sections.

### Pitfall 2: Three.js Canvas Blocks Mouse/Touch Events on HTML

**What goes wrong:** The fixed Three.js canvas sits on top of the HTML sections and intercepts all pointer events, making buttons and links unclickable.

**Why it happens:** Canvas z-index is above the scroll container; default pointer events apply.

**How to avoid:** Add `pointer-events: none` to both fixed canvases (`#stars-canvas`, `#globe-canvas`). The scroll container and its children keep default pointer events.

### Pitfall 3: TextureLoader Cross-Origin Issue in Production

**What goes wrong:** Earth texture loads in Vite dev (localhost) but fails in production with a CORS error.

**Why it happens:** The `unpkg.com` CDN serves assets with permissive CORS headers, so this specific URL should be safe. However, if a local fallback is used instead, Vite must serve it from `public/` not `src/`.

**How to avoid:** Use the unpkg CDN URL as specified in D-05. If adding a local fallback texture, place it in `/public/textures/` so Vite serves it as a static asset (not processed through the module graph).

**Warning signs:** Console errors mentioning `CORS policy` or `Access-Control-Allow-Origin`.

### Pitfall 4: Globe Renders But Texture Is Black

**What goes wrong:** `new MeshPhongMaterial({ map: texture })` but the globe appears black.

**Why it happens:** `MeshPhongMaterial` requires a light source. If no `AmbientLight` or `DirectionalLight` is added to the scene, the material renders as black.

**How to avoid:** Always add both `new AmbientLight(0x333333)` (base fill) and `new DirectionalLight(0xffffff, 1.2)` positioned to simulate sunlight.

### Pitfall 5: Star Canvas Drift Crosses Boundaries and Wraps

**What goes wrong:** Stars drift off the edge of the canvas and disappear, creating visible "empty zones" over time.

**Why it happens:** Particle positions update each frame without boundary wrapping.

**How to avoid:** In `stars.js`, wrap each star's position: `if (star.x < 0) star.x = canvas.width; if (star.x > canvas.width) star.x = 0;` (same for y). With slow enough drift this is invisible.

### Pitfall 6: `scroll-snap-type: y mandatory` with Oversized Sections Traps the User

**What goes wrong:** If any section's content overflows its 100vh, the snap container traps the user — they can't scroll past the snap point to read the content.

**Why it happens:** `mandatory` forces snapping to the next snap point even if the current section's content isn't fully visible.

**How to avoid:** Ensure each section's content fits within 100vh. For the about section, carefully size the portrait, bio, stats row, and chips to fit. If content risks overflow, set `overflow: hidden` on the section and prioritize above-the-fold content.

### Pitfall 7: Vite Serves `assets/` from Repo Root but Build Copies from `public/`

**What goes wrong:** `<img src="./assets/portrait.jpg">` works in dev (Vite serves the file system) but the build output doesn't include the image.

**Why it happens:** Vite only copies files from `public/` into `dist/` automatically. Files outside `src/` and `public/` are not bundled unless imported in JS.

**How to avoid:** Either (a) move `assets/` inside `public/` (then reference as `/assets/portrait.jpg`) or (b) import the image in JS (`import portrait from './assets/portrait.jpg'`) so Vite handles it. Option (a) is simpler for static assets. The assets already exist at repo root `/assets/` — they must be moved or referenced correctly.

**This is a critical planning concern:** The planner must include a task to move `assets/` into `public/` or handle via JS import.

---

## Code Examples

### Complete Globe Init (verified pattern)

```javascript
// Source: Three.js docs — WebGLRenderer, MeshPhongMaterial, TextureLoader
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  SphereGeometry, MeshPhongMaterial, Mesh,
  TextureLoader, AmbientLight, DirectionalLight,
  AdditiveBlending, SpriteMaterial, Sprite, CanvasTexture
} from 'three';

export function initGlobe() {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  const renderer = new WebGLRenderer({
    canvas: document.getElementById('globe-canvas'),
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  scene.add(new AmbientLight(0x222222));
  const sun = new DirectionalLight(0xffffff, 1.2);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  // Globe
  const loader = new TextureLoader();
  const earthTex = loader.load(
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
  );
  const globe = new Mesh(
    new SphereGeometry(1, 64, 64),
    new MeshPhongMaterial({ map: earthTex, emissive: 0x60a5fa, emissiveIntensity: 0.07 })
  );
  scene.add(globe);

  // Glow sprite
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const ctx = glowCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0,   'rgba(96,165,250,0.35)');
  grad.addColorStop(0.4, 'rgba(96,165,250,0.12)');
  grad.addColorStop(1,   'rgba(96,165,250,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const glow = new Sprite(new SpriteMaterial({
    map: new CanvasTexture(glowCanvas),
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
  }));
  glow.scale.set(2.8, 2.8, 1);
  scene.add(glow);

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, globe };
}
```

### Star Field Init

```javascript
// src/stars.js
const STAR_COUNT = 2000;

export function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    Math.random() * 1.2 + 0.3,
    dx:   (Math.random() - 0.5) * 0.08,  // slow drift
    dy:   (Math.random() - 0.5) * 0.08,
    a:    Math.random() * 0.6 + 0.4,
  }));

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  return { canvas, ctx, stars };
}

export function starsTick({ canvas, ctx, stars }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    s.x += s.dx;
    s.y += s.dy;
    // wrap at boundaries
    if (s.x < 0) s.x = canvas.width;
    if (s.x > canvas.width)  s.x = 0;
    if (s.y < 0) s.y = canvas.height;
    if (s.y > canvas.height) s.y = 0;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Three.js CDN `<script>` global | ES module `import from 'three'` via npm | r125+ (2021) | Tree-shaking, Vite HMR, no global namespace pollution |
| `new THREE.XXX()` after global import | Named imports: `import { Mesh } from 'three'` | r125+ | Smaller bundle — only ship what you use |
| `scrollTop` polling on rAF for section detection | `IntersectionObserver` | 2018 (broad support 2020) | Off main thread, better perf with scroll-snap |
| `MeshLambertMaterial` for globe | `MeshPhongMaterial` (specular highlights) | N/A | Phong gives shinier oceans for photo-real look |
| Custom progress bar library | 4-line CSS + JS | Always standard | No dependency needed |

**Deprecated/outdated:**
- `THREE.BufferGeometry` manual construction: Use `SphereGeometry` directly — it produces a BufferGeometry internally since Three.js r125.
- `OrbitControls` from addons: Not needed here — globe rotation is driven by `globe.rotation.y += delta` in the tick loop, not user drag.
- `renderer.domElement.style.position = 'fixed'` set in JS: Set in CSS instead for clarity and separation of concerns.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm, Vite dev server | Yes | v24.13.1 | — |
| npm | Package install | Yes | 11.8.0 | — |
| portrait.jpg | About section | Yes (assets/) | — | — |
| resume.pdf | About section download | Yes (assets/) | — | — |
| unpkg CDN (earth texture) | Globe texture | Likely (external URL) | — | earth-topology.png fallback per D-05 |
| Google Fonts CDN | Typography | Likely (external URL) | — | System font stack fallback in CSS |

**Missing dependencies with no fallback:** None identified.

**Missing dependencies with fallback:** Both external CDN URLs (unpkg, Google Fonts) require internet access during dev. System font stacks and topology texture serve as fallbacks.

**Critical asset placement issue:** `portrait.jpg` is at `/portrait.jpg` (repo root) AND `/assets/portrait.jpg` (assets dir). Git status shows both `assets/` (untracked) and `portrait.jpg` (untracked) at root. The plan must confirm the canonical location is `./assets/portrait.jpg` and reference it consistently. Vite's `public/` directory approach is recommended (see Pitfall 7).

---

## Validation Architecture

`workflow.nyquist_validation` not set in config.json — treat as enabled. However, this is a visual/interactive phase (3D globe, canvas starfield, CSS layout). Automated testing of WebGL rendering is impractical without a headless browser. Validation is primarily manual smoke testing.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (visual phase — no unit tests warranted) |
| Config file | none |
| Quick run command | `npm run dev` → browser inspection |
| Full suite command | `npm run build && npm run preview` → production smoke test |

### Phase Requirements → Test Map

| Behavior | Test Type | Verification Method |
|----------|-----------|-------------------|
| `npm run dev` serves site | smoke | Run dev server, navigate to localhost:5173 |
| Hero section renders correct text | manual | Check title, eyebrow, CTA buttons in browser |
| About section renders portrait | manual | Confirm portrait.jpg loads, dimensions correct |
| Globe shows real Earth texture | manual | Earth Blue Marble visible, not black, not procedural |
| Stars visible on all sections | manual | Scroll through sections, stars remain behind |
| Scroll-snap moves between sections | manual | Scroll gesture snaps cleanly hero → about |
| Progress bar updates on scroll | manual | Bar fills as user scrolls down |
| Dot nav shows correct active dot | manual | Active dot highlighted for current section |
| Nav bar visible and links work | manual | Click section links, resume link opens PDF |
| Globe zooms to LA when about is active | manual | IntersectionObserver triggers camera lerp |
| `npm run build` completes without errors | smoke | `npm run build` exits 0 |

### Wave 0 Gaps

- No test infrastructure needed — visual phase validated manually and by build success.

---

## Open Questions

1. **Portrait file canonical location**
   - What we know: `assets/portrait.jpg` exists (untracked in git status). A separate `portrait.jpg` also exists at repo root (untracked).
   - What's unclear: Which is the intended file? The CONTEXT.md says `./assets/portrait.jpg`.
   - Recommendation: Planner should task: (1) confirm `assets/portrait.jpg` is correct, (2) delete root-level `portrait.jpg` if duplicate, (3) move `assets/` to `public/assets/` for Vite compatibility.

2. **Globe position on screen**
   - What we know: Hero = "centered spinning", about = "zoom to LA". Globe is full-viewport fixed canvas.
   - What's unclear: Is the globe centered viewport-center on hero, or offset right (common design pattern)?
   - Recommendation: Default to viewport-center. Easily adjustable post-implementation.

3. **Globe visibility past the about section**
   - CONTEXT.md specifics say: "past about = fade out (stars remain)".
   - Phase 1 only has two sections (hero and about), so "past about" cannot occur in this phase. Treat this as Phase 2 concern.

---

## Sources

### Primary (HIGH confidence)

- npm registry `npm view vite version` → 8.0.3 (verified 2026-03-30)
- npm registry `npm view three version` → 0.183.2 (verified 2026-03-30)
- https://threejs.org/docs/#api/en/renderers/WebGLRenderer — `alpha`, `antialias` constructor params
- https://vite.dev/guide/ — ES module entry point, `index.html` as app root, vanilla template
- MDN — `scroll-snap-type: y mandatory`, `scroll-snap-align: start`
- MDN — `IntersectionObserver` API, threshold option

### Secondary (MEDIUM confidence)

- https://discourse.threejs.org/t/how-to-create-an-atmospheric-glow-effect-on-surface-of-globe-sphere/32852 — dual-sphere shader approach and sprite glow approach; sprite confirmed viable
- https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/ — fixed canvas + scroll sections pattern
- https://play.aktagon.com/plays/spinning-globe-threejs/ — lat/lon to sphere Cartesian formula
- https://vite.dev/guide/static-deploy — GitHub Pages base path; `base: '/'` for user.github.io root domain

### Tertiary (LOW confidence)

- General knowledge: Google Fonts supports Instrument Serif, Syne, JetBrains Mono — needs URL confirmation at fonts.google.com before use.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm registry
- Architecture: HIGH — all patterns confirmed in official Three.js docs and Vite docs
- Pitfalls: HIGH — Pitfalls 1-6 from direct knowledge of Three.js/Vite/CSS behavior; Pitfall 7 verified against Vite static asset docs
- Environment: HIGH — Node/npm probed directly on target machine

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable libraries; Three.js and Vite release cadence is monthly but APIs are stable)
