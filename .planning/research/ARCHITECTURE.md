# Architecture Patterns

**Project:** Aaron Lee Portfolio — Vite + Vanilla JS + Three.js
**Researched:** 2026-03-31
**Confidence:** HIGH (patterns confirmed by Three.js official docs, community canonical examples, MDN)

---

## System Overview

The site is a layered canvas + DOM architecture. Three visual layers stack via CSS z-index. A single shared requestAnimationFrame loop drives everything. Scroll state is the sole source of truth that flows from `scroll.js` outward to `globe.js`.

```
z-index: 3  [ Floating Nav Bar ]  ← DOM, fixed, above everything
z-index: 2  [ Scroll Sections  ]  ← DOM, scroll-snap container, HTML content
z-index: 1  [ Globe Canvas     ]  ← Three.js WebGLRenderer, position: fixed
z-index: 0  [ Stars Canvas     ]  ← 2D Canvas or Three.js Points, position: fixed
```

The star field and globe canvases are `position: fixed; top: 0; left: 0; width: 100%; height: 100vh; pointer-events: none`. They never scroll. The HTML sections scroll over them via a scroll-snap container that sits above.

---

## Recommended Architecture: Single Three.js Scene

**Verdict:** Put stars AND globe in ONE Three.js scene on ONE canvas.

**Why not two canvases:** Two WebGLRenderer instances is expensive — each creates its own WebGL context. Context limits exist per browser tab (~8-16 contexts). One scene with stars as a `THREE.Points` object and the globe as a mesh is both simpler and performant.

**Why not a 2D canvas for stars:** Using a separate `<canvas>` 2D context for stars forces synchronizing two separate animation loops. One Three.js scene handles both with a single RAF.

**Single scene architecture:**
- Stars: `THREE.Points` with `BufferGeometry` — thousands of vertices, single draw call
- Globe: `THREE.Mesh` with `SphereGeometry` + `MeshPhongMaterial` + texture
- Atmosphere: `THREE.Mesh` slightly larger sphere, transparent shader or `MeshBasicMaterial` with low opacity
- LA Marker: `THREE.Mesh` small sphere or ring at lat/lon coordinates on globe surface

---

## Component Boundaries

| Module | File | Owns | Depends On | Exposes |
|--------|------|------|-----------|---------|
| Entry | `main.js` | Initialization order, RAF loop | All modules | Nothing (side effects only) |
| Globe | `globe.js` | Three.js scene, renderer, camera, globe mesh, atmosphere, LA marker | Three.js | `initGlobe()`, `updateGlobe(scrollState)`, `resizeGlobe()` |
| Stars | `stars.js` | `THREE.Points` geometry, star drift animation | Three.js scene ref from globe | `initStars(scene)`, `updateStars(elapsed)` |
| Scroll | `scroll.js` | Scroll container events, section detection, progress bar, dot nav | DOM | `initScroll()`, `getScrollState()` → `{ sectionIndex, progress }` |
| Styles | `style.css` | All visual styles, CSS custom properties, layout | Nothing | Nothing |

### Why this boundary:
- `globe.js` owns the renderer — it creates `WebGLRenderer`, the scene, and camera. Stars get added to the same scene, so they receive the scene reference.
- `scroll.js` owns no Three.js knowledge — it only produces a plain `{ sectionIndex: number, progress: number }` object.
- `main.js` wires everything: creates scroll state, passes it to globe on each RAF tick.

---

## Data Flow

```
User scrolls
      |
      v
scroll container 'scroll' event listener (scroll.js)
      |
      v
scrollState = { sectionIndex: 0-7, progress: 0.0-1.0 }
      |
      +--> progress bar width update (DOM write)
      +--> dot nav active state update (DOM write)
      +--> section class toggle (DOM write, triggers CSS fade-up)
      |
      v  (read each RAF frame)
main.js RAF tick
      |
      v
updateGlobe(scrollState)  ← globe.js reads sectionIndex + progress
      |
      +--> sectionIndex === 0 (hero):    globe centered, full size, slow rotation
      +--> sectionIndex === 1 (about):   globe lerps right, camera zooms to LA
      +--> sectionIndex > 1:             globe opacity lerps to 0 (stars remain)
      |
      v
renderer.render(scene, camera)  ← renders stars + globe in one call
```

### Key principle: scroll.js never touches Three.js. globe.js never touches the DOM.

`main.js` is the integration point only — it calls `getScrollState()` and passes the result to `updateGlobe()`. No cross-module direct calls.

---

## Initialization Order (Critical)

Order matters because: DOM must exist before querying elements, Three.js scene must exist before adding objects to it, scroll container must be found before attaching listeners.

```
1. index.html parsed → DOMContentLoaded fires
2. main.js (type="module") executes:
   a. initGlobe()        ← creates renderer, scene, camera, globe mesh, atmosphere, LA marker
                           appends canvas to document.body (z-index: 1)
   b. initStars(scene)   ← receives scene reference, creates Points object, adds to scene
                           (no separate canvas — uses same Three.js scene)
   c. initScroll()       ← queries DOM for scroll container, sections, nav dots, progress bar
                           attaches scroll event listener, sets initial active state
   d. startRAF()         ← starts requestAnimationFrame loop
3. RAF loop (every frame):
   a. const state = getScrollState()        ← read current scroll position
   b. updateGlobe(state)                    ← lerp globe position/opacity/rotation
   c. updateStars(clock.getElapsedTime())   ← drift animation
   d. renderer.render(scene, camera)        ← single draw call
```

**Why `initGlobe` before `initStars`:** Stars need a reference to the scene object that globe.js creates. Passing the scene out avoids a shared global.

**Why scroll last before RAF:** Scroll needs the DOM to be settled. If init runs before sections render, `querySelectorAll('.section')` returns the right count.

**Texture loading is async — handle it:** The NASA Blue Marble texture loads over HTTP. Use `THREE.TextureLoader` with a callback or promise. The globe mesh should be created immediately with a placeholder dark material, then the texture swapped in when loaded. This prevents a frame where the globe is invisible.

```javascript
// globe.js pattern
const loader = new THREE.TextureLoader();
const material = new THREE.MeshPhongMaterial({ color: 0x1a3a6e }); // placeholder
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

loader.load(TEXTURE_URL, (texture) => {
  material.map = texture;
  material.needsUpdate = true;
});
```

---

## Canvas Layering: CSS Rules

```css
/* Stars + Globe canvas (Three.js renderer output) */
canvas#globe-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
  pointer-events: none;  /* critical: lets DOM elements receive clicks */
}

/* Scroll container — sits above canvas */
.scroll-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

/* Nav — above everything */
.nav {
  position: fixed;
  z-index: 3;
}
```

**`pointer-events: none` on the canvas is mandatory.** Without it, the canvas intercepts all mouse/touch events and the scroll container becomes unscrollable on mobile. The user cannot click nav links.

---

## Globe Behavior by Section

The globe's transform targets are set as lerp destinations. The RAF loop eases toward them each frame using `THREE.MathUtils.lerp` or manual `value += (target - value) * 0.05`.

| Section Index | Section | Globe Position | Globe Scale | Globe Opacity | Camera |
|--------------|---------|---------------|------------|--------------|--------|
| 0 | Hero | Center (x:0) | 1.0 | 1.0 | Default distance |
| 1 | About | Right (x:+2.5) | 0.9 | 1.0 | Slightly closer, LA visible |
| 2+ | Projects/Skills/Contact | Right (x:+2.5) | 0.9 | 0.0 | Same |

**Lerp easing constant:** 0.05 per frame at 60fps gives ~0.95 damping — smooth but responsive. At lower frame rates it moves faster (not using deltaTime for lerp is acceptable here; visual drift is negligible for this use case).

**Globe rotation:** Continuous slow Y-axis rotation (`globe.rotation.y += 0.002` per frame). This is independent of scroll.

**LA marker pulse:** Scale the marker mesh using `Math.sin(elapsed * 2) * 0.1 + 1.0` in `updateGlobe`. The `elapsed` value comes from `THREE.Clock.getElapsedTime()` passed from the RAF loop.

---

## Scroll System Architecture

The scroll container is the scroll root — not `window`. This is required for `scroll-snap-type` to work correctly.

```
<div class="scroll-container">   ← overflow-y: scroll; scroll-snap-type: y mandatory
  <section class="section" data-index="0">  ← scroll-snap-align: start
  <section class="section" data-index="1">
  ... 8 sections total
</div>
```

**Section index from scrollTop:**
```javascript
// scroll.js — called in 'scroll' event handler
function getScrollState() {
  const scrollTop = container.scrollTop;
  const sectionHeight = window.innerHeight; // each section is 100vh
  const sectionIndex = Math.round(scrollTop / sectionHeight);
  const progress = scrollTop / (sectionHeight * (SECTION_COUNT - 1));
  return { sectionIndex, progress };
}
```

`Math.round` not `Math.floor` — with scroll-snap, the container will always land near a section boundary, so rounding is accurate and avoids off-by-one during the snap animation.

**IntersectionObserver for section animations:** Use IntersectionObserver on each `.section` with threshold 0.4 to add `.is-visible` class. CSS transitions trigger on `.section.is-visible`. This is separate from the scroll state used for globe control — they serve different purposes.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));
```

---

## Patterns to Follow

### Pattern: Module returns init + update functions, never auto-executes

```javascript
// globe.js
export function initGlobe() { /* setup */ return { scene, renderer }; }
export function updateGlobe(scrollState) { /* lerp per frame */ }
export function resizeGlobe() { /* handle window resize */ }
```

`main.js` calls init once, calls update every frame. Modules do not call `requestAnimationFrame` themselves.

### Pattern: Single RAF in main.js

```javascript
// main.js
const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);
  const elapsed = clock.getElapsedTime();
  const state = getScrollState();
  updateGlobe(state, elapsed);
  updateStars(elapsed);
  renderer.render(scene, camera);
}

tick(); // start loop
```

One loop, one render call. All update functions are synchronous.

### Pattern: ResizeObserver for canvas dimensions

```javascript
// globe.js
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
```

`setPixelRatio(Math.min(devicePixelRatio, 2))` — cap at 2x. Retina displays at 3x or 4x would triple the fragment count for minimal visual gain.

---

## Anti-Patterns to Avoid

### Anti-Pattern: Star field as a separate canvas element

Separate 2D canvas for stars means two separate animation loops or explicit cross-loop coordination. One Three.js scene handles both objects in a single render call. Adding a `THREE.Points` object is 4 lines of code.

### Anti-Pattern: Listening to `window` scroll instead of container scroll

With `scroll-snap-type` on the container, `window.scrollY` does not update — the container scrolls, not the window. All scroll listeners must target the scroll container element directly.

```javascript
// WRONG
window.addEventListener('scroll', handler);

// RIGHT
document.querySelector('.scroll-container').addEventListener('scroll', handler);
```

This is the most common vanilla JS + scroll-snap bug and will silently break all scroll-driven behavior.

### Anti-Pattern: Updating DOM inside RAF

Writing class names or element properties inside the RAF loop runs on every frame (60/s). This forces style recalculation every frame. Use the `scroll` event to update DOM; use RAF only for Three.js state.

### Anti-Pattern: Blocking texture load before scene render

Do not wait for textures before calling `renderer.render()`. Start rendering immediately with placeholder material. Swap texture in the TextureLoader callback. The globe appears instantly (dark blue placeholder) then transitions to the real texture when loaded.

### Anti-Pattern: Hardcoded section count in scroll.js

```javascript
// WRONG
const SECTION_COUNT = 8;

// RIGHT
const sections = document.querySelectorAll('.section');
const SECTION_COUNT = sections.length;
```

Sections will be added in Phase 2. The scroll system should not need to be edited when new sections are added.

---

## Scalability Considerations

| Concern | Phase 1 Approach | Phase 2 Adjustment |
|---------|-----------------|-------------------|
| Globe behavior by section | Switch on `sectionIndex` | Extract to a `GLOBE_STATES` config array indexed by section |
| Section animations | IntersectionObserver + CSS transitions | Add GSAP timeline per section in Phase 2 |
| Navigation links | Static HTML | Generate from section `data-title` attributes if sections grow |
| Star count | Fixed buffer (3000-5000 points) | No change needed — Points object handles 10k+ efficiently |
| Mobile globe | CSS `@media` hides or scales canvas | Phase 1: simple scale-down via CSS; Phase 2: device detection in globe.js |

---

## Build Order for Implementation

Dependencies flow top-to-bottom. Build in this order:

1. **Scaffold** — `index.html`, `vite.config.js`, `package.json`. Verify Vite dev server runs.
2. **`style.css`** — Custom properties, Google Fonts, reset, base layout. CSS is stateless and unblocks all visual work.
3. **`scroll.js`** — Scroll container HTML structure, section shells, scroll-snap CSS, progress bar, dot nav. Scroll system needs the DOM and nothing else.
4. **`globe.js`** — Three.js scene, renderer, camera, globe mesh with placeholder material. Verify globe renders before adding texture or behavior.
5. **`stars.js`** — Receives scene from `globe.js`, adds `THREE.Points`. Verify stars render behind globe (z-depth via camera distance or mesh `renderOrder`).
6. **`main.js`** — Wire `initGlobe`, `initStars`, `initScroll`, start RAF. Connect `getScrollState()` to `updateGlobe()`.
7. **Globe texture** — Load NASA Blue Marble via TextureLoader. Swap in callback.
8. **Globe scroll behavior** — Implement lerp states per section in `updateGlobe`.
9. **Section content** — Hero copy, about layout, portrait. Sections are HTML in `index.html`.
10. **Responsive** — Media queries for mobile in `style.css`. Globe scale adjustments in `globe.js` resize handler.

Steps 3 and 4 can be parallelized (scroll system and Three.js scene have no dependency on each other until step 6).

---

## Sources

- Three.js WebGLRenderer transparency: [threejs.org/docs/#api/en/renderers/WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
- Scroll-based Three.js animations (canonical pattern): [Codrops — Crafting Scroll Based Animations in Three.js](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/)
- Three.js scroll-based animation lesson: [Three.js Journey — Scroll based animation](https://threejs-journey.com/lessons/scroll-based-animation)
- Three.js canvas behind DOM elements (pointer-events, z-index): [Three.js forum — canvas behind DOM elements](https://discourse.threejs.org/t/get-canvas-with-threejs-behind-al-the-dom-elements/37369)
- IntersectionObserver + scroll-snap: [DEV Community — scroll snap with IntersectionObserver](https://dev.to/madhusudanbabar/how-to-implement-a-scroll-snap-with-intersection-observer-3o3p)
- Multiple scenes vs. multiple renderers: [Three.js forum — Multiple renderer vs multiple canvas](https://discourse.threejs.org/t/multiple-renderer-vs-multiple-canvas/3085)
- CSS scroll-snap MDN: [MDN — scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type)
- Three.js Clock / deltaTime: [Three.js docs — Clock.getDelta](https://threejs.org/docs/#api/en/core/Clock.getDelta)
