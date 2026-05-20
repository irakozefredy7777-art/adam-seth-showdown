import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  isKid?: boolean;
  attacking: boolean;
  hit: boolean;
  facing: 1 | -1;
  swordColor: string;
  swordScale: number;
  skinColor?: string;
  shirtColor?: string;
}

export function Fighter({ position, isKid, attacking, hit, facing, swordColor, swordScale, skinColor = "#f0c8a0", shirtColor = "#3a6ea5" }: Props) {
  const group = useRef<THREE.Group>(null);
  const swordArm = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const scale = isKid ? 0.7 : 1.4;

  useFrame((state, dt) => {
    if (!group.current || !swordArm.current || !bodyRef.current) return;
    // idle bob
    const t = state.clock.elapsedTime;
    bodyRef.current.position.y = Math.sin(t * 2 + (isKid ? 0 : 1)) * 0.04;

    // attack swing
    const target = attacking ? -1.8 : -0.3;
    swordArm.current.rotation.x += (target - swordArm.current.rotation.x) * Math.min(1, dt * 14);

    // hit recoil
    const recoilTarget = hit ? facing * -0.5 : 0;
    group.current.position.x += (position[0] + recoilTarget - group.current.position.x) * Math.min(1, dt * 10);

    group.current.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <group ref={bodyRef}>
        {/* head */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 2.32, 0]} castShadow>
          <sphereGeometry args={[0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={isKid ? "#3a2410" : "#1a0a05"} roughness={0.9} />
        </mesh>
        {/* eyes */}
        <mesh position={[0.15, 2.12, 0.25]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-0.15, 2.12, 0.25]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="#111" /></mesh>

        {/* torso */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.8, 1.1, 0.5]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>
        {/* belt */}
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.82, 0.15, 0.52]} />
          <meshStandardMaterial color="#3a2410" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* legs */}
        <mesh position={[0.22, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 1.0, 0.35]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
        <mesh position={[-0.22, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 1.0, 0.35]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
        {/* boots */}
        <mesh position={[0.22, -0.2, 0.05]}><boxGeometry args={[0.32, 0.2, 0.5]} /><meshStandardMaterial color="#1a0a05" /></mesh>
        <mesh position={[-0.22, -0.2, 0.05]}><boxGeometry args={[0.32, 0.2, 0.5]} /><meshStandardMaterial color="#1a0a05" /></mesh>

        {/* left arm (shield side) */}
        <mesh position={[-0.55, 1.4, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.25, 0.9, 0.25]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        {/* sword arm */}
        <group ref={swordArm} position={[0.5, 1.7, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[0.25, 0.9, 0.25]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* hand */}
          <mesh position={[0, -0.85, 0.1]}>
            <sphereGeometry args={[0.13]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* SWORD */}
          <group position={[0, -0.9, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} scale={swordScale}>
            {/* grip */}
            <mesh><cylinderGeometry args={[0.06, 0.06, 0.4, 12]} /><meshStandardMaterial color="#3a1a0a" roughness={0.9} /></mesh>
            {/* guard */}
            <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.5, 0.08, 0.15]} /><meshStandardMaterial color="#5a4020" metalness={0.8} roughness={0.3} /></mesh>
            {/* blade */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[0.18, 1.7, 0.04]} />
              <meshStandardMaterial color={swordColor} metalness={0.95} roughness={0.15} emissive={swordColor} emissiveIntensity={0.25} />
            </mesh>
            {/* tip */}
            <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.13, 0.13, 0.04]} />
              <meshStandardMaterial color={swordColor} metalness={0.95} roughness={0.15} />
            </mesh>
            {/* pommel */}
            <mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.09]} /><meshStandardMaterial color="#a07030" metalness={0.7} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
