import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface LaserShotProps {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: () => void;
}

const LaserShot = ({ position, direction, onRemove }: LaserShotProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a laser geometry and material
  const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const laserMaterial = new THREE.MeshStandardMaterial({
    color: '#ff0000',
    emissive: '#ff3333',
    emissiveIntensity: 2,
    toneMapped: false
  });
  
  // Rotate the cylinder to align with the direction
  useFrame(() => {
    if (meshRef.current) {
      // Update the position from the store
      meshRef.current.position.copy(position);
      
      // Align the cylinder with the direction vector
      if (direction.length() > 0) {
        const axis = new THREE.Vector3(0, 1, 0);
        meshRef.current.quaternion.setFromUnitVectors(axis, direction.clone().normalize());
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={laserGeometry}
      material={laserMaterial}
    >
      <pointLight color="#ff0000" intensity={2} distance={5} />
    </mesh>
  );
};

export default LaserShot; 