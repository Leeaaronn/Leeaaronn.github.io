import './style.css'
import { initGlobe, updateGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'

document.addEventListener('DOMContentLoaded', () => {
  // Phase 2: Canvas layers
  initStars();
  initGlobe();

  // Phase 3: Scroll shell — centralized scroll detection
  // Passes updateGlobe as callback so scroll.js drives globe + UI from a single listener
  initScroll({
    onScroll: (state) => updateGlobe(state),
  });
});
