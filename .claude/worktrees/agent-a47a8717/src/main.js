import './style.css'
import { initGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'

// Initialize canvas layers and scroll behavior when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initStars();   // Phase 2: persistent star field background
  initGlobe();   // Phase 2: Three.js Earth globe
  initScroll();  // Phase 3: scroll detection, dot nav, progress bar
});
