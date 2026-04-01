/**
 * Globe module — Three.js Earth globe with NASA Blue Marble texture,
 * dramatic atmospheric glow, pulsing LA marker, and scroll-driven zoom.
 *
 * Scroll journey: idle spin in hero → rotate to face LA → zoom in → fade out
 */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  TextureLoader,
  AmbientLight,
  DirectionalLight,
  BackSide,
  AdditiveBlending,
  ShaderMaterial,
  Group,
  Color,
  Clock,
  Vector3,
} from 'three';

let scene, camera, renderer, earthMesh, atmosphereMesh, outerGlow, markerMesh, clock;
let globeGroup;
let scrollProgress = 0;

// Capture the globe's Y rotation when leaving hero zone so we can
// smoothly interpolate from it to the LA-facing angle
let heroEndRotY = null;

const GLOBE_RADIUS = 1.5;
const CAMERA_Z_FAR = 5;
const CAMERA_Z_CLOSE = 1.5;
const LA_LAT = 34.05;
const LA_LON = -118.25;

// ── LA-facing rotation calculation ──────────────────────────────────────────
// latLonToVec3 places LA at approximately (-0.587, 0.842, 1.093) at rotation=0.
// For LA to be centered on screen, we need new_x ≈ 0 after Y rotation:
//   0 = x*cos(R) + z*sin(R)  →  tan(R) = -x/z = 0.587/1.093
//   R = atan(0.537) ≈ 0.494 rad ≈ 28.3°
const LA_FACE_Y = Math.atan2(0.587, 1.093); // ≈ 0.494 radians
const LA_TILT_X = -0.15; // tilt to center 34°N latitude vertically

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

function animate() {
  // Idle rotation only in hero zone
  if (scrollProgress < 0.30) {
    globeGroup.rotation.y += 0.0005;
  }

  const elapsed = clock.getElapsedTime();
  markerMesh.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3) * 0.5;
  const pulse = 1 + Math.sin(elapsed * 3) * 0.3;
  markerMesh.scale.set(pulse, pulse, pulse);
  renderer.render(scene, camera);
}

export function initGlobe() {
  renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const canvas = renderer.domElement;
  canvas.id = 'globe-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z_FAR);

  scene = new Scene();
  scene.add(new AmbientLight(0x444444));
  const dirLight = new DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  globeGroup = new Group();
  scene.add(globeGroup);

  // Earth sphere
  const earthGeometry = new SphereGeometry(GLOBE_RADIUS, 64, 64);
  const loader = new TextureLoader();
  const earthMaterial = new MeshPhongMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.05,
    specularMap: loader.load('https://unpkg.com/three-globe/example/img/earth-water.png'),
    specular: new Color(0x222222),
    shininess: 25,
  });
  earthMesh = new Mesh(earthGeometry, earthMaterial);
  globeGroup.add(earthMesh);

  // Inner atmosphere — blue rim glow
  const atmosphereGeometry = new SphereGeometry(GLOBE_RADIUS * 1.12, 64, 64);
  const atmosphereMaterial = new ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(0.376, 0.647, 0.980, 1.0) * intensity * 1.5;
      }
    `,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
  });
  atmosphereMesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
  globeGroup.add(atmosphereMesh);

  // Outer glow — purple-shifted
  const outerGlowGeometry = new SphereGeometry(GLOBE_RADIUS * 1.35, 64, 64);
  const outerGlowMaterial = new ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 5.0);
        vec3 purple = vec3(0.545, 0.361, 0.965);
        vec3 blue = vec3(0.376, 0.647, 0.980);
        vec3 color = mix(blue, purple, intensity);
        gl_FragColor = vec4(color, 1.0) * intensity * 0.8;
      }
    `,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
  });
  outerGlow = new Mesh(outerGlowGeometry, outerGlowMaterial);
  globeGroup.add(outerGlow);

  // LA marker
  const markerPosition = latLonToVec3(LA_LAT, LA_LON, GLOBE_RADIUS * 1.01);
  const markerGeometry = new SphereGeometry(0.03, 16, 16);
  const markerMaterial = new MeshPhongMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.8,
    transparent: true,
  });
  markerMesh = new Mesh(markerGeometry, markerMaterial);
  markerMesh.position.copy(markerPosition);
  globeGroup.add(markerMesh);

  clock = new Clock();
  renderer.setAnimationLoop(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

/**
 * Smooth easing (ease-in-out cubic)
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Update globe based on continuous scroll progress (0-1).
 *
 * 0.00-0.30: Full Earth from space, idle rotation
 * 0.30-0.60: Capture rotation, rotate to face LA, zoom in
 * 0.60-0.80: Globe fades out (crossfade to LA photo)
 * 0.80-1.00: Globe gone
 */
export function updateGlobe({ progress }) {
  if (!renderer) return;
  scrollProgress = progress;

  const canvas = renderer.domElement;

  if (progress <= 0.30) {
    // Hero — idle rotation, camera at far distance
    heroEndRotY = null;
    camera.position.z += (CAMERA_Z_FAR - camera.position.z) * 0.15;
    canvas.style.opacity = '1';

  } else if (progress <= 0.60) {
    const t = (progress - 0.30) / 0.30;
    const eased = easeInOutCubic(t);

    if (heroEndRotY === null) {
      heroEndRotY = globeGroup.rotation.y;
    }

    const TWO_PI = 2 * Math.PI;
    const fullRots = Math.round((heroEndRotY - LA_FACE_Y) / TWO_PI);
    const targetY = fullRots * TWO_PI + LA_FACE_Y;

    globeGroup.rotation.y = heroEndRotY + (targetY - heroEndRotY) * eased;
    globeGroup.rotation.x = LA_TILT_X * eased;

    const zoomT = Math.max((t - 0.35) / 0.65, 0);
    const targetZ = CAMERA_Z_FAR - (CAMERA_Z_FAR - CAMERA_Z_CLOSE) * zoomT;
    camera.position.z += (targetZ - camera.position.z) * 0.15;
    canvas.style.opacity = '1';

  } else if (progress <= 0.80) {
    const fadeT = (progress - 0.60) / 0.20;
    const targetZ = CAMERA_Z_CLOSE - (fadeT * 0.5);
    camera.position.z += (targetZ - camera.position.z) * 0.15;
    canvas.style.opacity = String(1 - fadeT);

  } else {
    canvas.style.opacity = '0';
  }
}
