/**
 * Globe module — Three.js Earth globe with NASA Blue Marble texture,
 * dramatic atmospheric glow, pulsing LA marker, and scroll-driven zoom.
 *
 * Camera ORBITS toward LA (not just zooms z-axis). The globe stays at
 * the origin with no rotation — instead the camera moves to the position
 * directly above LA on the sphere surface, looking at origin.
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

const GLOBE_RADIUS = 1.5;
const LA_LAT = 34.05;
const LA_LON = -118.25;

// Camera positions
const CAM_FAR = 5;       // hero: full Earth from deep space
const CAM_CLOSE = 1.8;   // max zoom: just above the globe surface at LA

// Camera position when directly above LA at close range
// Use the same latLonToVec3 formula at a larger radius (camera orbit sphere)
function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

// Pre-compute LA position on the globe surface (for marker) and on camera orbit sphere
const LA_ON_SURFACE = latLonToVec3(LA_LAT, LA_LON, GLOBE_RADIUS * 1.01);
const LA_CAM_TARGET = latLonToVec3(LA_LAT, LA_LON, CAM_CLOSE);

// Starting camera position (looking at Earth from the front)
const CAM_START = new Vector3(0, 0, CAM_FAR);

function animate() {
  // Slow idle rotation only in hero zone
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
  camera.position.copy(CAM_START);
  camera.lookAt(0, 0, 0);

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
  const markerGeometry = new SphereGeometry(0.03, 16, 16);
  const markerMaterial = new MeshPhongMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.8,
    transparent: true,
  });
  markerMesh = new Mesh(markerGeometry, markerMaterial);
  markerMesh.position.copy(LA_ON_SURFACE);
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

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Saved camera position at the moment idle rotation stops.
 * We lerp from here to the LA orbit point.
 */
let heroCamSnapshot = null;

/**
 * Get the current camera start position accounting for globe idle rotation.
 * The globe rotates during hero, so LA's world position changes.
 * We need to compute where the camera "should" orbit from.
 */
function getRotatedLA(radius) {
  // LA's local position
  const local = latLonToVec3(LA_LAT, LA_LON, radius);
  // Apply current globeGroup rotation
  local.applyEuler(globeGroup.rotation);
  return local;
}

/**
 * Update globe based on continuous scroll progress (0-1).
 *
 * 0.00-0.30: Full Earth from space, idle rotation, camera at (0,0,5)
 * 0.30-0.60: Camera orbits from current position toward LA, zooming in
 * 0.60-0.80: Globe fades out (camera stays at LA position)
 * 0.80-1.00: Globe gone
 */
export function updateGlobe({ progress }) {
  if (!renderer) return;
  scrollProgress = progress;

  const canvas = renderer.domElement;

  if (progress <= 0.30) {
    // Hero — idle rotation handled in animate(), camera at far distance
    heroCamSnapshot = null;
    camera.position.set(0, 0, CAM_FAR);
    camera.lookAt(0, 0, 0);
    canvas.style.opacity = '1';

  } else if (progress <= 0.60) {
    // About zone — orbit camera toward LA
    const t = (progress - 0.30) / 0.30; // 0→1
    const eased = easeInOutCubic(t);

    // Snapshot the camera start and stop idle rotation on first frame
    if (heroCamSnapshot === null) {
      heroCamSnapshot = camera.position.clone();
    }

    // Compute LA's world position (accounting for accumulated globe rotation)
    // At the moment of snapshot, globe rotation is frozen (animate stops spinning)
    const laWorld = getRotatedLA(CAM_CLOSE);

    // Lerp camera from snapshot position toward the LA orbit point
    camera.position.lerpVectors(heroCamSnapshot, laWorld, eased);
    camera.lookAt(0, 0, 0);
    canvas.style.opacity = '1';

  } else if (progress <= 0.80) {
    // Transition — hold camera at LA, fade globe out
    const fadeT = (progress - 0.60) / 0.20;
    canvas.style.opacity = String(1 - fadeT);
    // Camera stays at LA orbit point, still looking at center
    const laWorld = getRotatedLA(CAM_CLOSE);
    camera.position.copy(laWorld);
    camera.lookAt(0, 0, 0);

  } else {
    canvas.style.opacity = '0';
  }
}
