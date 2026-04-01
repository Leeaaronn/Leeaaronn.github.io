/**
 * Audio module — plays alien.mp3 once across all sections, volume slider UI.
 * Playback starts on first user interaction (autoplay policy).
 */

let audio = null;
let sliderValue = 15; // 0-100

function applyVolume() {
  if (!audio) return;
  audio.volume = (sliderValue / 100) * 0.15;
}

/**
 * Initialize audio element and volume slider UI.
 */
export function initAudio() {
  audio = new Audio('./assets/audio/alien.mp3');
  audio.loop = false;
  audio.volume = 0;

  // Start playback on first user interaction
  let started = false;
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
