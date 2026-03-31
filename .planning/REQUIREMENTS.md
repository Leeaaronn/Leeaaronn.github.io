# Requirements: Aaron Lee Portfolio

**Defined:** 2026-03-31
**Core Value:** A polished, visually striking portfolio that makes hiring managers remember Aaron Lee

## v1 Requirements

Requirements for Phase 1 (foundation, globe, hero, about).

### Scaffold

- [x] **SCAF-01**: Vite project initialized with vanilla JS template, package.json, vite.config.js (base: '/')
- [x] **SCAF-02**: CLAUDE.md with project rules, color palette, font sizes, asset paths, commands
- [x] **SCAF-03**: index.html with Google Fonts preconnect, 8 scroll-snap sections, meta tags

### Styles

- [x] **STYL-01**: CSS custom properties for colors (#000, #0a0a0a, #111, #1a1a1a, #fff, #ccc, #999, #60a5fa)
- [x] **STYL-02**: Font stack loaded (Instrument Serif, Syne, JetBrains Mono) with minimum 16px body
- [x] **STYL-03**: CSS reset and base styles for dark theme

### Stars

- [x] **STAR-01**: Star field with thousands of white dots visible on ALL sections (fixed position)
- [x] **STAR-02**: Subtle slow drift animation on stars

### Globe

- [x] **GLOB-01**: Three.js 3D Earth with real NASA Blue Marble texture from CDN
- [x] **GLOB-02**: Atmospheric glow rim light in #60a5fa around the sphere
- [x] **GLOB-03**: Pulsing light blue marker on Los Angeles (34.05N, 118.25W)
- [x] **GLOB-04**: Smooth slow Y-axis rotation
- [ ] **GLOB-05**: Hero state: globe centered, full opacity, slowly spinning
- [ ] **GLOB-06**: About state: globe zooms in, rotates to center LA, "Los Angeles, CA" label appears
- [ ] **GLOB-07**: Past about: globe fades out smoothly, stars remain visible

### Scroll

- [x] **SCRL-01**: Scroll-snap container (y mandatory) with 8 sections at 100vh (100svh on mobile)
- [x] **SCRL-02**: Fixed progress bar at top showing scroll percentage
- [x] **SCRL-03**: Fixed dot navigation on right side, clickable, shows active section
- [x] **SCRL-04**: Section detection drives globe behavior and content animations

### Navigation

- [x] **NAV-01**: Floating nav: "AARON LEE" left, section links right, semi-transparent backdrop-blur
- [x] **NAV-02**: Resume link opens assets/resume.pdf in new tab

### Hero

- [x] **HERO-01**: Eyebrow text "Data Analyst · Los Angeles, CA" in mono font
- [x] **HERO-02**: Title "Data that tells the real story" with "real story" in italic accent color
- [x] **HERO-03**: Subtitle (1-2 sentences about what Aaron does)
- [x] **HERO-04**: CTA buttons: GitHub, LinkedIn, Email Me
- [x] **HERO-05**: Scroll indicator at bottom ("Scroll to explore" + animated line)
- [x] **HERO-06**: Staggered fade-in animation on load

### About

- [ ] **ABOU-01**: Portrait from ./assets/portrait.jpg with rounded corners, hover scale, "Rosemead, CA" label
- [ ] **ABOU-02**: "Hi, I'm Aaron." with name in accent color + 2-3 sentence bio
- [ ] **ABOU-03**: Stats row: B.S. CS CSUF '25 | 4 Projects | 44 Pytest Assertions | +38.7K Riders/Day
- [ ] **ABOU-04**: Detail chips: Education, Focus, Goal, Next Step
- [ ] **ABOU-05**: Resume download button linking to ./assets/resume.pdf
- [ ] **ABOU-06**: Fade-up animation when section snaps into view

### Responsive

- [ ] **RESP-01**: Mobile layout: portrait stacks above text in about section
- [x] **RESP-02**: Globe simplifies or reduces on mobile (cap devicePixelRatio at 2)
- [x] **RESP-03**: Sections use min-height: 100svh for mobile address bar compatibility

## v2 Requirements

Deferred to Phase 2. Tracked but not in current roadmap.

### Projects

- **PROJ-01**: 4 full-screen project panels with descriptions, metrics, code snippets
- **PROJ-02**: Syntax-highlighted code display per project
- **PROJ-03**: GitHub repo links per project

### Skills

- **SKIL-01**: Skills section with categorized card grid
- **SKIL-02**: Hover effects on skill cards

### Contact

- **CONT-01**: Contact section with email, GitHub, LinkedIn buttons
- **CONT-02**: Footer with copyright

### Animations

- **ANIM-01**: GSAP ScrollTrigger animations for all Phase 2 sections
- **ANIM-02**: Metric count-up animations

### Deploy

- **DEPL-01**: GitHub Actions deployment workflow

## Out of Scope

| Feature | Reason |
|---------|--------|
| React / any JS framework | Vanilla JS only — portfolio complexity doesn't warrant it |
| Tailwind / CSS framework | Hand-written CSS with custom properties |
| Custom domain | GitHub Pages default (leeaaronn.github.io) is fine |
| Dark/light theme toggle | Dark-only aesthetic is intentional |
| CMS / dynamic content | Static site, no backend needed |
| Blog | Not a content platform |
| Loading screen/preloader | Site should load fast enough without one |
| Background music/audio | Accessibility issue, annoying |
| Chat widget | Not appropriate for portfolio |
| three-globe npm package | Unnecessary wrapper; use Three.js primitives directly |

## Traceability

| Requirement | GSD Phase | Status |
|-------------|-----------|--------|
| SCAF-01 | Phase 1 (Foundation) | Complete |
| SCAF-02 | Phase 1 (Foundation) | Complete |
| SCAF-03 | Phase 1 (Foundation) | Complete |
| STYL-01 | Phase 1 (Foundation) | Complete |
| STYL-02 | Phase 1 (Foundation) | Complete |
| STYL-03 | Phase 1 (Foundation) | Complete |
| RESP-03 | Phase 1 (Foundation) | Complete |
| STAR-01 | Phase 2 (Canvas Layer) | Complete |
| STAR-02 | Phase 2 (Canvas Layer) | Complete |
| GLOB-01 | Phase 2 (Canvas Layer) | Complete |
| GLOB-02 | Phase 2 (Canvas Layer) | Complete |
| GLOB-03 | Phase 2 (Canvas Layer) | Complete |
| GLOB-04 | Phase 2 (Canvas Layer) | Complete |
| GLOB-05 | Phase 2 (Canvas Layer) | Pending |
| GLOB-06 | Phase 2 (Canvas Layer) | Pending |
| GLOB-07 | Phase 2 (Canvas Layer) | Pending |
| RESP-02 | Phase 2 (Canvas Layer) | Complete |
| SCRL-01 | Phase 3 (Scroll Shell) | Complete |
| SCRL-02 | Phase 3 (Scroll Shell) | Complete |
| SCRL-03 | Phase 3 (Scroll Shell) | Complete |
| SCRL-04 | Phase 3 (Scroll Shell) | Complete |
| NAV-01 | Phase 3 (Scroll Shell) | Complete |
| NAV-02 | Phase 3 (Scroll Shell) | Complete |
| HERO-01 | Phase 4 (Hero Section) | Complete |
| HERO-02 | Phase 4 (Hero Section) | Complete |
| HERO-03 | Phase 4 (Hero Section) | Complete |
| HERO-04 | Phase 4 (Hero Section) | Complete |
| HERO-05 | Phase 4 (Hero Section) | Complete |
| HERO-06 | Phase 4 (Hero Section) | Complete |
| ABOU-01 | Phase 5 (About Section) | Pending |
| ABOU-02 | Phase 5 (About Section) | Pending |
| ABOU-03 | Phase 5 (About Section) | Pending |
| ABOU-04 | Phase 5 (About Section) | Pending |
| ABOU-05 | Phase 5 (About Section) | Pending |
| ABOU-06 | Phase 5 (About Section) | Pending |
| RESP-01 | Phase 5 (About Section) | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to GSD phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 — traceability updated to 5-phase GSD roadmap*
