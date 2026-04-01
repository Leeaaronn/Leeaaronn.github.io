/**
 * Scroll module — continuous scroll progress, progress bar, dot navigation.
 * No scroll-snap. Single progress value (0-1) drives everything.
 */

/**
 * Initialize scroll detection, progress bar, and dot navigation.
 * @param {Object} options
 * @param {Function} options.onScroll - Callback receiving { progress: number }
 *   progress: 0 (top) to 1 (bottom) of the entire page
 */
export function initScroll({ onScroll } = {}) {
  const progressFill = document.getElementById('progress-fill');
  const dots = Array.from(document.querySelectorAll('.dot-nav__dot'));
  let currentDot = 'hero';

  // Dot progress ranges: hero 0-0.30, about 0.30-0.60, la-scene 0.60-1.0
  function getDotSection(progress) {
    if (progress < 0.30) return 'hero';
    if (progress < 0.60) return 'about';
    return 'la-scene';
  }

  function onScrollEvent() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? Math.max(0, Math.min(1, scrollTop / scrollHeight)) : 0;

    // Progress bar
    if (progressFill) {
      progressFill.style.width = (progress * 100) + '%';
    }

    // Dot nav
    const dotSection = getDotSection(progress);
    if (dotSection !== currentDot) {
      currentDot = dotSection;
      dots.forEach(dot => {
        dot.classList.toggle('dot-nav__dot--active', dot.dataset.section === currentDot);
      });
    }

    // Callback with progress
    if (onScroll) {
      onScroll({ progress });
    }
  }

  // Dot click → scroll to percentage
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const sectionId = dot.dataset.section;
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Listen on window (no scroll-snap, normal page scroll)
  window.addEventListener('scroll', onScrollEvent, { passive: true });

  // Fire once on load
  onScrollEvent();
}
