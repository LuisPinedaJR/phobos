import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceEnvironmentProps {
  starsRadius?: number;
  starsCount?: number;
  starsDepth?: number;
}

const SpaceEnvironment = ({
  starsRadius = 100,
  starsCount = 5000,
  starsDepth = 50,
}: SpaceEnvironmentProps) => {
  // Reference for the stars to animate them
  const starsRef = useRef<THREE.Points>(null);
  
  // Create a simple distant planet
  const planetRef = useRef<THREE.Mesh>(null);
  
  // Animate the stars and planet
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
    
    if (planetRef.current) {
      // Slowly rotate the planet
      planetRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Stars background */}
      <Stars 
        ref={starsRef}
        radius={starsRadius} 
        depth={starsDepth} 
        count={starsCount} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={1}
      />
      
      {/* Distant planet */}
      <mesh ref={planetRef} position={[30, 10, -40]} scale={5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#3a7395" 
          roughness={0.8} 
          metalness={0.2}
          emissive="#162d38"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Another distant planet */}
      <mesh position={[-50, -15, -60]} scale={8} rotation={[0.2, 1.1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#95513a" 
          roughness={0.7} 
          metalness={0.3}
          emissive="#3d2218"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

export default SpaceEnvironment; 