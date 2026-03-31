import './style.css'
import { initGlobe, updateGlobe } from './globe.js'
import { initStars } from './stars.js'
// import { initScroll } from './scroll.js'  // Phase 3: scroll detection, dot nav, progress bar

document.addEventListener('DOMContentLoaded', () => {
  // Phase 2: Canvas layers
  initStars();
  initGlobe();

  // Scroll-driven globe behavior
  // Body is the scroll container (scroll-snap-type y mandatory)
  const sections = Array.from(document.querySelectorAll('.section'));

  function getScrollState() {
    const viewportHeight = window.innerHeight;

    // Find which section is most visible
    let activeSection = 'hero';
    let progress = 0;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      // Section is "active" when its top is within half a viewport of the top
      if (rect.top <= viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5) {
        activeSection = section.id;
        // Progress: 0 when section top is at viewport top, 1 when section bottom is at viewport top
        progress = Math.max(0, Math.min(1, -rect.top / viewportHeight));
        break;
      }
    }

    return { activeSection, progress };
  }

  // Use body scroll since body is the snap container
  document.body.addEventListener('scroll', () => {
    const state = getScrollState();
    updateGlobe(state);
  }, { passive: true });

  // Fire once on load to set initial hero state
  updateGlobe(getScrollState());

  // Phase 3: scroll UI (still a stub)
  // initScroll();
});
