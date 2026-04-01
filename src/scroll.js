/**
 * Scroll module — centralized scroll detection, progress bar, dot navigation.
 * Drives both UI updates and globe behavior via onScroll callback.
 */

/**
 * Initialize scroll detection, progress bar, and dot navigation.
 * @param {Object} options
 * @param {Function} options.onScroll - Callback receiving { activeSection: string, progress: number }
 */
export function initScroll({ onScroll } = {}) {
  const sections = Array.from(document.querySelectorAll('.section'));
  const progressFill = document.getElementById('progress-fill');
  const dots = Array.from(document.querySelectorAll('.dot-nav__dot'));
  let currentActive = 'hero';

  function getScrollState() {
    // Use whichever element is actually scrolling (body or documentElement)
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    const scrollHeight = Math.max(
      document.body.scrollHeight - document.body.clientHeight,
      document.documentElement.scrollHeight - document.documentElement.clientHeight
    );

    // Overall scroll progress (0 to 1) for the progress bar
    const overallProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    // Active section detection
    const viewportHeight = window.innerHeight;
    let activeSection = 'hero';
    let sectionProgress = 0;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5) {
        activeSection = section.id;
        sectionProgress = Math.max(0, Math.min(1, -rect.top / viewportHeight));
        break;
      }
    }

    // Find section index (0-based) for progressive zoom
    const sectionIndex = sections.findIndex(s => s.id === activeSection);

    return { activeSection, progress: sectionProgress, overallProgress, sectionIndex };
  }

  function updateUI(state) {
    // Progress bar (SCRL-02)
    if (progressFill) {
      progressFill.style.width = (state.overallProgress * 100) + '%';
    }

    // Dot nav active state (SCRL-03)
    if (state.activeSection !== currentActive) {
      currentActive = state.activeSection;
      dots.forEach(dot => {
        const isActive = dot.dataset.section === currentActive;
        dot.classList.toggle('dot-nav__dot--active', isActive);
      });
    }
  }

  function onScrollEvent() {
    const state = getScrollState();
    updateUI(state);
    if (onScroll) {
      onScroll({ activeSection: state.activeSection, progress: state.progress, overallProgress: state.overallProgress, sectionIndex: state.sectionIndex });
    }
  }

  // Dot click → scroll to section (SCRL-03)
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const sectionId = dot.dataset.section;
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Section fade-up triggers
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'about') {
            entry.target.classList.add('about-visible');
          } else if (entry.target.id === 'la-scene') {
            entry.target.classList.add('la-scene-visible');
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  const aboutSection = document.getElementById('about');
  const laSceneSection = document.getElementById('la-scene');
  if (aboutSection) fadeObserver.observe(aboutSection);
  if (laSceneSection) fadeObserver.observe(laSceneSection);

  // Listen on both body and window to catch scroll events regardless of browser behavior
  document.body.addEventListener('scroll', onScrollEvent, { passive: true });
  window.addEventListener('scroll', onScrollEvent, { passive: true });

  // Fire once on load to set initial state
  onScrollEvent();
}
