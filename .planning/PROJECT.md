# Aaron Lee — Portfolio Website

## What This Is

A personal portfolio website for Aaron Lee, an entry-level Data Analyst / Data Operations professional based in Rosemead, CA. Deployed to GitHub Pages at leeaaronn.github.io. Features a 3D Earth globe with Three.js, scroll-snap sections, and a space-themed dark aesthetic. Built with Vite + vanilla JS — no frameworks.

## Core Value

A polished, visually striking portfolio that makes hiring managers and recruiters remember Aaron Lee — the 3D globe and clean design signal technical craft beyond a typical resume site.

## Requirements

### Validated

- [x] Vite project scaffold with package.json, vite.config.js, index.html — Validated in Phase 1: Foundation
- [x] CLAUDE.md with project rules and conventions — Validated in Phase 1: Foundation
- [x] Global CSS: custom properties, Google Fonts (Instrument Serif, Syne, JetBrains Mono), reset, base styles — Validated in Phase 1: Foundation
- [x] Persistent star field background visible on ALL sections with subtle drift animation — Validated in Phase 2: Canvas Layer
- [x] Three.js 3D Earth globe with real NASA Blue Marble texture, atmospheric glow (#60a5fa), LA marker, slow rotation — Validated in Phase 2: Canvas Layer
- [x] Globe scroll behavior: centered on hero, zooms to LA on about, fades out past about (stars remain) — Validated in Phase 2: Canvas Layer

- [x] Scroll-snap container (y mandatory), progress bar, dot navigation, section detection — Validated in Phase 3: Scroll Shell
- [x] Floating nav bar: "AARON LEE" left, section links + Resume right, semi-transparent backdrop-blur — Validated in Phase 3: Scroll Shell
- [x] Hero section: eyebrow text, title ("Data that tells the real story"), subtitle, CTA buttons (GitHub, LinkedIn, Email), scroll indicator, staggered load animation — Validated in Phase 4: Hero Section

### Active
- [ ] About section: portrait (./assets/portrait.jpg), bio, stats row, detail chips, resume download, fade-up animation on snap
- [ ] 6 placeholder sections for scroll system (Projects x4, Skills, Contact)
- [ ] Mobile responsive layout (globe simplifies, portrait stacks above text)

### Out of Scope

- Project panels / case studies — Phase 2
- Skills section with visualizations — Phase 2
- Contact form — Phase 2
- GSAP animations for Phase 2 sections — Phase 2
- React or any JS framework — vanilla JS only
- Tailwind or CSS frameworks — hand-written CSS only
- Custom domain setup — using GitHub Pages default
- CMS or dynamic content — static site only
- Dark/light theme toggle — dark only

## Context

**Owner:** Aaron Lee
**Role:** Entry-level Data Analyst / Data Operations
**Education:** B.S. Computer Science, Cal State Fullerton, graduated January 2025
**Location:** Rosemead, CA (Los Angeles area)
**Email:** leeaaron527@gmail.com
**GitHub:** github.com/Leeaaronn
**LinkedIn:** linkedin.com/in/leeaaronn100

**Design system:**
- Colors: Pure black (#000000), dark greys (#0a0a0a, #111111, #1a1a1a), white (#ffffff), light greys (#cccccc, #999999), accent light blue (#60a5fa). HARD RULE: NO green, NO purple, NO orange.
- Typography: Instrument Serif (display), Syne (body), JetBrains Mono (mono). Body text minimum 16px. Hero title 60-120px (clamp). Section titles 48-64px.
- Star field: thousands of white dots, fixed-position canvas behind all content, subtle slow drift
- Globe: real Earth texture from CDN (unpkg.com/three-globe Blue Marble), atmospheric rim glow, pulsing LA marker (34.05N, 118.25W)

**Known issues from previous prototype (DO NOT repeat):**
1. Globe used procedural noise instead of real texture — looked fake
2. Portrait path was wrong — file IS at ./assets/portrait.jpg
3. Font sizes too small (body ~14px) — minimum 16px everywhere
4. Green accent color was used — must be light blue #60a5fa
5. Stars only appeared on hero — must persist on ALL sections

**Existing assets:**
- assets/portrait.jpg (portrait photo)
- assets/resume.pdf (resume)

## Constraints

- **Tech stack**: Vite + vanilla JS + Three.js only. No React, no Tailwind, no GSAP yet.
- **Deployment**: GitHub Pages from main branch
- **Color**: Black + white + light blue (#60a5fa) ONLY. No green, purple, or orange.
- **Typography**: Minimum 16px body text. Readability is non-negotiable.
- **Globe texture**: Must use real NASA Blue Marble texture, not procedural generation.
- **Stars**: Must be visible on every section, not just hero.
- **Phase boundary**: This milestone covers ONLY hero + about. Projects, skills, contact are Phase 2.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite + vanilla JS over React | Portfolio is simple enough; no framework overhead needed | Validated (Phase 1) |
| Three.js for globe | Industry standard for WebGL; good docs and ecosystem | Validated (Phase 2) |
| Scroll-snap over smooth scroll library | Native CSS feature, no extra dependency | Validated (Phase 3) |
| Real Earth texture over procedural | Previous prototype with procedural looked fake | Validated (Phase 2) |
| Fixed star field canvas | Must persist across all sections as site background | Validated (Phase 2) |
| 8 sections with 6 placeholders | Scroll system needs all sections to work; content comes in Phase 2 | -- Pending |
| Hero content with staggered animation | CSS @keyframes for load animation; 5-stage delay sequence | Validated (Phase 4) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after Phase 4 completion*
