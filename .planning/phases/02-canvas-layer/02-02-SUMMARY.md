---
phase: 02-canvas-layer
plan: "02"
subsystem: globe
tags: [three.js, globe, webgl, texture, atmosphere, animation]
dependency_graph:
  requires: [02-01]
  provides: [globe-canvas, initGlobe, updateGlobe-stub]
  affects: [src/main.js, src/globe.js]
tech_stack:
  added: [three.js WebGLRenderer, ShaderMaterial, TextureLoader, unpkg CDN textures]
  patterns: [module-scoped Three.js state, lat/lon-to-3D conversion, AdditiveBlending atmosphere]
key_files:
  created: []
  modified:
    - src/globe.js
    - src/main.js
decisions:
  - Atmosphere uses custom ShaderMaterial with BackSide + AdditiveBlending rather than a simple overlay, giving a physically believable rim-glow effect
  - LA marker pulsing is driven by emissiveIntensity + scale in the animation loop, avoiding extra geometry
  - updateGlobe(scrollState) exported as no-op stub so Plan 03 can import it without breaking the module contract
  - main.js wires all three init functions (initStars, initGlobe, initScroll) on DOMContentLoaded
metrics:
  duration_minutes: 6
  completed: "2026-03-31"
  tasks_completed: 1
  files_modified: 2
---

# Phase 2 Plan 02: Globe Implementation Summary

## One-liner

Three.js Earth globe with NASA Blue Marble texture, #60a5fa atmospheric rim glow, pulsing LA marker at 34.05N/118.25W, and slow Y-axis rotation on a fixed transparent canvas at z-index 1.

## What Was Built

The `src/globe.js` module went from a 7-line stub to a 209-line full Three.js globe implementation. The globe:

- Loads real NASA Blue Marble diffuse, topology bump, and ocean water specular textures from the unpkg CDN (`unpkg.com/three-globe/example/img/`)
- Wraps everything in a `THREE.Group` (`globeGroup`) so rotation, zoom, and fade transforms can be applied as a unit in Plan 03
- Uses a custom `ShaderMaterial` with `BackSide` rendering and `AdditiveBlending` for the atmospheric glow — produces a physically plausible blue rim at `#60a5fa`
- Converts LA geographic coordinates (34.05N, 118.25W) to a 3D vector via the `latLonToVec3` helper and places a `MeshPhongMaterial` marker sphere 1% above the surface
- Runs `renderer.setAnimationLoop(animate)` which ticks Y rotation at +0.002 rad/frame and pulses the LA marker emissive intensity and scale using `Math.sin(clock.getElapsedTime() * 3)`
- Caps `devicePixelRatio` at 2 to meet RESP-02 mobile performance requirement
- Appends the canvas as `position:fixed; z-index:1; pointer-events:none` so it floats behind all section content
- Exposes `CAMERA_Z_DEFAULT = 5` at module scope for Plan 03 to reference when resetting camera position

`src/main.js` was updated to call `initStars()`, `initGlobe()`, and `initScroll()` on `DOMContentLoaded`, replacing the empty comment-only stub.

## Task Summary

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Three.js globe with NASA texture, atmosphere, LA marker | 0533be1 | src/globe.js, src/main.js |

## Acceptance Criteria Verification

All 21 static-analysis checks passed:

- `initGlobe` and `updateGlobe` exported as named functions
- All three CDN texture URLs present (blue-marble, topology, water)
- `SphereGeometry` + `MeshPhongMaterial` with `map` property
- `BackSide` + `AdditiveBlending` for atmosphere
- RGB floats `0.376, 0.647, 0.980` in fragment shader
- LA coordinates `34.05` and `118.25` present
- `Math.min(window.devicePixelRatio, 2)` pixel ratio cap
- `rotation.y` increment in animation loop
- `emissiveIntensity` change for marker pulsing
- Canvas `position: 'fixed'` and `zIndex: '1'`
- `resize` event listener
- `CAMERA_Z_DEFAULT = 5` at module scope

Build: `npm run build` completed without errors (507 kB bundle, Three.js expected size).

## Deviations from Plan

None — plan executed exactly as written.

The main.js update (wiring all three init calls on DOMContentLoaded) was a minor natural extension — the stub previously had no calls and the plan implicitly required globe initialization to be triggered.

## Known Stubs

- `updateGlobe(scrollState)` — intentionally no-op. Plan 03 (scroll behavior) will implement zoom-to-LA and fade-out logic using the module-scoped `camera`, `globeGroup`, and `CAMERA_Z_DEFAULT` variables.
- `initStars()` in `stars.js` — still a stub; Plan 02-01 (parallel agent) implements it.
- `initScroll()` in `scroll.js` — still a stub; Phase 3 implements it.

These stubs do not prevent the plan goal (globe rendering) from being achieved — `initGlobe()` is fully implemented and wired.

## Self-Check: PASSED
