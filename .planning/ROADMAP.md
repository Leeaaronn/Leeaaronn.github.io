# Roadmap — Portfolio Website v1.0

## Phase 1: Scaffold, Globe, Hero & About
**Goal:** Set up Vite project, global styles, persistent star field, 3D Earth globe with real texture, scroll-snap system, hero section, and about section. Site is browsable with two complete sections.

**Scope:**
1. Vite project scaffold (package.json, vite.config.js, index.html, .gitignore)
2. CLAUDE.md with project rules
3. Global CSS: custom properties, font imports (Instrument Serif, Syne, JetBrains Mono), reset, base styles
4. Persistent star field background — fixed canvas with thousands of white dots, subtle drift, visible on ALL sections
5. Three.js 3D Earth globe — real NASA Blue Marble texture from CDN, atmospheric glow (#60a5fa), LA marker (34.05°N, 118.25°W), smooth rotation
6. Scroll-snap container with progress bar and dot navigation
7. Floating nav bar — semi-transparent, "AARON LEE" left, section links + resume link right
8. Hero section — eyebrow text, title ("Data that tells the real story"), subtitle, CTA buttons (GitHub, LinkedIn, Email), scroll indicator
9. About section — portrait (./assets/portrait.jpg), bio, stats row, detail chips, resume download, globe zooms to LA on scroll

**Success:** `npm run dev` serves a working site. Hero and About sections render correctly. Globe shows real Earth texture. Stars visible on all sections. Scroll-snap works between sections. Portrait loads.

## Phase 2: Projects, Skills, Contact & Deploy
**Goal:** Build remaining sections (project panels, skills visualization, contact form), add GSAP animations, and deploy to GitHub Pages.

**Scope:**
- Project showcase panels
- Skills section with visual representation
- Contact section
- GSAP scroll-triggered animations
- GitHub Pages deployment pipeline

**Success:** Full portfolio live at leeaaronn.github.io with all five sections.
