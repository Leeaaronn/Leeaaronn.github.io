# Roadmap: Aaron Lee Portfolio — Phase 1 Milestone

## Overview

Five phases build the portfolio from zero to a shippable hero + about site. Phase 1 establishes the scaffold and global styles. Phase 2 delivers the technical centerpiece — the Three.js globe and star field — validating the hardest dependency before any content exists. Phase 3 wires the scroll shell so visitors can navigate. Phases 4 and 5 fill the hero and about sections with real content. At the end of Phase 5 the site is live, visually striking, and ready for job applications.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Vite scaffold, CLAUDE.md, global CSS, Google Fonts, CSS reset
- [ ] **Phase 2: Canvas Layer** - Three.js globe (NASA texture, atmosphere, LA marker, scroll behavior) and star field
- [ ] **Phase 3: Scroll Shell** - Scroll-snap container, progress bar, dot nav, floating nav bar
- [ ] **Phase 4: Hero Section** - Hero content, CTA buttons, scroll indicator, staggered load animation
- [ ] **Phase 5: About Section** - Portrait, bio, stats, chips, resume download, mobile responsive layout

## Phase Details

### Phase 1: Foundation
**Goal**: The project builds, runs in dev, and applies the correct visual foundation for all future work
**Depends on**: Nothing (first phase)
**Requirements**: SCAF-01, SCAF-02, SCAF-03, STYL-01, STYL-02, STYL-03, RESP-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts the dev server and the page loads in a browser without errors
  2. Google Fonts (Instrument Serif, Syne, JetBrains Mono) render visibly on a test element
  3. The CSS custom property `--accent` is `#60a5fa` and no green, purple, or orange appears anywhere
  4. Body text renders at minimum 16px and sections use `min-height: 100svh`
  5. CLAUDE.md exists and documents color palette, font sizes, asset paths, and dev commands
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md — Vite scaffold: package.json, vite.config.js, src/ entry point and module stubs
- [ ] 01-02-PLAN.md — HTML shell, CSS design system, CLAUDE.md conventions
**UI hint**: yes

### Phase 2: Canvas Layer
**Goal**: A textured, performant Three.js Earth globe and persistent star field are visible behind all sections, responding to scroll position
**Depends on**: Phase 1
**Requirements**: STAR-01, STAR-02, GLOB-01, GLOB-02, GLOB-03, GLOB-04, GLOB-05, GLOB-06, GLOB-07, RESP-02
**Success Criteria** (what must be TRUE):
  1. Stars (thousands of white dots with subtle drift) are visible on every section when scrolling through all 8 sections
  2. The globe shows the real NASA Blue Marble texture (not procedural noise or solid color) in both dev and production
  3. The globe is centered on the hero section, shifts and zooms toward LA on the about section, and fades out on all subsequent sections while stars remain
  4. The pulsing light blue LA marker pulses visibly at the correct location on the globe
  5. On a mid-range mobile device, globe animation maintains smooth playback (device pixel ratio capped at 2)
**Plans**: TBD
**UI hint**: yes

### Phase 3: Scroll Shell
**Goal**: Visitors can navigate between all 8 sections using scroll-snap, the progress bar, dot navigation, and the floating nav bar
**Depends on**: Phase 2
**Requirements**: SCRL-01, SCRL-02, SCRL-03, SCRL-04, NAV-01, NAV-02
**Success Criteria** (what must be TRUE):
  1. Scrolling snaps cleanly to each of the 8 sections on both desktop and iOS Safari (no stuck or flick-to-end behavior)
  2. The progress bar at the top updates as the user scrolls through sections
  3. The dot navigation on the right side highlights the active section and clicking a dot navigates to that section
  4. The floating nav bar shows "AARON LEE" on the left and section links on the right with semi-transparent backdrop blur
  5. Clicking the Resume nav link opens `assets/resume.pdf` in a new tab
**Plans**: TBD
**UI hint**: yes

### Phase 4: Hero Section
**Goal**: Visitors immediately see Aaron's name, role, value proposition, and can take action from the first screen
**Depends on**: Phase 3
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06
**Success Criteria** (what must be TRUE):
  1. The eyebrow text "Data Analyst · Los Angeles, CA" in mono font and the title "Data that tells the real story" (with "real story" in italic accent color) are visible above the fold
  2. GitHub, LinkedIn, and Email Me CTA buttons are visible and their links work correctly
  3. The scroll indicator ("Scroll to explore" with animated line) appears at the bottom of the hero
  4. All hero elements fade in with a staggered animation on page load (eyebrow, then title, then subtitle, then CTAs in sequence)
**Plans**: TBD
**UI hint**: yes

### Phase 5: About Section
**Goal**: The about section shows Aaron's portrait, bio, stats, and a resume download — and the full site is shippable on mobile and desktop
**Depends on**: Phase 4
**Requirements**: ABOU-01, ABOU-02, ABOU-03, ABOU-04, ABOU-05, ABOU-06, RESP-01
**Success Criteria** (what must be TRUE):
  1. Aaron's portrait loads from `./assets/portrait.jpg` with rounded corners, a hover scale effect, and a "Rosemead, CA" label — no broken image
  2. The bio, stats row (B.S. CS CSUF '25, 4 Projects, 44 Pytest Assertions, +38.7K Riders/Day), and detail chips are visible and readable
  3. The Resume download button links to `./assets/resume.pdf` and triggers a file download
  4. About section content fades up when the section snaps into view
  5. On a mobile device, the portrait stacks above the bio text (not side-by-side)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Canvas Layer | 0/? | Not started | - |
| 3. Scroll Shell | 0/? | Not started | - |
| 4. Hero Section | 0/? | Not started | - |
| 5. About Section | 0/? | Not started | - |
