# Phase 4: Hero Section - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning
**Source:** Inline user input during plan-phase

<domain>
## Phase Boundary

Hero section content, styling, CTA buttons, scroll indicator, and staggered load animation. Full viewport with globe visible behind. This phase adds content to the existing `#hero` section shell created in Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Layout
- Full viewport hero, globe visible behind content
- Centered text overlay with z-index above canvas
- Content vertically centered in the section

### Eyebrow Text
- Text: "Data Analyst · Los Angeles, CA"
- Font: JetBrains Mono (`var(--font-mono)`)
- Size: 11px, uppercase, letter-spacing 4px
- Color: #999 (`var(--color-grey-2)`)

### Title
- Text: "Data that tells the real story"
- Font: Instrument Serif (`var(--font-display)`)
- Size: clamp(52px, 9vw, 120px)
- Color: white (`var(--color-white)`)
- "real story" wrapped in `<em>` or `<span>` with italic style and color #60a5fa (`var(--accent)`)

### Subtitle
- Text: "I build tested pipelines, causal analyses, and dashboards that turn messy data into clear, actionable insight."
- Font: Syne (`var(--font-body)`)
- Size: 17px
- Color: #777

### CTA Buttons
- Three buttons: GitHub, LinkedIn, Email Me
- Font: JetBrains Mono (`var(--font-mono)`) 12px
- Border: 1px solid #333
- Border-radius: 8px
- Padding: 14px 28px
- Hover: border color transitions to #60a5fa (`var(--accent)`)
- GitHub links to Aaron's GitHub profile
- LinkedIn links to Aaron's LinkedIn profile
- Email Me opens mailto: link

### Scroll Indicator
- Position: bottom center of hero section
- Text: "Scroll to explore" in 10px mono font
- Animated 1px vertical line below text

### Staggered Fade-in Animation
- CSS @keyframes, not JS
- Sequence with animation-delay:
  - Eyebrow: 0.5s delay
  - Title: 0.8s delay
  - Subtitle: 1.1s delay
  - CTAs: 1.3s delay
  - Scroll cue: 1.5s delay
- Each element fades in and translates up slightly

### Claude's Discretion
- Exact CTA link URLs (GitHub, LinkedIn, mailto)
- Fade-in animation duration and easing curve
- Subtitle color #777 is between --color-grey-1 (#ccc) and --color-grey-2 (#999) — use inline or add as CSS variable

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Foundation
- `CLAUDE.md` — Color palette, typography rules, file structure, conventions
- `.planning/REQUIREMENTS.md` — HERO-01 through HERO-06 requirement definitions
- `.planning/ROADMAP.md` — Phase 4 success criteria and dependencies

### Existing Code
- `index.html` — Current HTML shell with 8 scroll-snap sections (hero section exists as empty shell)
- `src/style.css` — All CSS including design tokens, must add hero styles here
- `src/main.js` — Entry point, may need updates for hero animation triggers
- `src/scroll.js` — Scroll detection system from Phase 3

</canonical_refs>

<specifics>
## Specific Ideas

- Globe from Phase 2 must remain visible behind hero content — hero content uses z-index layering
- All fonts already loaded via Google Fonts in index.html (Phase 1)
- CSS custom properties already defined for colors (Phase 1)
- Body minimum 16px rule — note eyebrow (11px), scroll text (10px), and CTA (12px) are intentionally smaller as decorative/UI elements, not body text

</specifics>

<deferred>
## Deferred Ideas

None — phase scope is fully defined.

</deferred>

---

*Phase: 04-hero-section*
*Context gathered: 2026-03-31 via inline user input*
