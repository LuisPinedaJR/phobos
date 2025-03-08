import { Physics } from '@react-three/rapier';
import { Stats, useGLTF, OrbitControls } from '@react-three/drei';
import SpaceFighter from './components/SpaceFighter';
import SpaceEnvironment from './components/SpaceEnvironment';
import SpaceLighting from './components/SpaceLighting';
import AsteroidField from './components/AsteroidField';
import { useControls } from 'leva';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

useGLTF.preload('/models/ship.gltf');

const GameScene = () => {
  const { intensity } = useControls('Environment', {
    intensity: {
      value: 0.4,
      min: 0,
      max: 2,
      step: 0.1,
    },
  });

  const { rotationX, rotationY, rotationZ } = useControls('Ship Rotation', {
    rotationX: { value: 1.35, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationY: { value: 0.11, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationZ: { value: -0.4, min: -Math.PI, max: Math.PI, step: 0.01 },
  });

  const { starsCount, starsRadius, starsDepth } = useControls('Space Environment', {
    starsCount: { value: 5000, min: 1000, max: 10000, step: 100 },
    starsRadius: { value: 100, min: 50, max: 200, step: 10 },
    starsDepth: { value: 50, min: 10, max: 100, step: 5 },
  });

  const { shipSpeed } = useControls('Ship Controls', {
    shipSpeed: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
  });

  const { asteroidCount, asteroidRadius, asteroidSizeMin, asteroidSizeMax } = useControls('Asteroid Field', {
    asteroidCount: { value: 50, min: 10, max: 200, step: 5 },
    asteroidRadius: { value: 30, min: 10, max: 100, step: 5 },
    asteroidSizeMin: { value: 0.3, min: 0.1, max: 1, step: 0.1 },
    asteroidSizeMax: { value: 1.5, min: 0.5, max: 3, step: 0.1 },
  });

  return (
    <>
     <Canvas
      gl={{
        antialias: false
      }}
      camera={{ position: [0, 5, 15], fov: 60 }}
      shadows
    >
      <SpaceLighting 
        mainLightIntensity={intensity} 
        ambientLightIntensity={0.2}
      />
      
      <SpaceEnvironment 
        starsCount={starsCount}
        starsRadius={starsRadius}
        starsDepth={starsDepth}
      />
      
      <AsteroidField 
        count={asteroidCount}
        radius={asteroidRadius}
        size={[asteroidSizeMin, asteroidSizeMax]}
      />
      
      <Physics debug timeStep="vary" gravity={[0, 0, 0]}>
        <Suspense fallback={null}>
          <SpaceFighter 
            rotation={[rotationX, rotationY, rotationZ]} 
            speed={shipSpeed}
          />
        </Suspense>
      </Physics>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        makeDefault
      />
      
      <Stats />
      </Canvas>
    </>
  );
};

export default GameScene;
