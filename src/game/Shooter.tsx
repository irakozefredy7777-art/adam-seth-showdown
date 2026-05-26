import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  rotationY: number;
  isPlayer?: boolean;
  firing?: boolean;
  hit?: boolean;
  walking?: boolean;
  shirtColor?: string;
  skinColor?: string;
  scale?: number;
}

export function Shooter({
  position,
  rotationY,
  isPlayer,
  firing,
  hit,
  walking,
  shirtColor = "#2d5a8a",
  skinColor = "#f2cba0",
  scale = 1,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);
  const muzzleRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    // smooth follow target
    group.current.position.x += (position[0] - group.current.position.x) * Math.min(1, dt * 12);
    group.current.position.z += (position[2] - group.current.position.z) * Math.min(1, dt * 12);
    group.current.position.y = position[1];
    group.current.rotation.y += (rotationY - group.current.rotation.y) * Math.min(1, dt * 12);

    // walk cycle
    if (leftLeg.current && rightLeg.current) {
      const amp = walking ? 0.6 : 0;
      leftLeg.current.rotation.x = Math.sin(t * 10) * amp;
      rightLeg.current.rotation.x = -Math.sin(t * 10) * amp;
    }

    // gun recoil
    if (armRef.current) {
      const target = firing ? -0.2 : 0;
      armRef.current.position.z += (target - armRef.current.position.z) * Math.min(1, dt * 25);
    }

    // muzzle flash
    if (muzzleRef.current) {
      const mat = muzzleRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = firing ? 1 : 0;
      muzzleRef.current.scale.setScalar(firing ? 1 + Math.random() * 0.6 : 0.001);
    }

    // hit flash
    if (matRef.current) {
      matRef.current.emissiveIntensity = hit ? 1.2 : 0;
    }
  });

  return (
    <group ref={group} scale={scale}>
      {/* head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial ref={matRef} color={skinColor} emissive="#ff3030" emissiveIntensity={0} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.35]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
      {/* tac vest for player */}
      {isPlayer && (
        <mesh position={[0, 1.2, 0.18]}>
          <boxGeometry args={[0.55, 0.65, 0.08]} />
          <meshStandardMaterial color="#3a3a2a" roughness={0.9} />
        </mesh>
      )}
      {/* arms */}
      <mesh position={[-0.42, 1.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.2]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* gun arm, points forward (+Z in local) */}
      <group ref={armRef} position={[0.32, 1.25, 0.1]}>
        <mesh position={[0, -0.1, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.55, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* gun */}
        <group position={[0, -0.2, 0.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.2, 0.7]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* barrel */}
          <mesh position={[0, 0.02, 0.45]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* muzzle flash */}
          <mesh ref={muzzleRef} position={[0, 0.02, 0.65]} scale={0.001}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#fff2a0" emissive="#ffcf3a" emissiveIntensity={3} transparent opacity={0} />
          </mesh>
        </group>
      </group>
      {/* legs */}
      <mesh ref={leftLeg} position={[-0.16, 0.7, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.25]} />
        <meshStandardMaterial color="#2a2a35" />
      </mesh>
      <mesh ref={rightLeg} position={[0.16, 0.7, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.25]} />
        <meshStandardMaterial color="#2a2a35" />
      </mesh>
    </group>
  );
}
