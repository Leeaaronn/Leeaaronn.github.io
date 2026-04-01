import './style.css'
import { initGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'
import { decipherText, decipherAll, decipherOnReveal } from './decipher.js'
import { initParticles } from './particles.js'
import { initAudio, updateAudioScroll } from './audio.js'

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initGlobe();
  initAudio();

  // DOM refs for scroll-driven content transitions
  const heroContent = document.querySelector('.hero__content');
  const aboutContent = document.querySelector('.about__content');
  const laContent = document.querySelector('.la-scene__content');

  // Throttle scroll updates to animation frames for smoothness
  let rafId = null;
  let latestProgress = 0;

  function applyScrollVisuals(progress) {
    updateAudioScroll(progress);

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

    // ── About content: fade in 0.30-0.38, visible 0.38-0.58, fade out 0.58-0.65 ──
    if (aboutContent) {
      if (progress < 0.30) {
        aboutContent.style.opacity = '0';
      } else if (progress < 0.38) {
        aboutContent.style.opacity = String((progress - 0.30) / 0.08);
      } else if (progress < 0.58) {
        aboutContent.style.opacity = '1';
      } else if (progress < 0.65) {
        aboutContent.style.opacity = String(1 - ((progress - 0.58) / 0.07));
      } else {
        aboutContent.style.opacity = '0';
      }
    }

    // ── LA content: fade in 0.65-0.73, visible 0.73+ ──
    if (laContent) {
      if (progress < 0.65) {
        laContent.style.opacity = '0';
      } else if (progress < 0.73) {
        laContent.style.opacity = String((progress - 0.65) / 0.08);
      } else {
        laContent.style.opacity = '1';
      }
    }
  }

  // ── Particle network — interactive lines following cursor ──
  initParticles();

  // ── Decipher text animations ──

  // Nav — decipher immediately on page load
  const navTextEls = document.querySelectorAll('.nav-bar__logo, .nav-bar__link');
  decipherAll(navTextEls, { stagger: 100 });

  // Hero — all text elements, triggered on scroll reveal
  const heroSection = document.getElementById('hero');
  const heroTextEls = heroSection.querySelectorAll('.hero__eyebrow, .hero__title, .hero__subtitle, .hero__cta');
  decipherOnReveal(heroSection, heroTextEls, { stagger: 120 });

  // About — heading, bios, stat values/labels, chip labels/values, resume button
  const aboutSection = document.getElementById('about');
  const aboutTextEls = aboutSection.querySelectorAll(
    '.about__heading, .about__bio, .about__stat-value, .about__stat-label, ' +
    '.about__chip-label, .about__chip-value, .about__resume-btn'
  );
  decipherOnReveal(aboutSection, aboutTextEls, { stagger: 30, cycleSpeed: 45 });

  // LA scene — heading, card titles, contact buttons, footer
  const laSection = document.getElementById('la-scene');
  const laTextEls = laSection.querySelectorAll(
    '.la-scene__tagline, .la-scene__heading, .la-scene__card-title, .la-scene__card-action, .la-scene__contact .hero__cta, .la-scene__footer'
  );
  decipherOnReveal(laSection, laTextEls, { stagger: 100 });

  // ── Counter animation on about stats ──
  const statsRow = document.querySelector('.about__stats');
  if (statsRow) {
    const statValues = statsRow.querySelectorAll('.about__stat-value');
    const counterConfigs = [
      null,                     // "B.S. CS" — text, no counter
      { target: 4, suffix: '', duration: 800 },
      { target: 40, suffix: 'K+', duration: 1200 },
      { target: 6, suffix: '', duration: 800 },
    ];

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function animateCounter(el, { target, suffix, duration }) {
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const value = Math.round(easeOutQuart(t) * target);
        el.textContent = value + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const statsObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          statsObserver.disconnect();
          statValues.forEach((el, i) => {
            if (counterConfigs[i]) animateCounter(el, counterConfigs[i]);
          });
        }
      }
    }, { threshold: 0.3 });

    statsObserver.observe(statsRow);
  }

  initScroll({
    onScroll: ({ progress }) => {
      latestProgress = progress;
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          applyScrollVisuals(latestProgress);
        });
      }
    },
  });
});
