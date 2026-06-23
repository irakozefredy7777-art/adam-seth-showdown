import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
}

export function MedKit({ position }: Props) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = position[1] + 0.6 + Math.sin(t * 2.5) * 0.12;
    group.current.rotation.y = t * 1.4;
  });
  return (
    <group ref={group} position={position}>
      {/* glow halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <ringGeometry args={[0.55, 0.85, 24]} />
        <meshBasicMaterial color="#5cff8a" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* white kit body */}
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.4, 0.55]} />
        <meshStandardMaterial color="#f4f4f4" emissive="#5cff8a" emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      {/* red cross */}
      <mesh position={[0, 0.001, 0.281]}>
        <boxGeometry args={[0.34, 0.08, 0.01]} />
        <meshStandardMaterial color="#e63a3a" emissive="#e63a3a" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.001, 0.281]}>
        <boxGeometry args={[0.08, 0.34, 0.01]} />
        <meshStandardMaterial color="#e63a3a" emissive="#e63a3a" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}
