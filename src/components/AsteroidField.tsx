import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
  
  // Create asteroid geometry with some randomness
  const asteroidGeometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    // Add some noise to the vertices to make them look more like asteroids
    const positions = geometry.attributes.position;
    const vertices = [];
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Add random displacement to each vertex
      const noise = 0.2;
      vertices.push(
        x + (Math.random() - 0.5) * noise,
        y + (Math.random() - 0.5) * noise,
        z + (Math.random() - 0.5) * noise
      );
    }
    
    // Update the geometry with the new vertices
    const newGeometry = new THREE.IcosahedronGeometry(1, 1);
    newGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    newGeometry.computeVertexNormals();
    
    return newGeometry;
  }, []);
  
  // Create asteroid material
  const asteroidMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#888888',
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);
  
  // Create matrices for each asteroid instance
  const matrices = useMemo(() => {
    const matrices = [];
    const matrix = new THREE.Matrix4();
    
    for (let i = 0; i < count; i++) {
      // Random position within a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // Random rotation
      const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      );
      
      // Random scale between min and max size
      const scale = size[0] + Math.random() * (size[1] - size[0]);
      const scaleMatrix = new THREE.Matrix4().makeScale(scale, scale, scale);
      
      // Combine transformations
      matrix
        .makeTranslation(x, y, z)
        .multiply(rotationMatrix)
        .multiply(scaleMatrix);
      
      matrices.push(matrix.clone());
    }
    
    return matrices;
  }, [count, radius, size]);
  
  // Set initial matrices
  useMemo(() => {
    if (instancedMeshRef.current) {
      matrices.forEach((matrix, i) => {
        instancedMeshRef.current?.setMatrixAt(i, matrix);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [matrices]);
  
  // Animate the asteroids
  useFrame((state) => {
    if (instancedMeshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Rotate the entire asteroid field slowly
      instancedMeshRef.current.rotation.y = time * 0.02;
      
      // Update individual asteroid rotations
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        instancedMeshRef.current.getMatrixAt(i, matrix);
        
        // Extract position and scale
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        matrix.decompose(position, rotation, scale);
        
        // Apply a slow rotation based on the asteroid's position
        const rotationSpeed = 0.1 + Math.sin(position.x * 0.5) * 0.05;
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(
            time * rotationSpeed * 0.1,
            time * rotationSpeed * 0.15,
            time * rotationSpeed * 0.05
          )
        );
        
        // Reconstruct the matrix
        const newMatrix = new THREE.Matrix4()
          .makeTranslation(position.x, position.y, position.z)
          .multiply(rotationMatrix)
          .scale(scale);
        
        instancedMeshRef.current.setMatrixAt(i, newMatrix);
      }
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
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