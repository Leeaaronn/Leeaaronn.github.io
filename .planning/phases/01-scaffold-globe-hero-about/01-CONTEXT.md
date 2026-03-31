# Phase 1: Scaffold, Globe, Hero & About - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working Vite project with two complete sections (hero + about), a persistent star field background, a 3D Earth globe with real texture, and a scroll-snap navigation system. Site runs locally with `npm run dev`. Phase does NOT include projects, skills, contact, or GSAP animations for those sections.

</domain>

<decisions>
## Implementation Decisions

### Stars Background
- **D-01:** Use an HTML5 Canvas with requestAnimationFrame for the star field. Canvas is fixed-position behind all content. Thousands of small white dots with subtle slow drift animation. This approach gives fine-grained control over particle count and drift speed, and performs well at high particle counts.

### Globe Atmosphere
- **D-02:** Use a combination of additive-blended sprite halo (for the outer glow) and a rim-light effect on the sphere material (for edge illumination). Color: #60a5fa. This avoids complex custom fragment shaders while achieving a polished atmospheric look.

### Scroll System
- **D-03:** Use `scroll-snap-type: y mandatory` as user specified. Each section is exactly 100vh with `scroll-snap-align: start`.
- **D-04:** All three navigation elements coexist: thin progress bar (2-3px) at top, dot navigation on right edge, floating nav bar at top. Progress bar sits below nav bar z-index-wise but above content.

### Globe Texture
- **D-05:** Load Earth texture from CDN: `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg`. Fallback: `https://unpkg.com/three-globe/example/img/earth-topology.png`. Never use procedural generation.

### Color Palette (locked from project)
- **D-06:** Background: #000000, #0a0a0a, #111111, #1a1a1a. Text: #ffffff, #cccccc, #999999. Accent: #60a5fa. NO green, NO purple, NO orange.

### Typography (locked from project)
- **D-07:** Instrument Serif for headings, Syne for body, JetBrains Mono for code/labels. Body text minimum 16px. Hero title 60-120px (clamp). Section titles 48-64px.

### Assets (locked from project)
- **D-08:** Portrait at `./assets/portrait.jpg`. Resume at `./assets/resume.pdf`. Both already exist in repo.

### Claude's Discretion
- Exact star count and drift speed — tune for visual quality and performance
- Globe rotation speed — should feel slow and elegant
- Specific easing curves for fade-in animations
- Progress bar exact color (accent or white with low opacity)
- Dot navigation dot size and spacing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and user's detailed prompt. The user provided extremely specific requirements inline.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `./assets/portrait.jpg` — portrait photo, already in repo (untracked)
- `./assets/resume.pdf` — resume file, assumed present

### Established Patterns
- No existing codebase — this is a greenfield project. No patterns to follow or conflict with.

### Integration Points
- `index.html` — entry point, loads `src/main.js`
- `src/main.js` — orchestrates globe, stars, scroll initialization
- Vite dev server on default port

</code_context>

<specifics>
## Specific Ideas

- Hero title: "Data that tells the real story" — "real story" in italic accent color (#60a5fa)
- Hero eyebrow: "Data Analyst · Los Angeles, CA" in mono font, small caps, letter-spaced
- About stats: "B.S. CS CSUF '25 | 4 Projects | 44 Pytest Assertions | +38.7K Riders/Day"
- About detail chips: Education, Focus, Goal, Next Step
- LA marker coordinates: 34.05°N, 118.25°W — pulsing light blue dot
- Globe scroll behavior: hero = centered spinning, about = zoom to LA, past about = fade out (stars remain)
- Portrait: 280-320px wide, rounded corners 16px, "Rosemead, CA" label overlay

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Phase 2 (projects, skills, contact, GSAP animations, deploy) is already defined in roadmap.

</deferred>

---

*Phase: 01-scaffold-globe-hero-about*
*Context gathered: 2026-03-30*
