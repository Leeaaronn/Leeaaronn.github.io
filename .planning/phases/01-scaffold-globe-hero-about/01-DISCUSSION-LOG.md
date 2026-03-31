# Phase 1: Scaffold, Globe, Hero & About - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-scaffold-globe-hero-about
**Areas discussed:** Stars implementation, Globe atmosphere, Scroll-snap behavior, Nav density
**Mode:** Auto (--auto flag, all recommended defaults selected)

---

## Stars Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Canvas + requestAnimationFrame | JS canvas with particle system, fine control over drift and count | ✓ |
| CSS box-shadow | Pure CSS dots via box-shadow, simpler but limited animation | |
| CSS radial-gradient | Gradient-based dots, no JS needed but poor at high counts | |

**User's choice:** [auto] Canvas + requestAnimationFrame (recommended default)
**Notes:** Enables smooth drift animation and supports thousands of particles with good performance.

---

## Globe Atmosphere

| Option | Description | Selected |
|--------|-------------|----------|
| Sprite halo + rim light | Additive-blended sprite for outer glow + rim shader on sphere | ✓ |
| Custom fragment shader | Full custom atmosphere shader, most realistic but complex | |
| CSS backdrop glow | CSS box-shadow/filter on the canvas container, simplest but least integrated | |

**User's choice:** [auto] Sprite halo + rim light (recommended default)
**Notes:** Good balance of visual quality and implementation simplicity.

---

## Scroll-Snap Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Mandatory | Strict snapping, always lands on a section boundary | ✓ |
| Proximity | Snaps when close to boundary, allows partial scrolling | |

**User's choice:** [auto] Mandatory (recommended — user explicitly specified this)
**Notes:** User's spec says `scroll-snap-type: y mandatory`. Sections are full 100vh so mandatory is appropriate.

---

## Nav Density

| Option | Description | Selected |
|--------|-------------|----------|
| All three elements (thin progress bar) | Nav bar + 2-3px progress bar + dot nav, all visible | ✓ |
| Hide progress bar | Only nav + dot nav, cleaner but less scroll feedback | |
| Merge progress into dots | Dot nav doubles as progress indicator, most minimal | |

**User's choice:** [auto] All three elements with thin progress bar (recommended default)
**Notes:** Keeps all user-specified UI elements. Thin progress bar minimizes visual competition with nav bar.

---

## Claude's Discretion

- Star count and drift speed (tune for quality/performance)
- Globe rotation speed
- Animation easing curves
- Progress bar opacity/color
- Dot nav sizing and spacing

## Deferred Ideas

None — all discussion stayed within Phase 1 scope.
