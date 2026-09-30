import React, { memo, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, OrbitControls, Html, Grid, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const Propeller = () => {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 15;
    }
  });
  return (
    <group position={[-2.2, 0, 0]} ref={meshRef}>
      {/* Central Hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.7} />
      </mesh>
      {/* Propeller Blades - Layer 1 */}
      <mesh>
        <boxGeometry args={[0.1, 2.5, 0.3]} />
        <meshStandardMaterial color="#71717a" roughness={0.5} />
      </mesh>
      {/* Propeller Blades - Layer 2 (Crossed) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.1, 2.5, 0.3]} />
        <meshStandardMaterial color="#71717a" roughness={0.5} />
      </mesh>
    </group>
  );
};

const Scanner = () => {
  const scannerRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (scannerRef.current) {
      // Sweep back and forth along the X axis
      scannerRef.current.position.x = Math.sin(clock.elapsedTime * 2) * 2;
    }
  });

  return (
    <mesh ref={scannerRef} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[1.2, 0.02, 16, 100]} />
      <meshBasicMaterial color="#06b6d4" toneMapped={false} />
    </mesh>
  );
};

interface HolographicEngineProps {
  anomalyCylinder: string | null;
  sensorSuspect: boolean;
}

const HolographicEngine: React.FC<HolographicEngineProps> = ({ anomalyCylinder, sensorSuspect }) => {
  const cylinders = useMemo(() => [
    { id: 'cylinder_1', position: [-1.2, 0, 0] as [number, number, number], label: 'CYL-1' },
    { id: 'cylinder_2', position: [-0.4, 0, 0] as [number, number, number], label: 'CYL-2' },
    { id: 'cylinder_3', position: [0.4, 0, 0] as [number, number, number], label: 'CYL-3' },
    { id: 'cylinder_4', position: [1.2, 0, 0] as [number, number, number], label: 'CYL-4' },
  ], []);

  const [hoveredCyl, setHoveredCyl] = useState<string | null>(null);
  const materialRefs = useRef<Record<string, THREE.MeshStandardMaterial | null>>({});
  useFrame(({ clock }) => {
    const material = anomalyCylinder ? materialRefs.current[anomalyCylinder] : null;
    if (material) material.emissiveIntensity = 5 + Math.sin(clock.elapsedTime * 7) * 2;
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Outer Casing */}
      <mesh>
        <boxGeometry args={[4, 1.5, 1.5]} />
        <meshPhysicalMaterial
          color="#18181b"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.9}
          clearcoat={1}
        />
        <Edges color="#3f3f46" threshold={15} />
      </mesh>

      {/* Internal Pistons with Interactive Tooltips */}
      {cylinders.map((cyl) => {
        const isAnomaly = anomalyCylinder === cyl.id;
        const isHovered = hoveredCyl === cyl.id;
        const color = isAnomaly ? '#ef4444' : (isHovered ? '#06b6d4' : '#10b981');
        const emissiveIntensity = isAnomaly ? 6 : (isHovered ? 3 : 1.5);

        return (
          <mesh 
            key={cyl.id} 
            position={cyl.position}
            onPointerOver={() => setHoveredCyl(cyl.id)}
            onPointerOut={() => setHoveredCyl(null)}
          >
            <cylinderGeometry args={[0.3, 0.3, 1.2, 32]} />
            <meshStandardMaterial
              ref={(material) => { materialRefs.current[cyl.id] = material; }}
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity}
              toneMapped={false}
            />
            <Edges color="#ffffff" transparent opacity={0.3} />
            
            {/* Holographic Label */}
            {(isAnomaly || isHovered) && (
              <Html position={[0, 1, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                <div className={`px-2 py-1 text-[10px] font-mono border backdrop-blur-md rounded-sm whitespace-nowrap
                  ${isAnomaly ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'}`}>
                  {cyl.label} {isAnomaly ? 'ERR: ISOLATE' : 'NOMINAL'}
                </div>
              </Html>
            )}
          </mesh>
        );
      })}

      {(anomalyCylinder === 'lubrication' || anomalyCylinder === 'cooling' || sensorSuspect) && (
        <group position={anomalyCylinder === 'lubrication' ? [1.8, -0.65, 0.8] : [0, 1.15, 0.7]}>
          <mesh>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color={sensorSuspect ? '#f59e0b' : '#06b6d4'} emissive={sensorSuspect ? '#f59e0b' : '#06b6d4'} emissiveIntensity={3} />
          </mesh>
          <Html position={[0, 0.45, 0]} center distanceFactor={10}>
            <div className={`px-2 py-1 text-[10px] font-mono border backdrop-blur-md rounded-sm whitespace-nowrap ${sensorSuspect ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'}`}>
              {sensorSuspect ? 'SENSOR CHECK' : anomalyCylinder?.toUpperCase()}
            </div>
          </Html>
        </group>
      )}
      
      <Scanner />
      <Propeller />
    </group>
  );
};

export interface SpatialTwinProps {
  anomalyLocation: string | null;
  sensorSuspect: boolean;
}

export const SpatialTwin: React.FC<SpatialTwinProps> = memo(({ anomalyLocation, sensorSuspect }) => {
  return (
    <div className="w-full h-[400px] bg-zinc-950 rounded-md border border-zinc-800 overflow-hidden relative cursor-crosshair">
      {/* Background digital scanner grid overlay via CSS */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-10" />
      
      <Canvas dpr={[1, 1.25]} camera={{ position: [0, 3, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[0, 5, 0]} intensity={2} color="#06b6d4" angle={0.5} penumbra={1} />
        
        <HolographicEngine anomalyCylinder={anomalyLocation} sensorSuspect={sensorSuspect} />
        
        {/* High-tech Ground Plane Grid */}
        <Grid 
          position={[0, -0.5, 0]} 
          args={[20, 20]} 
          cellSize={0.5} 
          cellThickness={1} 
          cellColor="#27272a" 
          sectionSize={2.5} 
          sectionThickness={1.5} 
          sectionColor="#3f3f46" 
          fadeDistance={15} 
          fadeStrength={1} 
        />
        <ContactShadows position={[0, -0.49, 0]} opacity={0.5} scale={10} blur={2} far={4} />

        <OrbitControls 
          enableZoom={true} 
          maxDistance={10} 
          minDistance={3} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
        />
        
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
});

export default SpatialTwin;
