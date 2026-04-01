/**
 * Audio module — two tracks:
 *   1. alien.mp3 — plays during loading screen only, fades out before main site
 *   2. astronaut.mp3 — plays across all sections after loading screen finishes
 */

let alienAudio = null;
let mainAudio = null;
let sliderValue = 15; // 0-100
let alienFadeInterval = null;

const MAX_GAIN = 0.15;

function applyMainVolume() {
  if (!mainAudio) return;
  mainAudio.volume = (sliderValue / 100) * MAX_GAIN;
}

/**
 * Start alien.mp3 for the loading screen.
 * Fades out starting at 3.5s, silent by 4.5s.
 */
export function startLoadingAudio() {
  alienAudio = new Audio('./assets/audio/alien.mp3');
  alienAudio.loop = false;
  alienAudio.volume = (sliderValue / 100) * MAX_GAIN;

  // Try autoplay immediately
  alienAudio.play().catch(() => {});

  // Fallback: start on first interaction
  let started = false;
  const tryPlay = () => {
    if (started || !alienAudio.paused) { started = true; return; }
    started = true;
    alienAudio.play().catch(() => {});
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('keydown', tryPlay);
    document.removeEventListener('scroll', tryPlay);
  };
  document.addEventListener('click', tryPlay);
  document.addEventListener('keydown', tryPlay);
  document.addEventListener('scroll', tryPlay);

  // Fade out alien audio: start at 3.5s, fully silent by 4.5s
  const startVol = alienAudio.volume;
  setTimeout(() => {
    const fadeSteps = 20;
    const fadeInterval = 1000 / fadeSteps; // 50ms steps over 1s
    let step = 0;
    alienFadeInterval = setInterval(() => {
      step++;
      alienAudio.volume = Math.max(0, startVol * (1 - step / fadeSteps));
      if (step >= fadeSteps) {
        clearInterval(alienFadeInterval);
        alienAudio.pause();
        alienAudio.currentTime = 0;
      }
    }, fadeInterval);
  }, 3500);
}

/**
 * Start astronaut.mp3 for the main site. Called after loading screen finishes.
 */
export function startMainAudio() {
  // Clean up alien audio fade if still running
  if (alienFadeInterval) { clearInterval(alienFadeInterval); alienFadeInterval = null; }
  if (alienAudio) { alienAudio.pause(); alienAudio.currentTime = 0; }

  mainAudio = new Audio('./assets/audio/astronaut.mp3');
  mainAudio.loop = false;
  applyMainVolume();
  mainAudio.play().catch(() => {});
}

/**
 * Build and attach the volume slider UI. Controls astronaut.mp3 only.
 */
export function initAudioSlider() {
  const pill = document.createElement('div');
  pill.className = 'volume-pill';

  const icon = document.createElement('span');
  icon.className = 'volume-pill__icon';
  icon.textContent = '\u{1F50A}';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = String(sliderValue);
  slider.className = 'volume-pill__slider';

  slider.addEventListener('input', () => {
    sliderValue = Number(slider.value);
    icon.textContent = sliderValue === 0 ? '\u{1F507}' : '\u{1F50A}';
    applyMainVolume();
  });

  pill.appendChild(icon);
  pill.appendChild(slider);
  document.body.appendChild(pill);
}
