import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  color: string;
  count?: number;
}

export function HitSparks({ position, color, count = 8 }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lifeRef = useRef(0);

  const velocities = useMemo(() => {
    return Array.from({ length: count }, () => ({
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 1,
      vz: (Math.random() - 0.5) * 4,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    lifeRef.current += dt;
    const life = lifeRef.current;

    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      const t = Math.min(life, 0.4);
      dummy.position.set(
        position[0] + v.vx * t,
        position[1] + v.vy * t - 4 * t * t,
        position[2] + v.vz * t
      );
      const s = Math.max(0, 0.1 * (1 - life / 0.4));
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </instancedMesh>
  );
}
