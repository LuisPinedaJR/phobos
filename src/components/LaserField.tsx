import { useFrame } from '@react-three/fiber';
import useGameStore from '../store/gameStore';
import LaserShot from './LaserShot';

const LaserField = () => {
  const { laserShots, removeLaserShot, updateLaserPositions } = useGameStore();
  
  // Update laser positions on each frame
  useFrame((state, deltaTime) => {
    updateLaserPositions(deltaTime);
  });
  
  return (
    <group>
      {laserShots.map(shot => (
        <LaserShot
          key={shot.id}
          position={shot.position}
          direction={shot.direction}
          onRemove={() => removeLaserShot(shot.id)}
        />
      ))}
    </group>
  );
};

export default LaserField; 