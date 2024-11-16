import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ref } from 'vue';

export function useThreeScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000); // Increased far plane for larger models
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;

  const isInitialized = ref(false);

  const initScene = (container: HTMLDivElement) => {
    if (isInitialized.value) return;

    // Scene setup
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera.aspect = aspect;
    camera.position.set(100, 100, 100); // Increased initial camera distance
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 10; // Increased minimum distance
    controls.maxDistance = 1000; // Increased maximum distance
    controls.target.set(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100); // Adjusted light position for larger scene
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 2000; // Increased shadow camera far plane
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-100, 50, -100); // Adjusted light position for larger scene
    scene.add(backLight);

    // Add grid helper for better orientation (increased size)
    const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0x444444); // Increased grid size
    scene.add(gridHelper);

    isInitialized.value = true;
  };

  const animate = () => {
    if (!isInitialized.value) return;
    requestAnimationFrame(animate);
    controls?.update();
    renderer?.render(scene, camera);
  };

  const handleResize = (container: HTMLDivElement) => {
    if (!isInitialized.value) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer?.setSize(width, height);
  };

  const cleanup = (container: HTMLDivElement) => {
    if (isInitialized.value && renderer) {
      controls?.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      isInitialized.value = false;
    }
  };

  return {
    scene,
    camera,
    initScene,
    animate,
    handleResize,
    cleanup,
    isInitialized
  };
}