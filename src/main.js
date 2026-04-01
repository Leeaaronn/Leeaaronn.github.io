import './style.css'
import { initGlobe } from './globe.js'
import { initStars } from './stars.js'
import { initScroll } from './scroll.js'
import { decipherText, decipherAll, decipherOnReveal } from './decipher.js'
import { initParticles } from './particles.js'
import { initAudioOnClick, fadeOutLoadingAudio, startMainAudio, initAudioSlider } from './audio.js'

document.addEventListener('DOMContentLoaded', () => {
  // ── Loading screen — wait for user click before starting ──
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar-fill');
  const loadingText = document.getElementById('loading-text');

  // Shooting stars on loading screen
  const loadingShootingContainer = document.createElement('div');
  loadingShootingContainer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;';
  if (loadingScreen) loadingScreen.appendChild(loadingShootingContainer);

  function spawnLoadingStar() {
    const star = document.createElement('div');
    const startX = Math.random() * 100;
    const startY = Math.random() * 40;
    const length = 80 + Math.random() * 120;
    const angle = 30 + Math.random() * 30;
    const duration = 0.6 + Math.random() * 0.6;

    star.style.cssText = `
      position:absolute;
      top:${startY}%;
      left:${startX}%;
      width:${length}px;
      height:1px;
      background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8) 30%, rgba(255,255,255,1));
      --angle:${angle}deg;
      transform:rotate(${angle}deg);
      opacity:0;
      animation:shooting-star-move ${duration}s ease-in forwards;
    `;
    loadingShootingContainer.appendChild(star);
    setTimeout(() => star.remove(), duration * 1000 + 100);
  }

  // Inject shooting star keyframes (needed before main stars.js loads)
  const shootingStyle = document.createElement('style');
  shootingStyle.textContent = `
    @keyframes shooting-star-move {
      0% { opacity: 0; transform: rotate(var(--angle, 35deg)) translateX(0); }
      10% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; transform: rotate(var(--angle, 35deg)) translateX(300px); }
    }
  `;
  document.head.appendChild(shootingStyle);

  // Spawn shooting stars while waiting for click
  let loadingStarsActive = true;
  function scheduleLoadingStar() {
    if (!loadingStarsActive) return;
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      if (!loadingStarsActive) return;
      spawnLoadingStar();
      scheduleLoadingStar();
    }, delay);
  }
  spawnLoadingStar();
  scheduleLoadingStar();

  // Show "CLICK TO ENTER" with decipher effect
  if (loadingText) {
    loadingText.textContent = 'CLICK TO ENTER';
    decipherText(loadingText, { cycleSpeed: 60 });
  }

  // Add click prompt styling
  if (loadingScreen) loadingScreen.style.cursor = 'pointer';

  // ── Wait for user click to start everything ──
  function onLoadingClick() {
    if (!loadingScreen) return;
    loadingScreen.removeEventListener('click', onLoadingClick);
    loadingScreen.style.cursor = 'default';

    // 1. Start alien.mp3 + pre-create astronaut.mp3 (user interaction context)
    initAudioOnClick();

    // 2. Start loading bar animation
    if (loadingBar) loadingBar.style.width = '100%';

    // 3. Change text to "INITIALIZING..." with decipher
    if (loadingText) {
      loadingText.textContent = 'INITIALIZING...';
      decipherText(loadingText, { cycleSpeed: 60 });
    }

    // 4. Fade out alien audio starting at 3.5s
    setTimeout(() => fadeOutLoadingAudio(), 3500);

    // 5. After 4s: fade out loading screen, then start the site
    setTimeout(() => {
      loadingStarsActive = false;
      if (loadingScreen) loadingScreen.classList.add('loading-screen--hidden');

      // After fade-out transition (0.5s), remove and start site
      setTimeout(() => {
        if (loadingScreen) loadingScreen.style.display = 'none';
        initSite();
      }, 500);
    }, 4000);
  }

  if (loadingScreen) loadingScreen.addEventListener('click', onLoadingClick);
});

function initSite() {
  // Trigger hero fade-in animations now that loading screen is gone
  const heroEl = document.getElementById('hero');
  if (heroEl) heroEl.classList.add('hero--visible');

  initStars();
  initGlobe();
  startMainAudio();
  initAudioSlider();

  // DOM refs for scroll-driven content transitions
  const heroContent = document.querySelector('.hero__content');
  const aboutContent = document.querySelector('.about__content');
  const laContent = document.querySelector('.la-scene__content');

  // Throttle scroll updates to animation frames for smoothness
  let rafId = null;
  let latestProgress = 0;

  const isMobile = window.innerWidth <= 768;

  function applyScrollVisuals(progress) {
    // On mobile, all sections visible — no scroll-driven opacity
    if (isMobile) return;

    // ── Hero content: visible 0-0.28, fade out 0.28-0.35 ──
    if (heroContent) {
      if (progress < 0.28) {
        heroContent.style.opacity = '1';
      } else if (progress < 0.35) {
        heroContent.style.opacity = String(1 - ((progress - 0.28) / 0.07));
      } else {
        heroContent.style.opacity = '0';
      }
    }

    // ── About content: fade in 0.28-0.35, visible 0.35-0.62, fade out 0.62-0.70 ──
    if (aboutContent) {
      if (progress < 0.28) {
        aboutContent.style.opacity = '0';
      } else if (progress < 0.35) {
        aboutContent.style.opacity = String((progress - 0.28) / 0.07);
      } else if (progress < 0.62) {
        aboutContent.style.opacity = '1';
      } else if (progress < 0.70) {
        aboutContent.style.opacity = String(1 - ((progress - 0.62) / 0.08));
      } else {
        aboutContent.style.opacity = '0';
      }
    }

    // ── LA content: fade in 0.68-0.75, visible 0.75+ ──
    if (laContent) {
      if (progress < 0.68) {
        laContent.style.opacity = '0';
      } else if (progress < 0.75) {
        laContent.style.opacity = String((progress - 0.68) / 0.07);
      } else {
        laContent.style.opacity = '1';
      }
    }
  }

  // On mobile, ensure all sections are visible (no inline opacity overrides)
  if (isMobile) {
    if (heroContent) heroContent.style.opacity = '1';
    if (aboutContent) aboutContent.style.opacity = '1';
    if (laContent) laContent.style.opacity = '1';
  }

  // ── Particle network — interactive lines following cursor ──
  initParticles();

  // ── Decipher text animations ──

  // Nav — decipher immediately after loading screen
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

  // ── UFO cursor avoidance (desktop only) ──
  if (!isMobile) {
    const ufo = document.querySelector('.ufo');
    if (ufo) {
      let mouseX = -9999, mouseY = -9999;
      let offsetX = 0, offsetY = 0;
      let currentOffsetX = 0, currentOffsetY = 0;
      let currentRotate = 0;
      const FLEE_RADIUS = 200;
      const FLEE_DISTANCE = 90;
      const LERP_SPEED = 0.08;
      const RETURN_SPEED = 0.04;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function ufoAvoidLoop() {
        const rect = ufo.getBoundingClientRect();
        const ufoCX = rect.left + rect.width / 2;
        const ufoCY = rect.top + rect.height / 2;

        const dx = ufoCX - mouseX;
        const dy = ufoCY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < FLEE_RADIUS && dist > 0) {
          const angle = Math.atan2(dy, dx);
          const strength = 1 - (dist / FLEE_RADIUS);
          offsetX = Math.cos(angle) * FLEE_DISTANCE * strength;
          offsetY = Math.sin(angle) * FLEE_DISTANCE * strength;
        } else {
          offsetX = 0;
          offsetY = 0;
        }

        currentOffsetX += (offsetX - currentOffsetX) * (offsetX !== 0 ? LERP_SPEED : RETURN_SPEED);
        currentOffsetY += (offsetY - currentOffsetY) * (offsetX !== 0 ? LERP_SPEED : RETURN_SPEED);

        const targetRotate = currentOffsetX !== 0 || currentOffsetY !== 0
          ? Math.atan2(currentOffsetY, currentOffsetX) * (180 / Math.PI) * 0.15
          : 0;
        currentRotate += (targetRotate - currentRotate) * 0.06;

        if (Math.abs(currentOffsetX) > 0.1 || Math.abs(currentOffsetY) > 0.1 || Math.abs(currentRotate) > 0.05) {
          ufo.style.translate = `${currentOffsetX}px ${currentOffsetY}px`;
          ufo.style.rotate = `${currentRotate}deg`;
        } else {
          ufo.style.translate = '';
          ufo.style.rotate = '';
        }

        requestAnimationFrame(ufoAvoidLoop);
      }
      requestAnimationFrame(ufoAvoidLoop);
    }
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
}
