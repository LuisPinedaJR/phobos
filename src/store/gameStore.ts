import { create } from 'zustand';
import * as THREE from 'three';

// Define the laser shot type
interface LaserShot {
  id: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  createdAt: number;
}

// Define the game state
interface GameState {
  // Fighter state
  fighterPosition: THREE.Vector3;
  fighterRotation: THREE.Euler;
  
  // Laser shots
  laserShots: LaserShot[];
  nextLaserId: number;
  
  // Game state
  score: number;
  
  // Controls state
  keysPressed: Set<string>;
  
  // Actions
  setFighterPosition: (position: THREE.Vector3) => void;
  setFighterRotation: (rotation: THREE.Euler) => void;
  addLaserShot: (position: THREE.Vector3, direction: THREE.Vector3) => void;
  removeLaserShot: (id: number) => void;
  updateLaserPositions: (deltaTime: number) => void;
  incrementScore: (points: number) => void;
  setKeyPressed: (key: string, isPressed: boolean) => void;
  isKeyPressed: (key: string) => boolean;
}

// Create the game store
const useGameStore = create<GameState>((set, get) => ({
  // Initial fighter state
  fighterPosition: new THREE.Vector3(0, 0, 0),
  fighterRotation: new THREE.Euler(1.35, 0.11, -0.4),
  
  // Initial laser shots state
  laserShots: [],
  nextLaserId: 0,
  
  // Initial game state
  score: 0,
  
  // Initial controls state
  keysPressed: new Set<string>(),
  
  // Actions
  setFighterPosition: (position) => set({ fighterPosition: position }),
  
  setFighterRotation: (rotation) => set({ fighterRotation: rotation }),
  
  addLaserShot: (position, direction) => {
    const { nextLaserId, laserShots } = get();
    set({
      laserShots: [...laserShots, {
        id: nextLaserId,
        position,
        direction,
        createdAt: Date.now()
      }],
      nextLaserId: nextLaserId + 1
    });
  },
  
  removeLaserShot: (id) => {
    const { laserShots } = get();
    set({
      laserShots: laserShots.filter(shot => shot.id !== id)
    });
  },
  
  updateLaserPositions: (deltaTime) => {
    const { laserShots } = get();
    const LASER_SPEED = 50; // Units per second
    const MAX_LASER_DISTANCE = 100; // Maximum distance before removing
    const LASER_LIFETIME = 3000; // 3 seconds in milliseconds
    
    const currentTime = Date.now();
    
    const updatedShots = laserShots
      .filter(shot => {
        // Remove shots that have existed for too long
        const age = currentTime - shot.createdAt;
        if (age > LASER_LIFETIME) return false;
        
        // Remove shots that have traveled too far
        const distanceFromOrigin = shot.position.length();
        return distanceFromOrigin < MAX_LASER_DISTANCE;
      })
      .map(shot => {
        // Update position based on direction and speed
        const newPosition = shot.position.clone().add(
          shot.direction.clone().multiplyScalar(LASER_SPEED * deltaTime)
        );
        
        return {
          ...shot,
          position: newPosition
        };
      });
    
    set({ laserShots: updatedShots });
  },
  
  incrementScore: (points) => set(state => ({ score: state.score + points })),
  
  setKeyPressed: (key, isPressed) => {
    const { keysPressed } = get();
    const newKeysPressed = new Set(keysPressed);
    
    if (isPressed) {
      newKeysPressed.add(key);
    } else {
      newKeysPressed.delete(key);
    }
    
    set({ keysPressed: newKeysPressed });
  },
  
  isKeyPressed: (key) => {
    return get().keysPressed.has(key);
  }
}));

export default useGameStore; 