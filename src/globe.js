/**
 * Globe module — Three.js Earth globe with NASA Blue Marble texture,
 * atmospheric glow, pulsing LA marker, and smooth rotation.
 *
 * Exports:
 *   initGlobe()       — initializes the globe and starts the animation loop
 *   updateGlobe(scrollState) — stub for Plan 03 scroll-driven behavior
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

// ── Module-scoped state (accessible to updateGlobe in Plan 03) ──────────────
let scene, camera, renderer, earthMesh, atmosphereMesh, markerMesh, clock;
let globeGroup;

const GLOBE_RADIUS = 1.5;
const CAMERA_Z_DEFAULT = 5; // default camera distance — used by updateGlobe in Plan 03
const LA_LAT = 34.05;
const LA_LON = -118.25;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert geographic coordinates to a 3D vector on the sphere surface.
 * @param {number} lat  Latitude in degrees (positive = north)
 * @param {number} lon  Longitude in degrees (positive = east)
 * @param {number} radius  Sphere radius
 * @returns {Vector3}
 */
function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

// ── Animation loop ────────────────────────────────────────────────────────────

function animate() {
  // Slow Y-axis rotation (GLOB-04)
  globeGroup.rotation.y += 0.002;

  // Pulse the LA marker — emissive intensity and scale
  const elapsed = clock.getElapsedTime();
  markerMesh.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3) * 0.5;
  const pulse = 1 + Math.sin(elapsed * 3) * 0.3;
  markerMesh.scale.set(pulse, pulse, pulse);

  renderer.render(scene, camera);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initialize the Three.js Earth globe and attach its canvas to the DOM.
 * The canvas is fixed-position, transparent, z-index 1 (above stars at 0,
 * below page content).
 */
export function initGlobe() {
  // 1. Renderer setup ─────────────────────────────────────────────────────────
  renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // RESP-02: cap pixel ratio at 2 for mobile performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Canvas positioning — fixed, non-interactive, above stars (z-index 0)
  const canvas = renderer.domElement;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  // 2. Camera setup ───────────────────────────────────────────────────────────
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, CAMERA_Z_DEFAULT);

  // 3. Scene + lighting ───────────────────────────────────────────────────────
  scene = new Scene();

  // Dim ambient so the dark side of the globe is subtly visible
  const ambientLight = new AmbientLight(0x333333);
  scene.add(ambientLight);

  // Main directional light — sun-like, off-axis
  const dirLight = new DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // 4. Globe group (parent for earth + atmosphere + marker) ───────────────────
  globeGroup = new Group();
  scene.add(globeGroup);

  // 5. Earth sphere — GLOB-01 ─────────────────────────────────────────────────
  const earthGeometry = new SphereGeometry(GLOBE_RADIUS, 64, 64);

  const loader = new TextureLoader();
  const diffuseTexture = loader.load(
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
  );
  const bumpTexture = loader.load(
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  );
  const waterTexture = loader.load(
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  );

  const earthMaterial = new MeshPhongMaterial({
    map: diffuseTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.05,
    specularMap: waterTexture,
    specular: new Color(0x222222),
    shininess: 25,
  });

  earthMesh = new Mesh(earthGeometry, earthMaterial);
  globeGroup.add(earthMesh);

  // 6. Atmospheric glow — GLOB-02 ─────────────────────────────────────────────
  // A slightly larger sphere using a custom ShaderMaterial.
  // RGB (0.376, 0.647, 0.980) = #60a5fa in normalized floats.
  const atmosphereGeometry = new SphereGeometry(GLOBE_RADIUS * 1.15, 64, 64);

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
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
        gl_FragColor = vec4(0.376, 0.647, 0.980, 1.0) * intensity;
      }
    `,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
  });

  atmosphereMesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
  globeGroup.add(atmosphereMesh);

  // 7. LA marker — GLOB-03 ────────────────────────────────────────────────────
  // Positioned slightly above the surface (radius * 1.01) so it sits on top.
  const markerPosition = latLonToVec3(LA_LAT, LA_LON, GLOBE_RADIUS * 1.01);

  const markerGeometry = new SphereGeometry(0.03, 16, 16);
  const markerMaterial = new MeshPhongMaterial({
    color: 0x60a5fa,
    emissive: 0x60a5fa,
    emissiveIntensity: 0.8,
    transparent: true,
  });

  markerMesh = new Mesh(markerGeometry, markerMaterial);
  markerMesh.position.copy(markerPosition);
  globeGroup.add(markerMesh);

  // 8. Animation loop — GLOB-04 ───────────────────────────────────────────────
  clock = new Clock();
  renderer.setAnimationLoop(animate);

  // 9. Resize handler ─────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

/**
 * Update globe based on scroll state.
 * Stub — Plan 03 (scroll behavior) will implement the full logic.
 * Module-scoped variables (camera, globeGroup, etc.) are accessible here.
 *
 * @param {Object} scrollState  Current scroll position data from scroll.js
 */
export function updateGlobe(scrollState) {} // eslint-disable-line no-unused-vars
