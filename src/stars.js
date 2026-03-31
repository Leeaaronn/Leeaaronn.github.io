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

  // Resize handler — keep canvas full viewport
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
