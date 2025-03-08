import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Define the type for our GLTF result
type GLTFResult = GLTF & {
  nodes: {
    model: THREE.Mesh;
  };
  materials: {
    CustomMaterial: THREE.MeshStandardMaterial;
  };
};

interface SpaceFighterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speed?: number;
}
// ship rotation is in degrees rotationX = 1.35, rotationY = 0.11, rotationZ = -0.4
const SpaceFighter = ({
  position = [0, 0, 0],
  rotation = [1.35, 0.11, -0.4], 
  scale = 1,
  speed = 0.1,
}: SpaceFighterProps) => {
  // Load the ship model
  const { nodes, materials } = useGLTF('/models/ship.gltf') as GLTFResult;

  // Create a reference to the group containing the model
  const groupRef = useRef<THREE.Group>(null);

  // Animation logic using useFrame
  useFrame((state) => {
    if (!groupRef.current) return;

    // Add subtle hover animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <group
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={scale}
    >
      <mesh
        geometry={nodes.model.geometry}
        material={materials.CustomMaterial}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Preload the model to avoid loading during gameplay
useGLTF.preload('/models/ship.gltf');

export default SpaceFighter;
