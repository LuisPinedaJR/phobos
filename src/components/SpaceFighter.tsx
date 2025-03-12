import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import useGameStore from '../store/gameStore';

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
  
  // Get the camera from the scene
  const { camera } = useThree();
  
  // Get game store state and actions
  const {
    fighterPosition,
    fighterRotation,
    setFighterPosition,
    setFighterRotation,
    addLaserShot,
    setKeyPressed,
    isKeyPressed
  } = useGameStore();
  
  // Set up keyboard event listeners
  useEffect(() => {
    // Handle key down events
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeyPressed(event.key.toLowerCase(), true);
    };
    
    // Handle key up events
    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyPressed(event.key.toLowerCase(), false);
      
      // Handle shooting on key up for the 'f' key
      if (event.key.toLowerCase() === 'f' && groupRef.current) {
        // Calculate the forward direction of the fighter
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(groupRef.current.quaternion);
        
        // Create a position slightly in front of the fighter
        const shotPosition = fighterPosition.clone().add(
          direction.clone().multiplyScalar(2)
        );
        
        // Add a new laser shot
        addLaserShot(shotPosition, direction);
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeyPressed, addLaserShot, fighterPosition]);
  
  // Initialize fighter position and rotation
  useEffect(() => {
    setFighterPosition(new THREE.Vector3(...position));
    setFighterRotation(new THREE.Euler(...rotation));
  }, []);
  
  // Animation logic using useFrame
  useFrame((state, deltaTime) => {
    if (!groupRef.current) return;
    
    // Get the current position and rotation
    const currentPosition = fighterPosition.clone();
    const currentRotation = fighterRotation.clone();
    
    // Movement speed
    const movementSpeed = speed * 10;
    
    // Handle arrow key movement
    let moved = false;
    
    // Forward/backward movement (Z axis)
    if (isKeyPressed('arrowup')) {
      currentPosition.z -= movementSpeed * deltaTime;
      moved = true;
    }
    if (isKeyPressed('arrowdown')) {
      currentPosition.z += movementSpeed * deltaTime;
      moved = true;
    }
    
    // Left/right movement (X axis)
    if (isKeyPressed('arrowleft')) {
      currentPosition.x -= movementSpeed * deltaTime;
      // Add a slight roll when turning
      currentRotation.z = THREE.MathUtils.lerp(
        currentRotation.z,
        -0.6,
        deltaTime * 5
      );
      moved = true;
    } else if (isKeyPressed('arrowright')) {
      currentPosition.x += movementSpeed * deltaTime;
      // Add a slight roll when turning
      currentRotation.z = THREE.MathUtils.lerp(
        currentRotation.z,
        0.6,
        deltaTime * 5
      );
      moved = true;
    } else {
      // Return to neutral roll when not turning
      currentRotation.z = THREE.MathUtils.lerp(
        currentRotation.z,
        -0.4,
        deltaTime * 3
      );
    }
    
    // Add a subtle hover animation when not moving
    if (!moved) {
      const time = state.clock.getElapsedTime();
      currentPosition.y = Math.sin(time * 0.5) * 0.05;
    }
    
    // Update the position and rotation in the store
    setFighterPosition(currentPosition);
    setFighterRotation(currentRotation);
    
    // Update the group position and rotation
    groupRef.current.position.copy(currentPosition);
    groupRef.current.rotation.copy(currentRotation);
    
    // Update camera to follow the fighter
    camera.position.x = currentPosition.x;
    camera.position.y = currentPosition.y + 5;
    camera.position.z = currentPosition.z + 15;
    camera.lookAt(currentPosition);
  });

  return (
    <group
      ref={groupRef}
      position={fighterPosition}
      rotation={fighterRotation}
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
