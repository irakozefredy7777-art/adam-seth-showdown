import { useMemo } from "react";
import * as THREE from "three";
import type { Arena } from "./arenas";

export function Arena3D({ arena }: { arena: Arena }) {
  const rocks = useMemo(() => Array.from({ length: 14 }, () => ({
    x: (Math.random() - 0.5) * 30,
    z: -3 - Math.random() * 12,
    s: 0.4 + Math.random() * 1.2,
    r: Math.random() * Math.PI,
  })), [arena.name]);

  return (
    <>
      <color attach="background" args={[arena.sky]} />
      <fog attach="fog" args={[arena.fog, 8, 35]} />

      <ambientLight intensity={0.6} color={arena.fog} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.4}
        color={arena.accent}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 4, -4]} intensity={0.4} color={arena.sky} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={arena.ground} roughness={0.95} />
      </mesh>

      {/* arena ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[5.5, 6, 64]} />
        <meshStandardMaterial color={arena.accent} emissive={arena.accent} emissiveIntensity={0.5} />
      </mesh>

      {/* scenery rocks */}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s / 2, r.z]} rotation={[0, r.r, 0]} castShadow>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={arena.ground} roughness={1} />
        </mesh>
      ))}

      {/* back pillars */}
      {[-8, 8].map((x) => (
        <mesh key={x} position={[x, 3, -8]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 6, 8]} />
          <meshStandardMaterial color={arena.accent} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
}
