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
        // On the last section with scroll-snap mandatory, progress may stay 0
        // because there's nowhere further to scroll. Force full sky when snapped.
        const skyProgress = 1;

        // Fade out stars and shooting stars
        if (starsCanvas) starsCanvas.style.opacity = '0';
        if (shootingStars) shootingStars.style.opacity = '0';

        // Drive CSS sky transition via custom property
        if (laScene) laScene.style.setProperty('--sky-progress', '1');
      } else if (state.activeSection === 'about' && state.progress > 0.6) {
        // Start the transition early — as user approaches end of about section,
        // begin fading in the sky and fading out stars
        const earlyProgress = (state.progress - 0.6) / 0.4; // 0→1 over last 40% of about

        if (starsCanvas) starsCanvas.style.opacity = String(1 - earlyProgress * 0.5);
        if (shootingStars) shootingStars.style.opacity = String(1 - earlyProgress * 0.5);
        if (laScene) laScene.style.setProperty('--sky-progress', String(earlyProgress * 0.3));
      } else {
        // Stars fully visible on hero and about
        if (starsCanvas) starsCanvas.style.opacity = '1';
        if (shootingStars) shootingStars.style.opacity = '1';
        if (laScene) laScene.style.setProperty('--sky-progress', '0');
      }
    },
  });
});
