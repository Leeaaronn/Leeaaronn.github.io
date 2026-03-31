# Feature Landscape

**Domain:** Personal developer/data analyst portfolio website
**Researched:** 2026-03-31
**Scope:** Hero section, about section, 3D elements, scroll experience, hiring context

---

## Table Stakes

Features that are expected by hiring managers and recruiters. Missing or broken = visitor leaves and
assumes the same quality in your code.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Responsive mobile layout | 60%+ of portfolio views happen on mobile (2025 stat) | Medium | Globe must degrade gracefully — skip WebGL on very small/low-power devices |
| Name + role visible immediately | Recruiters spend under 60s reviewing; they need context in <3s | Low | "Aaron Lee — Data Analyst" must be above the fold on all viewports |
| Clear value proposition headline | Hero headline is the single most-read element; drives whether they stay | Low | Concise, memorable, no jargon. "Data that tells the real story" satisfies this |
| CTA buttons (GitHub, LinkedIn, contact) | Recruiters and hiring managers need a next action; no CTA = dead end | Low | Group primary actions; avoid more than 3 in hero |
| About section with photo | Humans hire humans. Portrait + short bio establishes trust and memorability | Low | Portrait must be high-quality, well-lit, approachable |
| Resume download | Non-negotiable for job search context | Low | Must be a direct download link, not a new tab to a Google Doc |
| Readable typography at body scale | Minimum 16px. Anything smaller reads as unpolished | Low | Already codified in design system. Do not slip below 16px anywhere |
| Working navigation | Section links scroll/snap to correct destination | Low | Dot nav + floating nav bar both required for this scroll-snap model |
| Section progress indicator | Scroll-snap disorients users without feedback on where they are | Medium | Progress bar or dot navigation resolves this |
| Fast initial load | Recruiters will not wait; LCP target under 2.5s | Medium | CSS gradient → lazy WebGL pattern; never block first paint on globe texture |
| No broken images or 404s | Signals carelessness | Low | portrait.jpg and resume.pdf paths must be validated before ship |

---

## Differentiators

Features that separate a memorable portfolio from a plain one. Not expected by default but valued
strongly by the audience that will notice (hiring managers at technical orgs, referrals, peers).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3D Earth globe with real NASA texture | Immediately signals Three.js/WebGL skills without a word of explanation | High | Must use real Blue Marble texture — procedural looks fake and undermines the signal |
| Globe tied to scroll position | Creates a "story" — globe centers on hero, zooms to LA on about section | High | Requires IntersectionObserver + scroll progress interpolation; no GSAP yet |
| Space-themed star field across all sections | Cohesive immersive environment; makes the site feel like a designed world, not a template | Medium | Must persist on every section, not just hero — canvas behind all content |
| Atmospheric globe glow + LA marker | Adds craft; the glow rim and pulsing location pin make the globe feel alive | Medium | Rim light shader on Three.js sphere; pulsing CSS/WebGL overlay for LA marker |
| Staggered load animation on hero | Polished first impression; communicates attention to detail | Medium | Stagger delay on eyebrow → title → subtitle → CTAs using CSS transitions |
| Fade-up on about section snap | Section transitions feel intentional, not just page scroll | Low | IntersectionObserver with CSS class toggle; no GSAP dependency |
| Stats row in about section | Concrete numbers (graduation year, projects shipped, tools) are scannable and credible | Low | 3-4 stats: e.g. "B.S. CS 2025", "6 projects", "Python / SQL / Tableau" |
| Skill chips / detail chips | Makes technology stack scannable in 2 seconds | Low | Styled pill badges; no interaction required in Phase 1 |
| Scroll indicator in hero | Guides users who might not realize the site scrolls (common with snap model) | Low | Animated arrow or bouncing dot; disappears after first scroll event |
| Eyebrow text above headline | Provides role context before the headline lands; used in top-tier design portfolios | Low | e.g. "Data Analyst · Los Angeles" |

---

## Anti-Features

Features to deliberately not build. Each has a specific reason it hurts rather than helps.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Dark/light theme toggle | Adds engineering overhead and introduces color palette drift risk; dark-only is a design choice, not a deficiency | Commit to dark. State it as intentional if asked |
| Blog / writing section | Empty blog (0-1 posts) looks worse than no blog; content debt with zero payoff for a job-search portfolio | Add only after 5+ posts exist; Phase N+later |
| Visitor counter / analytics widget | Reveals low traffic; adds no value to a hiring audience | Keep analytics backend-only (Google Analytics) if used |
| Real-time GitHub activity feed | Fragile API dependency; if GitHub rate-limits or is down, section breaks; looks bad when commit graph is sparse | Static project showcase with hand-picked work is more persuasive |
| Cursor customization / cursor trail | Common overuse signal; frequently appears in beginner portfolios and can undermine the "professional" signal | Invest the same effort in typography and spacing quality |
| Excessive particle systems | GPU cost on mobile; visual noise that competes with content; frequently looks dated | Star field is sufficient ambient motion; keep globe geometry clean |
| Skills progress bars (percentage sliders) | Subjective percentages are not credible ("I am 82% good at Python"); hiring managers actively distrust them | Use skill chips/badges — technologies present, no false precision |
| Splash screen / loading gate | Any loading screen that blocks content access for >1s loses visitors | Lazy-load WebGL behind content; show text first |
| Multiple font weights/families beyond design system | Typography chaos reads as amateurish | Stick to Instrument Serif / Syne / JetBrains Mono as defined |
| Auto-playing audio | Universally unwanted | Never |
| React or JS framework | Adds bundle weight with zero benefit for a static single-page portfolio; signals framework dependency over fundamentals | Vanilla JS demonstrates deeper capability for a portfolio context |

---

## Feature Dependencies

```
Star field canvas
  └── must exist before → Globe renders (globe sits on top of star field layer)
  └── must exist before → All sections (stars are the site background)

Globe (Three.js scene)
  └── requires → Real texture loaded from CDN before first paint looks correct
  └── drives → Scroll position events → About section zoom behavior
  └── depends on → IntersectionObserver on #hero and #about sections

Scroll-snap container
  └── requires → All sections present as DOM nodes (even if placeholder)
  └── drives → Dot navigation state
  └── drives → Progress bar position
  └── drives → Globe scroll behavior

Floating nav
  └── requires → Section IDs defined for link targets

About section animation
  └── requires → Scroll-snap section detection to trigger on snap arrival
  └── requires → portrait.jpg present at correct path

Hero stagger animation
  └── independent (runs on page load)
  └── scroll indicator disappears on first scroll event (requires scroll listener)
```

---

## MVP Recommendation (Phase 1 Scope)

**Build now — these define whether Phase 1 is shippable:**

1. Persistent star field canvas (table stakes for the design system)
2. Three.js globe with real NASA texture, atmospheric glow, LA marker (primary differentiator)
3. Hero section: name, value headline, role eyebrow, CTA trio, scroll indicator, stagger animation
4. About section: portrait, bio, stats row, skill chips, resume download CTA, fade-up on snap
5. Scroll-snap with progress indicator and dot navigation
6. Floating nav bar
7. Mobile responsive: globe degrades to 2D fallback or reduced-quality on small screens

**Defer to Phase 2:**

- Project panels / case studies: requires curated project content, not a Phase 1 scaffold concern
- Skills section visualizations: no data to visualize yet
- Contact form: requires a form backend or service (Formspree, EmailJS)
- GSAP animations: dependency added only when base scroll/snap system is proven stable

---

## Phase-Specific Notes

| Phase | Feature Cluster | Risk |
|-------|----------------|------|
| Phase 1 (now) | Globe + star field + hero + about + scroll-snap | WebGL texture load blocking LCP; globe scroll interpolation complexity |
| Phase 2 | Projects, skills, contact, GSAP | Form backend choice; GSAP scroll trigger integration with existing scroll-snap |

---

## Sources

- [21 Best Developer Portfolio Websites — Real Examples (2026) - Colorlib](https://colorlib.com/wp/developer-portfolios/)
- [19 Best Portfolio Design Trends (In 2026) - Colorlib](https://colorlib.com/wp/portfolio-design-trends/)
- [Hero Section Design: Best Practices & Examples for 2026](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Top 10 Hero Sections of 2026](https://www.paperstreet.com/blog/top-10-hero-sections/)
- [Best Three.js Portfolio Examples (2026)](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
- [Build a 3D Earth with Smooth Scroll Rotation using Three.js, Framer Motion and Next.js](https://blog.olivierlarose.com/tutorials/3d-earth)
- [WebGL and Three.js in Production: Immersive Web Experiences Without Sacrificing Performance](https://xmacorporation.com/en/blog/webgl-threejs-production-performance)
- [Scrolling Designs: 8 Patterns and When to Use Each (2026) - Lovable](https://lovable.dev/guides/scrolling-designs-patterns-when-to-use)
- [Don't waste time on a (React) portfolio website - 60+ hiring managers survey](https://profy.dev/article/portfolio-websites-survey)
- [15 Portfolio Mistakes to Avoid in 2025](https://fueler.io/blog/portfolio-mistakes-to-avoid)
- [9 Must-Have Sections for Your 2025 Portfolio Website](https://fueler.io/blog/must-have-sections-for-portfolio-website)
- [How to Create a Stand Out Data Analyst Portfolio (Updated for 2025)](https://www.interviewquery.com/p/how-to-create-a-data-analyst-portfolio)
- [23 Data Analytics Portfolio Examples [2025 Edition]](https://www.founderjar.com/inspiration/data-analytics-portfolio-examples/)
- [12 Things You Should Remove From Your Portfolio Website Immediately](https://mattolpinski.com/articles/fix-your-portfolio/)
