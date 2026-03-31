---
phase: 03-scroll-shell
plan: 01
subsystem: ui
tags: [scroll-snap, scroll-detection, nav-bar, progress-bar, dot-nav, vanilla-js]

# Dependency graph
requires:
  - phase: 02-canvas-layer
    provides: globe.js updateGlobe() and stars.js initStars() — canvas layers scroll.js drives via callback

provides:
  - Fixed nav bar with AARON LEE branding and section links including Resume PDF link
  - Scroll progress bar (thin blue line at page top) wired to body scroll position
  - Dot navigation (8 dots, right side) with active state highlighting and click-to-scroll
  - Centralized scroll detection in scroll.js driving both UI and globe via single listener

affects:
  - phase 04-hero-content (nav bar will be visible above hero content)
  - phase 05-about-content (dot nav active state will switch to About on scroll)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Callback pattern for module decoupling: scroll.js accepts onScroll callback, calls it with { activeSection, progress } — main.js passes updateGlobe as callback
    - Single scroll listener per page: all scroll-driven logic (UI + globe) channeled through one passive body listener
    - Body as scroll container: document.body.scrollTop / scrollHeight used for progress bar, not window scroll

key-files:
  created: []
  modified:
    - index.html
    - src/style.css
    - src/scroll.js
    - src/main.js

key-decisions:
  - "Centralized scroll detection in scroll.js via callback pattern so main.js is the wiring point — avoids tight coupling between scroll.js and globe.js"
  - "Progress bar uses overall body scroll ratio (scrollTop/scrollHeight) for smooth linear fill across all 8 sections"
  - "Active section detection uses viewport midpoint (50%) threshold — same logic as Phase 2 globe.js"
  - "Dot click uses scrollIntoView({ behavior: smooth }) which respects scroll-snap alignment"

patterns-established:
  - "Module callback pattern: init functions accept { onCallback } — callers (main.js) wire together modules without circular imports"
  - "Passive scroll listener on body (the scroll-snap container) — never on window"

requirements-completed: [SCRL-01, SCRL-02, SCRL-03, SCRL-04, NAV-01, NAV-02]

# Metrics
duration: ~2min
completed: 2026-03-31
---

# Phase 03 Plan 01: Scroll Shell Summary

**Fixed nav bar, scroll progress bar, and dot navigation with centralized single-listener scroll detection driving both UI elements and globe behavior via callback**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-31T21:49:13Z
- **Completed:** 2026-03-31T21:50:56Z
- **Tasks:** 2 of 2 auto tasks complete (Task 3 is checkpoint:human-verify, awaiting user)
- **Files modified:** 4

## Accomplishments

- Nav bar (fixed, backdrop-blur, z-index 100) with AARON LEE mono logo left and 6 links right including Resume PDF in new tab
- Progress bar (2px, z-index 101, accent blue) fills left-to-right as body scrolls; 0% at hero, 100% at contact
- Dot nav (8 dots, right edge, vertically centered) toggles active state on scroll and click-scrolls to target section
- scroll.js fully implemented — single passive body listener drives both progress bar, dot active state, and globe via onScroll callback
- main.js refactored: removed inline getScrollState() and body.addEventListener, now delegates entirely to initScroll()

## Task Commits

Each task was committed atomically:

1. **Task 1: Add nav bar, progress bar, and dot nav HTML + CSS** - `4084e56` (feat)
2. **Task 2: Implement scroll.js and refactor main.js scroll wiring** - `b86cb6e` (feat)
3. **Task 3: Visual verification of scroll shell** - awaiting checkpoint approval

## Files Created/Modified

- `index.html` - Added nav-bar, progress-bar, dot-nav HTML elements before main tag
- `src/style.css` - Added Section 8 block: .nav-bar, .progress-bar, .progress-bar__fill, .dot-nav, .dot-nav__dot, .dot-nav__dot--active, mobile media query
- `src/scroll.js` - Replaced stub with full implementation: getScrollState, updateUI, onScrollEvent, dot click handlers
- `src/main.js` - Removed inline scroll logic; imports and calls initScroll({ onScroll: updateGlobe })

## Decisions Made

- Callback pattern for decoupling: scroll.js fires `onScroll({ activeSection, progress })` rather than importing globe.js directly — main.js is the wiring point
- Progress bar uses `document.body.scrollTop / (scrollHeight - clientHeight)` for overall page progress, not per-section progress
- Active section detection: same 50% viewport threshold used in Phase 2 globe.js for consistency
- dot-nav__dot--active only toggled when activeSection changes (guards to avoid unnecessary DOM writes on every scroll tick)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Vite build generates a chunk size warning for Three.js (512KB) — pre-existing from Phase 2, not introduced by this plan. Not a bug.

## Known Stubs

None — all scroll shell elements are fully wired. Progress bar, dot nav, and globe callback are all live.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Scroll shell complete: nav bar, progress bar, dot nav all wired and functioning
- Globe + stars continue working unchanged (scroll.js passes same { activeSection, progress } shape as the old main.js code)
- Phase 4 (hero content) will place content inside #hero section — nav bar will float above it at z-index 100
- No blockers. Waiting on Task 3 human-verify checkpoint before marking plan fully complete.

## Self-Check: PASSED

- FOUND: index.html
- FOUND: src/style.css
- FOUND: src/scroll.js
- FOUND: src/main.js
- FOUND: .planning/phases/03-scroll-shell/03-01-SUMMARY.md
- FOUND commit: 4084e56
- FOUND commit: b86cb6e

---
*Phase: 03-scroll-shell*
*Completed: 2026-03-31*
