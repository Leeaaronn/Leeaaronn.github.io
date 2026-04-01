/**
 * Globe module — Three.js Earth globe with NASA Blue Marble texture,
 * atmospheric glow, pulsing LA marker, and smooth rotation.
 *
 * Exports:
 *   initGlobe()              — initializes the globe and starts the animation loop
 *   updateGlobe({ progress }) — scroll-driven zoom from space to LA (progress 0-1)
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

let scene, camera, renderer, earthMesh, atmosphereMesh, markerMesh, clock;
let globeGroup;
let laLabelEl = null;

const GLOBE_RADIUS = 1.5;
const CAMERA_Z_FAR = 5;    // deep space
const CAMERA_Z_CLOSE = 1.5; // filling viewport before fade
const LA_LAT = 34.05;
const LA_LON = -118.25;

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new Vector3(x, y, z);
}

function animate() {
  globeGroup.rotation.y += 0.0005;
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
  scene.add(new AmbientLight(0x333333));
  const dirLight = new DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  globeGroup = new Group();
  scene.add(globeGroup);

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
 * Update globe based on continuous scroll progress (0-1).
 *
 * 0.00-0.30: Full Earth from space (z=5), slowly rotating
 * 0.30-0.60: Zoom toward LA (z=5 → 1.5), pan to center LA, marker visible
 * 0.60-0.80: Globe continues zoom + fades out (opacity 1 → 0)
 * 0.80-1.00: Globe gone
 */
export function updateGlobe({ progress }) {
  if (!renderer) return;

  if (!laLabelEl) {
    laLabelEl = document.getElementById('la-label');
  }

  const canvas = renderer.domElement;

  if (progress <= 0.30) {
    // Hero zone — full Earth from space
    const targetZ = CAMERA_Z_FAR;
    camera.position.z += (targetZ - camera.position.z) * 0.15;
    canvas.style.opacity = '1';
    globeGroup.position.x += (0 - globeGroup.position.x) * 0.1;
    globeGroup.position.y += (0 - globeGroup.position.y) * 0.1;
    if (laLabelEl) laLabelEl.classList.remove('visible');

  } else if (progress <= 0.60) {
    // About zone — zoom from z=5 to z=1.5, pan toward LA
    const zoomT = (progress - 0.30) / 0.30; // 0→1 within this zone
    const targetZ = CAMERA_Z_FAR - (CAMERA_Z_FAR - CAMERA_Z_CLOSE) * zoomT;
    camera.position.z += (targetZ - camera.position.z) * 0.15;
    canvas.style.opacity = '1';

    const targetX = -0.4 * zoomT;
    const targetY = 0.25 * zoomT;
    globeGroup.position.x += (targetX - globeGroup.position.x) * 0.1;
    globeGroup.position.y += (targetY - globeGroup.position.y) * 0.1;

    // LA label visible past 40% (halfway through about)
    if (laLabelEl) {
      if (zoomT > 0.35) {
        laLabelEl.classList.add('visible');
      } else {
        laLabelEl.classList.remove('visible');
      }
    }

  } else if (progress <= 0.80) {
    // Transition zone — globe continues close + fades out
    const fadeT = (progress - 0.60) / 0.20; // 0→1 over this zone
    const targetZ = CAMERA_Z_CLOSE - (fadeT * 0.5); // even closer
    camera.position.z += (targetZ - camera.position.z) * 0.15;
    canvas.style.opacity = String(1 - fadeT);

    // Keep panning
    globeGroup.position.x += (-0.4 - globeGroup.position.x) * 0.1;
    globeGroup.position.y += (0.25 - globeGroup.position.y) * 0.1;

    if (laLabelEl) laLabelEl.classList.remove('visible');

  } else {
    // LA Landing — globe fully gone
    canvas.style.opacity = '0';
    if (laLabelEl) laLabelEl.classList.remove('visible');
  }
}
