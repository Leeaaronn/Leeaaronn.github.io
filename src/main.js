import './style.css'
import { initGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'

// Phase 2: initialize stars when DOM is ready
// Globe (initGlobe) and scroll (initScroll) implemented in subsequent Phase 2 plans
document.addEventListener('DOMContentLoaded', () => {
  initStars();
});
