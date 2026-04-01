/**
 * Audio module — plays alien.mp3 on hero section, volume slider UI.
 * Playback starts on first user interaction (autoplay policy).
 */

let audio = null;
let sliderValue = 15; // 0-100
let scrollFade = 1;   // 0-1 based on scroll position
let started = false;
let ended = false;

function applyVolume() {
  if (!audio) return;
  audio.volume = (sliderValue / 100) * 0.15 * scrollFade;
}

/**
 * Update the scroll-based fade for hero audio.
 * Called from the scroll handler in main.js.
 *   0-0.25:   full volume
 *   0.25-0.35: fade out
 *   0.35+:     silent & paused
 */
export function updateAudioScroll(progress) {
  if (ended) return;

  if (progress < 0.25) {
    scrollFade = 1;
    if (audio && audio.paused && started) audio.play().catch(() => {});
  } else if (progress < 0.35) {
    scrollFade = 1 - ((progress - 0.25) / 0.10);
    if (audio && audio.paused && started) audio.play().catch(() => {});
  } else {
    scrollFade = 0;
    if (audio && !audio.paused) audio.pause();
  }
  applyVolume();
}

/**
 * Initialize audio element and volume slider UI.
 */
export function initAudio() {
  audio = new Audio('./assets/audio/alien.mp3');
  audio.loop = false;
  audio.volume = 0;
  audio.addEventListener('ended', () => { ended = true; });

  // Start playback on first user interaction
  const tryPlay = () => {
    if (started) return;
    started = true;
    applyVolume();
    audio.play().catch(() => {});
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('keydown', tryPlay);
    document.removeEventListener('scroll', tryPlay);
  };
  document.addEventListener('click', tryPlay);
  document.addEventListener('keydown', tryPlay);
  document.addEventListener('scroll', tryPlay);

  // Build slider UI
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
    applyVolume();
  });

  pill.appendChild(icon);
  pill.appendChild(slider);
  document.body.appendChild(pill);
}
