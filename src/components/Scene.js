'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrbitControls, ContactShadows, Instances, Instance, Center, Sparkles } from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

// Procedurally generated noise texture for realistic oat bumpiness
function useProceduralNoiseTexture() {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create a grainy noise pattern with linear streaks (like oat grains)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 2 + Math.random() * 8;
      const shade = Math.floor(150 + Math.random() * 105);
      context.fillStyle = `rgb(${shade},${shade},${shade})`;
      // Draw small streaks
      context.fillRect(x, y, 1, length);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    setTexture(tex);
    
    return () => tex.dispose();
  }, []);

  return texture;
}

// Custom hook to create a realistic curved, jagged oat flake geometry
function useOatGeometry() {
  return useMemo(() => {
    // Start with a flat cylinder (a disc)
    const geo = new THREE.CylinderGeometry(1, 1, 0.05, 16, 2);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      // 1. Stretch into an oval
      let newX = x * 0.7;
      let newZ = z * 1.2;
      
      // 2. Add irregular jagged edges by modifying the radius
      // Only modify outer vertices (where x or z is far from center)
      const distFromCenter = Math.sqrt(newX*newX + newZ*newZ);
      if (distFromCenter > 0.5) {
        const noise = (Math.random() - 0.5) * 0.15;
        newX += newX * noise;
        newZ += newZ * noise;
      }
      
      // 3. Bend it slightly (like a potato chip/rolled oat)
      // The further from center on Z, the higher it goes
      const bend = Math.abs(newZ) * 0.2 + (Math.random() - 0.5) * 0.05;
      const newY = y + bend;
      
      pos.setXYZ(i, newX, newY, newZ);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);
}

const OAT_COLORS = ['#e2d0b5', '#dfc8a6', '#d6b88e', '#e8d5b7', '#c9a87c', '#d8c1a1'];

function OatFlakes({ count = 350 }) {
  const noiseTex = useProceduralNoiseTexture();
  const oatGeo = useOatGeometry();
  
  const oatData = useMemo(() => {
    return Array.from({ length: count }, () => {
      const color = OAT_COLORS[Math.floor(Math.random() * OAT_COLORS.length)];
      return {
        position: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12 + 2, (Math.random() - 0.5) * 16],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.18 + Math.random() * 0.15,
        speed: 0.1 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        rotationSpeedX: (Math.random() - 0.5) * 0.015,
        rotationSpeedZ: (Math.random() - 0.5) * 0.015,
        color: color
      };
    });
  }, [count]);

  return (
    <Instances limit={count} range={count} castShadow receiveShadow>
      <primitive object={oatGeo} attach="geometry" />
      <meshStandardMaterial 
        roughness={1} 
        metalness={0} 
        bumpMap={noiseTex}
        bumpScale={0.05}
      />
      {oatData.map((data, i) => (
        <OatFlake key={i} data={data} />
      ))}
    </Instances>
  );
}

function OatFlake({ data }) {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y += Math.sin(t * data.speed + data.offset) * 0.003;
      ref.current.rotation.x += data.rotationSpeedX;
      ref.current.rotation.z += data.rotationSpeedZ;
    }
  });
  
  return (
    <Instance 
      ref={ref} 
      position={data.position} 
      rotation={data.rotation} 
      scale={data.scale}
      color={data.color}
    />
  );
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas shadows camera={{ position: [0, 2, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#faf9f6']} />
          
          {/* Lighting optimized for the light theme and realistic textures */}
          <ambientLight intensity={0.7} color="#ffffff" />
          <directionalLight 
            castShadow 
            position={[10, 15, 10]} 
            intensity={1.8} 
            color="#fff0dd"
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0005}
          />
          <pointLight position={[-10, -5, -10]} color="#f39c12" intensity={1.5} distance={30} />
          <pointLight position={[5, 0, -5]} color="#ffffff" intensity={1} distance={20} />

          {/* Environment and Atmosphere */}
          <Environment preset="city" environmentIntensity={0.6} />
          <fog attach="fog" args={['#faf9f6', 10, 35]} />

          {/* Magical sparkles to elevate the premium feel */}
          <Sparkles count={150} scale={15} size={1.5} speed={0.4} opacity={0.6} color="#e67e22" />

          {/* Core Content: Just the beautiful realistic oats floating */}
          <OatFlakes count={350} />

          {/* Soft Ground Shadow */}
          <ContactShadows position={[0, -4.5, 0]} opacity={0.5} scale={30} blur={3} far={10} color="#8b7355" />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
