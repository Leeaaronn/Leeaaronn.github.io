/**
 * Globe module — Three.js Earth globe with NASA Blue Marble texture,
 * atmospheric glow, and slow idle rotation. Static position on all sections.
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
} from 'three';

let renderer, camera, globeGroup;

const GLOBE_RADIUS = 1.5;

function animate() {
  globeGroup.rotation.y += 0.0005;
  renderer.render(renderer._scene, camera);
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
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();
  renderer._scene = scene;
  scene.add(new AmbientLight(0x444444));
  const dirLight = new DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  globeGroup = new Group();
  scene.add(globeGroup);

  // Earth sphere
  const loader = new TextureLoader();
  const earthMaterial = new MeshPhongMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.05,
    specularMap: loader.load('https://unpkg.com/three-globe/example/img/earth-water.png'),
    specular: new Color(0x222222),
    shininess: 25,
  });
  globeGroup.add(new Mesh(new SphereGeometry(GLOBE_RADIUS, 64, 64), earthMaterial));

  // Inner atmosphere — blue rim glow
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
  globeGroup.add(new Mesh(new SphereGeometry(GLOBE_RADIUS * 1.12, 64, 64), atmosphereMaterial));

  // Outer glow
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
  globeGroup.add(new Mesh(new SphereGeometry(GLOBE_RADIUS * 1.35, 64, 64), outerGlowMaterial));

  renderer.setAnimationLoop(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
