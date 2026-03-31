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

  // Shooting stars — occasional diagonal streaks
  const shootingStars = [];
  const SHOOTING_STAR_INTERVAL = 3500; // ms between spawns (avg)
  let lastShootingStar = 0;

  function spawnShootingStar(time) {
    // Random start position at edges of view
    const startX = (Math.random() - 0.3) * 1.6;
    const startY = 0.4 + Math.random() * 0.4;
    const startZ = -0.5 + Math.random() * 0.3;

    // Direction: diagonal downward-right with slight variation
    const angle = -0.3 - Math.random() * 0.5;
    const speed = 0.008 + Math.random() * 0.006;
    const dirX = Math.cos(angle) * speed;
    const dirY = Math.sin(angle) * speed;

    // Trail geometry — a short line of points
    const trailLength = 12;
    const trailPositions = new Float32Array(trailLength * 3);
    const trailSizes = new Float32Array(trailLength);
    for (let i = 0; i < trailLength; i++) {
      trailPositions[i * 3] = startX;
      trailPositions[i * 3 + 1] = startY;
      trailPositions[i * 3 + 2] = startZ;
      trailSizes[i] = 0.004 * (1 - i / trailLength);
    }

    const trailGeo = new BufferGeometry();
    trailGeo.setAttribute('position', new Float32BufferAttribute(trailPositions, 3));
    const trailMat = new PointsMaterial({
      color: 0xffffff,
      size: 0.004,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
    });
    const trailMesh = new Points(trailGeo, trailMat);
    scene.add(trailMesh);

    shootingStars.push({
      mesh: trailMesh,
      positions: trailPositions,
      headX: startX,
      headY: startY,
      headZ: startZ,
      dirX,
      dirY,
      trailLength,
      life: 0,
      maxLife: 60 + Math.random() * 40,
    });
  }

  function updateShootingStars(time) {
    // Spawn check
    if (time - lastShootingStar > SHOOTING_STAR_INTERVAL + Math.random() * 2000) {
      spawnShootingStar(time);
      lastShootingStar = time;
    }

    // Update each active shooting star
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.life++;

      // Move head
      s.headX += s.dirX;
      s.headY += s.dirY;

      // Update trail — shift positions back, add new head
      for (let j = s.trailLength - 1; j > 0; j--) {
        s.positions[j * 3] = s.positions[(j - 1) * 3];
        s.positions[j * 3 + 1] = s.positions[(j - 1) * 3 + 1];
        s.positions[j * 3 + 2] = s.positions[(j - 1) * 3 + 2];
      }
      s.positions[0] = s.headX;
      s.positions[1] = s.headY;
      s.positions[2] = s.headZ;
      s.mesh.geometry.attributes.position.needsUpdate = true;

      // Fade in/out
      const lifeRatio = s.life / s.maxLife;
      if (lifeRatio < 0.1) {
        s.mesh.material.opacity = lifeRatio / 0.1;
      } else if (lifeRatio > 0.7) {
        s.mesh.material.opacity = (1 - lifeRatio) / 0.3;
      } else {
        s.mesh.material.opacity = 1;
      }

      // Remove when dead
      if (s.life >= s.maxLife) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        shootingStars.splice(i, 1);
      }
    }
  }

  // Animation loop — subtle drift rotation (STAR-02) + shooting stars
  let frameCount = 0;
  function animate() {
    points.rotation.y += 0.0001;
    points.rotation.x += 0.00005;
    updateShootingStars(frameCount * 16.67); // approximate ms
    frameCount++;
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
