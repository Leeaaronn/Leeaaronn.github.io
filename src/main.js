import './style.css'
import { initGlobe, updateGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'

document.addEventListener('DOMContentLoaded', () => {
  // Phase 2: Canvas layers
  initStars();
  initGlobe();

  // Cached DOM refs for scroll-driven transitions
  const starsCanvas = document.getElementById('stars-canvas');
  const shootingStars = document.getElementById('shooting-stars');
  const laScene = document.getElementById('la-scene');

  // Phase 3: Scroll shell — centralized scroll detection
  initScroll({
    onScroll: (state) => {
      updateGlobe(state);

      // Scroll-driven space → LA sky crossfade
      if (state.activeSection === 'la-scene') {
        // progress 0→0.5: space fades out, sky fades in
        // progress 0.5→1: fully in LA scene
        const skyProgress = Math.min(state.progress / 0.5, 1);

        // Fade out stars and shooting stars
        if (starsCanvas) starsCanvas.style.opacity = String(1 - skyProgress);
        if (shootingStars) shootingStars.style.opacity = String(1 - skyProgress);

        // Drive CSS sky transition via custom property
        if (laScene) laScene.style.setProperty('--sky-progress', skyProgress);
      } else {
        // Stars fully visible on hero and about
        if (starsCanvas) starsCanvas.style.opacity = '1';
        if (shootingStars) shootingStars.style.opacity = '1';
        if (laScene) laScene.style.setProperty('--sky-progress', 0);
      }
    },
  });
});
