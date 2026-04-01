/**
 * Audio module — two tracks, both gated behind a user click:
 *   1. alien.mp3 — plays during loading screen only, fades out before main site
 *   2. astronaut.mp3 — created during click handler (same interaction context),
 *      played after loading screen finishes
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
 * Called inside the loading screen click handler (user interaction context).
 * Creates both Audio elements and starts alien.mp3 immediately.
 * astronaut.mp3 is created now (to satisfy autoplay policy) but not played yet.
 */
export function initAudioOnClick() {
  try {
    alienAudio = new Audio('/assets/audio/alien.mp3');
    alienAudio.loop = false;
    alienAudio.volume = (sliderValue / 100) * MAX_GAIN;
    alienAudio.play().catch(() => {});
  } catch (e) { /* audio is optional */ }

  // Pre-create main audio in this same user-interaction context
  try {
    mainAudio = new Audio('/assets/audio/astronaut.mp3');
    mainAudio.loop = false;
    mainAudio.preload = 'auto';
    applyMainVolume();
  } catch (e) { /* audio is optional */ }
}

/**
 * Fade out alien.mp3 starting now, silent in ~1s.
 */
export function fadeOutLoadingAudio() {
  if (!alienAudio) return;
  const startVol = alienAudio.volume;
  const fadeSteps = 20;
  const fadeInterval = 1000 / fadeSteps;
  let step = 0;
  alienFadeInterval = setInterval(() => {
    step++;
    try {
      alienAudio.volume = Math.max(0, startVol * (1 - step / fadeSteps));
    } catch (e) { /* ignore */ }
    if (step >= fadeSteps) {
      clearInterval(alienFadeInterval);
      alienFadeInterval = null;
      try { alienAudio.pause(); alienAudio.currentTime = 0; } catch (e) { /* ignore */ }
    }
  }, fadeInterval);
}

/**
 * Start astronaut.mp3 for the main site. Called after loading screen finishes.
 * The Audio element was already created during the click handler.
 */
export function startMainAudio() {
  if (alienFadeInterval) { clearInterval(alienFadeInterval); alienFadeInterval = null; }
  if (alienAudio) {
    try { alienAudio.pause(); alienAudio.currentTime = 0; } catch (e) { /* ignore */ }
  }

  if (!mainAudio) return;
  applyMainVolume();
  try { mainAudio.play().catch(() => {}); } catch (e) { /* audio is optional */ }
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
