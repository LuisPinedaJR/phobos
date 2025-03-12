import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';

interface AsteroidFieldProps {
  count?: number;
  radius?: number;
  size?: [number, number];
}

const AsteroidField = ({
  count = 50,
  radius = 30,
  size = [0.3, 1.5],
}: AsteroidFieldProps) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const [asteroids, setAsteroids] = useState<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
    alive: boolean;
  }[]>([]);
  
  // Get laser shots from the game store
  const { laserShots, removeLaserShot, incrementScore } = useGameStore();
  
  // Create asteroid geometry with more realistic shape
  const asteroidGeometry = useMemo(() => {
    // Start with a higher detail icosahedron for better asteroid shape
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    
    // Add noise to the vertices to make them look more like asteroids
    const positions = geometry.attributes.position;
    const vertices = [];
    
    // Use perlin-like noise for more natural looking deformations
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Calculate distance from center for variable noise
      const distance = Math.sqrt(x * x + y * y + z * z);
      
      // Add random displacement to each vertex with more variation
      // Use different noise values for different axes for more irregular shapes
      const noiseX = 0.3 * Math.sin(x * 5 + y * 3) * Math.cos(z * 2);
      const noiseY = 0.3 * Math.sin(y * 4 + z * 2) * Math.cos(x * 3);
      const noiseZ = 0.3 * Math.sin(z * 3 + x * 4) * Math.cos(y * 5);
      
      vertices.push(
        x + noiseX,
        y + noiseY,
        z + noiseZ
      );
    }
    
    // Create a new geometry with the modified vertices
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    
    // Compute normals for proper lighting
    newGeometry.computeVertexNormals();
    
    return newGeometry;
  }, []);
  
  // Create asteroid material with more realistic texture
  const asteroidMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8B8B8B',
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
      // Add some variation in color
      vertexColors: false,
      // Add some bumpiness
      bumpScale: 0.05,
    });
  }, []);
  
  // Initialize asteroids
  useEffect(() => {
    const newAsteroids = [];
    
    for (let i = 0; i < count; i++) {
      // Random position within a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // Random rotation
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const rotZ = Math.random() * Math.PI;
      
      // Random scale between min and max size
      const scale = size[0] + Math.random() * (size[1] - size[0]);
      
      newAsteroids.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(rotX, rotY, rotZ),
        scale,
        alive: true
      });
    }
    
    setAsteroids(newAsteroids);
  }, [count, radius, size]);
  
  // Update asteroid matrices and check for collisions
  useFrame((state, deltaTime) => {
    if (!instancedMeshRef.current || asteroids.length === 0) return;
    
    const time = state.clock.getElapsedTime();
    let asteroidsUpdated = false;
    
    // Check for collisions with laser shots
    const updatedAsteroids = [...asteroids];
    const laserShotsToRemove = new Set<number>();
    
    // Process each asteroid
    updatedAsteroids.forEach((asteroid, asteroidIndex) => {
      if (!asteroid.alive) return;
      
      // Rotate the asteroid
      asteroid.rotation.x += deltaTime * 0.2 * (Math.sin(asteroidIndex) * 0.5 + 0.5);
      asteroid.rotation.y += deltaTime * 0.3 * (Math.cos(asteroidIndex) * 0.5 + 0.5);
      asteroid.rotation.z += deltaTime * 0.1 * (Math.sin(asteroidIndex + 2) * 0.5 + 0.5);
      
      // Check for collisions with laser shots
      laserShots.forEach(shot => {
        if (laserShotsToRemove.has(shot.id)) return;
        
        // Simple distance-based collision detection
        const distance = shot.position.distanceTo(asteroid.position);
        const collisionThreshold = asteroid.scale * 0.9; // Adjust based on asteroid size
        
        if (distance < collisionThreshold) {
          // Mark the asteroid as destroyed
          asteroid.alive = false;
          
          // Mark the laser shot for removal
          laserShotsToRemove.add(shot.id);
          
          // Increment the score
          incrementScore(100);
          
          asteroidsUpdated = true;
        }
      });
      
      // Update the matrix for this asteroid
      const matrix = new THREE.Matrix4();
      matrix.compose(
        asteroid.position,
        new THREE.Quaternion().setFromEuler(asteroid.rotation),
        new THREE.Vector3(asteroid.scale, asteroid.scale, asteroid.scale)
      );
      
      // Only render if the asteroid is alive
      if (asteroid.alive && instancedMeshRef.current) {
        instancedMeshRef.current.setMatrixAt(asteroidIndex, matrix);
      } else if (instancedMeshRef.current) {
        // For destroyed asteroids, move them far away (or you could create explosion effects here)
        const hiddenMatrix = new THREE.Matrix4().makeTranslation(1000, 1000, 1000);
        instancedMeshRef.current.setMatrixAt(asteroidIndex, hiddenMatrix);
      }
    });
    
    // Remove laser shots that hit asteroids
    laserShotsToRemove.forEach(id => {
      removeLaserShot(id);
    });
    
    // Update the instance matrix if any changes were made
    if (instancedMeshRef.current && (asteroidsUpdated || time < 1)) {
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Slowly rotate the entire asteroid field
    if (instancedMeshRef.current) {
      instancedMeshRef.current.rotation.y = time * 0.02;
    }
  });
  
  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[asteroidGeometry, asteroidMaterial, count]}
      castShadow
      receiveShadow
    />
  );
};

export default AsteroidField; 