import './style.css'
import { initGlobe, updateGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initGlobe();

  // DOM refs for scroll-driven transitions
  const starsCanvas = document.getElementById('stars-canvas');
  const shootingStars = document.getElementById('shooting-stars');
  const laPhoto = document.getElementById('la-photo');
  const heroContent = document.querySelector('.hero__content');
  const aboutContent = document.querySelector('.about__content');
  const laContent = document.querySelector('.la-scene__content');

  initScroll({
    onScroll: ({ progress }) => {
      // Drive globe zoom + fade
      updateGlobe({ progress });

      // ── Stars fade: visible 0-0.60, fade out 0.60-0.70, gone after 0.70 ──
      if (progress < 0.60) {
        if (starsCanvas) starsCanvas.style.opacity = '1';
        if (shootingStars) shootingStars.style.opacity = '1';
      } else if (progress < 0.70) {
        const starFade = 1 - ((progress - 0.60) / 0.10);
        if (starsCanvas) starsCanvas.style.opacity = String(starFade);
        if (shootingStars) shootingStars.style.opacity = String(starFade);
      } else {
        if (starsCanvas) starsCanvas.style.opacity = '0';
        if (shootingStars) shootingStars.style.opacity = '0';
      }

      // ── LA photo crossfade: fade in 0.60-0.80, fully visible 0.80+ ──
      if (laPhoto) {
        if (progress < 0.60) {
          laPhoto.style.opacity = '0';
        } else if (progress < 0.80) {
          laPhoto.style.opacity = String((progress - 0.60) / 0.20);
        } else {
          laPhoto.style.opacity = '1';
        }
      }

      // ── Hero content: visible 0-0.20, fade out 0.20-0.30 ──
      if (heroContent) {
        if (progress < 0.20) {
          heroContent.style.opacity = '1';
        } else if (progress < 0.30) {
          heroContent.style.opacity = String(1 - ((progress - 0.20) / 0.10));
        } else {
          heroContent.style.opacity = '0';
        }
      }

      // ── About content: fade in 0.30-0.38, visible 0.38-0.55, fade out 0.55-0.62 ──
      if (aboutContent) {
        if (progress < 0.30) {
          aboutContent.style.opacity = '0';
        } else if (progress < 0.38) {
          aboutContent.style.opacity = String((progress - 0.30) / 0.08);
        } else if (progress < 0.55) {
          aboutContent.style.opacity = '1';
        } else if (progress < 0.62) {
          aboutContent.style.opacity = String(1 - ((progress - 0.55) / 0.07));
        } else {
          aboutContent.style.opacity = '0';
        }
      }

      // ── LA content: fade in 0.80-0.88, visible 0.88+ ──
      if (laContent) {
        if (progress < 0.80) {
          laContent.style.opacity = '0';
        } else if (progress < 0.88) {
          laContent.style.opacity = String((progress - 0.80) / 0.08);
        } else {
          laContent.style.opacity = '1';
        }
      }
    },
  });
});
