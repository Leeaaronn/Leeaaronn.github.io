---
phase: 04-hero-section
plan: 01
subsystem: ui
tags: [three.js, css-animation, hero, fade-in, scroll-indicator, cta]

# Dependency graph
requires:
  - phase: 03-scroll-shell
    provides: scroll detection, dot nav, progress bar, and section snap container
provides:
  - Hero HTML structure with BEM class names (hero__eyebrow, hero__title, hero__subtitle, hero__ctas, hero__scroll-cue)
  - Hero CSS styles including z-index layering above globe canvas
  - Staggered fade-in animation (5 elements, 0.5s–1.5s delay range)
  - Pulsing scroll indicator line at hero bottom
affects: [05-about-section]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS @keyframes with animation-fill-mode: forwards for single-play entrance animations"
    - "opacity: 0 initial state on animated elements prevents FOUC before animation delay fires"
    - "hero__content z-index: 10 places text above Three.js globe canvas"

key-files:
  created: []
  modified:
    - index.html
    - src/style.css

key-decisions:
  - "Title font size uses clamp(52px, 9vw, 120px) per CONTEXT.md spec — overrides --text-hero token"
  - "Subtitle color is inline #777777 (between grey-1 and grey-2 tokens, no exact token exists)"
  - "hero__scroll-cue positioned absolute within hero__content wrapper, not the section itself"

patterns-established:
  - "Section 9 CSS block pattern: section comment header, layout first, then element styles, then animations, then mobile breakpoint"

requirements-completed: [HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06]

# Metrics
duration: ~20min
completed: 2026-03-31
---

# Phase 4 Plan 01: Hero Section Summary

**Hero section with eyebrow, serif title ("real story" in italic #60a5fa), 3 CTA buttons, pulsing scroll indicator, and 5-element staggered fade-in animation (0.5s–1.5s)**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-31
- **Completed:** 2026-03-31
- **Tasks:** 3 (including 1 checkpoint verified by user)
- **Files modified:** 2

## Accomplishments

- Hero HTML content added to index.html inside `<section id="hero">` with full BEM structure
- Hero CSS added as Section 9 in style.css — layout, typography, hover states, animations, mobile responsive
- User visually verified: staggered fade-in plays, "real story" renders in italic accent blue, CTAs hover correctly, globe visible behind content

## Task Commits

1. **Task 1: Add hero HTML content to index.html** - `cd4b698` (feat)
2. **Task 2: Add hero CSS styles and staggered fade-in animation** - `7df556c` (feat)
3. **Task 3: Visual verification** - Approved by user (checkpoint, no commit)

## Files Created/Modified

- `index.html` - Hero section populated with eyebrow, title with `<em>real story</em>`, subtitle, 3 CTA anchor links, scroll-cue
- `src/style.css` - Section 9 added: hero layout, eyebrow/title/subtitle/CTA/scroll-cue styles, @keyframes hero-fade-in and scroll-line-pulse, staggered delays, mobile breakpoint

## Decisions Made

- Title font size set to `clamp(52px, 9vw, 120px)` per CONTEXT.md decision — this is larger than the existing `--text-hero` token and was intentional
- Subtitle color set to inline `#777777` — sits between `--color-grey-1` (#ccc) and `--color-grey-2` (#999), no existing token
- Scroll cue is `position: absolute` inside `hero__content` (not the section) so it follows the content wrapper's z-index context above the globe

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Hero section is complete and verified — Phase 5 (About Section) can begin
- Portrait asset (`portrait.jpg`) exists at repo root — must move to `public/assets/portrait.jpg` during Phase 5 (tracked in STATE.md blockers)
- Resume PDF (`assets/resume.pdf`) — confirm existence and move to `public/assets/resume.pdf` before Phase 5 about section resume download link

---
*Phase: 04-hero-section*
*Completed: 2026-03-31*
