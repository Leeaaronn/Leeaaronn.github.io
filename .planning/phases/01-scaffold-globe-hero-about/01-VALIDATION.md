---
phase: 1
slug: scaffold-globe-hero-about
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser verification (no test framework in Phase 1) |
| **Config file** | none |
| **Quick run command** | `npm run dev` + visual check |
| **Full suite command** | `npm run build && npx serve dist` |
| **Estimated runtime** | ~5 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and visually verify
- **After every plan wave:** Run `npm run build` to catch build errors
- **Before `/gsd:verify-work`:** Full build must succeed, dev server renders correctly
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | Scaffold | build | `npm run build` | ❌ W0 | ⬜ pending |
| 02-01 | 02 | 1 | CSS/Fonts | build | `npm run build` | ❌ W0 | ⬜ pending |
| 03-01 | 03 | 2 | Stars | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 04-01 | 04 | 2 | Globe | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 05-01 | 05 | 3 | Scroll | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 06-01 | 06 | 3 | Nav | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 07-01 | 07 | 4 | Hero | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 08-01 | 08 | 4 | About | visual | `npm run dev` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install` — install three.js and vite dependencies
- [ ] `npm run dev` — dev server starts without errors

*Existing infrastructure covers remaining requirements through build verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Globe shows real Earth texture | D-05 | Visual/texture verification | Open dev server, confirm Blue Marble texture visible on sphere |
| Stars visible on all sections | D-01 | Visual across scroll positions | Scroll through all sections, confirm star canvas behind content |
| Portrait loads correctly | D-08 | Image path verification | Navigate to About section, confirm portrait.jpg renders |
| Font rendering | D-07 | Visual typography check | Inspect headings (Instrument Serif), body (Syne), labels (JetBrains Mono) |
| Color compliance | D-06 | No green/purple/orange | Visual scan of all elements for color violations |
| Scroll-snap behavior | D-03 | Interaction verification | Scroll between sections, confirm mandatory snap |

---

## Validation Sign-Off

- [ ] All tasks have visual verify or build verification
- [ ] Sampling continuity: every task verified via dev server
- [ ] Wave 0 covers npm install and dev server startup
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
