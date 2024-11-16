import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ref } from 'vue';

export type ModelFileType = 'ply' | 'stl' | 'glb';

export function useModelLoader(scene: THREE.Scene, camera: THREE.Camera) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let currentModel: THREE.Object3D | null = null;

  const fitCameraToObject = (
    object: THREE.Object3D, 
    offset: number = 1.25,
    controls?: THREE.OrbitControls
  ) => {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Get the max side of the bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov * (Math.PI / 180) : 1;
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * offset;

    // Ensure minimum camera distance
    cameraZ = Math.max(cameraZ, 1);

    // Update camera position and look at center
    camera.position.set(center.x, center.y + (size.y / 4), center.z + cameraZ);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    if (controls) {
      // Update controls target to center of object
      controls.target.copy(center);
      controls.update();

      // Set reasonable zoom limits
      controls.minDistance = cameraZ * 0.25;
      controls.maxDistance = cameraZ * 2;
    }

    return { center, size, cameraZ };
  };

  const normalizeAndCenterObject = (object: THREE.Object3D) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // Get the max dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate scale to normalize size
    const scale = 5 / maxDim; // Normalized size of 5 units
    
    // Center the object
    object.position.sub(center);
    
    // Apply scale
    object.scale.multiplyScalar(scale);
    
    return { center, size, scale };
  };

  const loadModel = async (url: string, fileType: ModelFileType) => {
    if (!url) {
      error.value = 'No model URL provided';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Clean up previous model
      if (currentModel) {
        scene.remove(currentModel);
        if (currentModel.type === 'Mesh') {
          (currentModel as THREE.Mesh).geometry.dispose();
          if ((currentModel as THREE.Mesh).material instanceof THREE.Material) {
            (currentModel as THREE.Mesh).material.dispose();
          }
        }
        currentModel = null;
      }

      const model = await new Promise<THREE.Object3D>((resolve, reject) => {
        const onProgress = (xhr: ProgressEvent) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(`${Math.round(percentComplete)}% loaded`);
          }
        };

        const createMaterial = () => new THREE.MeshStandardMaterial({
          color: 0x808080,
          metalness: 0.5,
          roughness: 0.7,
          side: THREE.DoubleSide
        });

        switch (fileType) {
          case 'ply':
            new PLYLoader().load(
              url,
              (geometry) => {
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, createMaterial());
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                resolve(mesh);
              },
              onProgress,
              reject
            );
            break;
          case 'stl':
            new STLLoader().load(
              url,
              (geometry) => {
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, createMaterial());
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                resolve(mesh);
              },
              onProgress,
              reject
            );
            break;
          case 'glb':
            new GLTFLoader().load(
              url,
              (gltf) => {
                gltf.scene.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (!child.material.map) {
                      child.material = createMaterial();
                    }
                  }
                });
                resolve(gltf.scene);
              },
              onProgress,
              reject
            );
            break;
        }
      });

      currentModel = model;
      
      // First normalize and center the model
      normalizeAndCenterObject(model);
      
      // Add to scene
      scene.add(model);
      
      // Fit camera to the normalized model
      fitCameraToObject(model);

    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load model';
      console.error('Error loading model:', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    loadModel,
    isLoading,
    error,
    fitCameraToObject,
    normalizeAndCenterObject
  };
}