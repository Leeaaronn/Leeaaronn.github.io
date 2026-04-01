/**
 * Stars module — fixed-position Three.js star field with drift animation.
 * Renders 3000 white dots on a transparent canvas behind all page content.
 * Visible on ALL sections (z-index 0, non-interactive).
 */
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
} from 'three';

export function initStars() {
  // Renderer — transparent background so body's black shows through
  const renderer = new WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Fixed canvas — behind all content, non-interactive
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '0';
  renderer.domElement.style.pointerEvents = 'none';

  renderer.domElement.id = 'stars-canvas';
  renderer.domElement.style.transition = 'opacity 0.6s ease';
  document.body.appendChild(renderer.domElement);

  // Scene + camera
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 1;

  // Star geometry — 3000 stars distributed in a cube around origin
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

  // Material — white dots with size attenuation
  const material = new PointsMaterial({
    color: 0xffffff,
    size: 0.003,
    sizeAttenuation: true,
  });

  // Points mesh added to scene
  const points = new Points(geometry, material);
  scene.add(points);

  // Animation loop — subtle drift rotation (STAR-02)
  function animate() {
    points.rotation.y += 0.0001;
    points.rotation.x += 0.00005;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  // Shooting stars — CSS-animated diagonal streaks on a DOM overlay
  const shootingContainer = document.createElement('div');
  shootingContainer.id = 'shooting-stars';
  shootingContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;transition:opacity 0.6s ease;';
  document.body.appendChild(shootingContainer);

  function spawnShootingStar() {
    const star = document.createElement('div');
    const startX = Math.random() * 100;
    const startY = Math.random() * 40;
    const length = 80 + Math.random() * 120;
    const angle = 30 + Math.random() * 30; // 30-60 degrees diagonal
    const duration = 0.6 + Math.random() * 0.6;

    star.style.cssText = `
      position: absolute;
      top: ${startY}%;
      left: ${startX}%;
      width: ${length}px;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8) 30%, rgba(255,255,255,1));
      transform: rotate(${angle}deg);
      opacity: 0;
      animation: shooting-star-move ${duration}s ease-in forwards;
    `;

    shootingContainer.appendChild(star);
    setTimeout(() => star.remove(), duration * 1000 + 100);
  }

  // Inject shooting star keyframes
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes shooting-star-move {
      0% { opacity: 0; transform: rotate(var(--angle, 35deg)) translateX(0); }
      10% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; transform: rotate(var(--angle, 35deg)) translateX(300px); }
    }
  `;
  document.head.appendChild(styleEl);

  // Spawn at random intervals (3-5 seconds)
  function scheduleNext() {
    const delay = 3000 + Math.random() * 2000;
    setTimeout(() => {
      spawnShootingStar();
      scheduleNext();
    }, delay);
  }
  // First one after a short delay
  setTimeout(() => {
    spawnShootingStar();
    scheduleNext();
  }, 1500);

  // Resize handler — keep canvas full viewport
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
