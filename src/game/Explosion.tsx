import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  startedAt: number;
}

const DURATION = 0.9; // seconds

export function Explosion({ position, startedAt }: Props) {
  const core = useRef<THREE.Mesh>(null);
  const shock = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const t = Math.min(1, (performance.now() / 1000 - startedAt) / DURATION);
    const ease = 1 - Math.pow(1 - t, 2);
    const scale = 0.5 + ease * 3.2;
    if (core.current) {
      core.current.scale.setScalar(scale);
      (core.current.material as THREE.MeshStandardMaterial).opacity = 1 - t;
    }
    if (shock.current) {
      shock.current.scale.setScalar(0.5 + ease * 5);
      (shock.current.material as THREE.MeshStandardMaterial).opacity = (1 - t) * 0.7;
    }
    if (light.current) light.current.intensity = (1 - t) * 8;
  });

  return (
    <group position={position}>
      <pointLight ref={light} color="#ff7a2a" distance={14} intensity={8} />
      <mesh ref={core}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ff6a1a" emissiveIntensity={3} transparent opacity={1} />
      </mesh>
      <mesh ref={shock} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.1, 32]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={2} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
