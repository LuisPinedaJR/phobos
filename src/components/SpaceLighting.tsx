import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceLightingProps {
  mainLightIntensity?: number;
  mainLightColor?: string;
  ambientLightIntensity?: number;
}

const SpaceLighting = ({
  mainLightIntensity = 1.5,
  mainLightColor = '#fffaed',
  ambientLightIntensity = 0.2,
}: SpaceLightingProps) => {
  // Reference for the main directional light
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  
  // Animate the light slightly to create a dynamic feel
  useFrame((state) => {
    if (mainLightRef.current) {
      // Subtle movement of the main light
      const time = state.clock.getElapsedTime();
      mainLightRef.current.position.x = Math.sin(time * 0.1) * 3;
      mainLightRef.current.position.y = Math.cos(time * 0.1) * 2;
    }
  });

  return (
    <>
      {/* Main directional light (sun) */}
      <directionalLight
        ref={mainLightRef}
        color={mainLightColor}
        intensity={mainLightIntensity}
        position={[10, 5, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={ambientLightIntensity} color="#2c3e50" />
      
      {/* Additional point light for accent lighting */}
      <pointLight 
        position={[-10, -10, -10]} 
        color="#3498db" 
        intensity={0.5} 
      />
    </>
  );
};

export default SpaceLighting; 