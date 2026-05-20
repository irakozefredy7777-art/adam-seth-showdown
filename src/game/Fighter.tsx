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
  blocking?: boolean;
}

export function Fighter({ position, isKid, attacking, hit, facing, swordColor, swordScale, skinColor = "#f0c8a0", shirtColor = "#3a6ea5", blocking = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const swordArm = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  const scale = isKid ? 0.7 : 1.6;

  useFrame((state, dt) => {
    if (!group.current || !swordArm.current || !bodyRef.current) return;
    const t = state.clock.elapsedTime;

    // idle bob
    bodyRef.current.position.y = Math.sin(t * 2 + (isKid ? 0 : 1)) * 0.04;

    // cape wave for Seth
    if (capeRef.current && !isKid) {
      capeRef.current.rotation.x = Math.sin(t * 3) * 0.1 + 0.2;
      capeRef.current.position.z = 0.3 + Math.sin(t * 2) * 0.05;
    }

    // attack swing
    const target = attacking ? -1.8 : -0.3;
    swordArm.current.rotation.x += (target - swordArm.current.rotation.x) * Math.min(1, dt * 14);

    // hit recoil
    const recoilTarget = hit ? facing * -0.5 : 0;
    group.current.position.x += (position[0] + recoilTarget - group.current.position.x) * Math.min(1, dt * 10);

    // blocking shield pulse
    if (shieldRef.current && blocking) {
      shieldRef.current.scale.setScalar(1 + Math.sin(t * 10) * 0.05);
      (shieldRef.current.material as THREE.MeshStandardMaterial).opacity = 0.4 + Math.sin(t * 8) * 0.15;
    } else if (shieldRef.current) {
      shieldRef.current.scale.setScalar(0.001);
    }

    group.current.rotation.y = facing === 1 ? Math.PI / 2 : -Math.PI / 2;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <group ref={bodyRef}>
        {/* === HEAD === */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>

        {/* Seth: horned helmet */}
        {!isKid && (
          <>
            <mesh position={[0, 2.35, 0]} castShadow>
              <sphereGeometry args={[0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* horns */}
            <mesh position={[0.28, 2.55, 0]} rotation={[0, 0, 0.6]} castShadow>
              <coneGeometry args={[0.06, 0.35, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.9} />
            </mesh>
            <mesh position={[-0.28, 2.55, 0]} rotation={[0, 0, -0.6]} castShadow>
              <coneGeometry args={[0.06, 0.35, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.9} />
            </mesh>
          </>
        )}

        {/* Adam: simple hair */}
        {isKid && (
          <mesh position={[0, 2.32, 0]} castShadow>
            <sphereGeometry args={[0.34, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3a2410" roughness={0.9} />
          </mesh>
        )}

        {/* eyes */}
        <mesh position={[0.15, 2.12, 0.28]}>
          <sphereGeometry args={[isKid ? 0.04 : 0.035]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.15, 2.12, 0.28]}>
          <sphereGeometry args={[isKid ? 0.04 : 0.035]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* === TORSO === */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={isKid ? [0.8, 1.1, 0.5] : [1.1, 1.3, 0.65]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>

        {/* Seth: chest armor plate */}
        {!isKid && (
          <mesh position={[0, 1.35, 0.34]} castShadow>
            <boxGeometry args={[0.7, 0.7, 0.1]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.7} />
          </mesh>
        )}

        {/* Seth: shoulder pauldrons */}
        {!isKid && (
          <>
            <mesh position={[0.6, 1.85, 0]} castShadow>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[-0.6, 1.85, 0]} castShadow>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.8} />
            </mesh>
          </>
        )}

        {/* belt */}
        <mesh position={[0, isKid ? 0.75 : 0.6, 0]}>
          <boxGeometry args={isKid ? [0.82, 0.15, 0.52] : [1.12, 0.18, 0.67]} />
          <meshStandardMaterial color="#3a2410" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* === LEGS === */}
        <mesh position={[isKid ? 0.22 : 0.3, 0.3, 0]} castShadow>
          <boxGeometry args={isKid ? [0.3, 1.0, 0.35] : [0.42, 1.2, 0.45]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
        <mesh position={[isKid ? -0.22 : -0.3, 0.3, 0]} castShadow>
          <boxGeometry args={isKid ? [0.3, 1.0, 0.35] : [0.42, 1.2, 0.45]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>

        {/* boots */}
        <mesh position={[isKid ? 0.22 : 0.3, -0.2, 0.05]}>
          <boxGeometry args={isKid ? [0.32, 0.2, 0.5] : [0.46, 0.28, 0.6]} />
          <meshStandardMaterial color="#1a0a05" />
        </mesh>
        <mesh position={[isKid ? -0.22 : -0.3, -0.2, 0.05]}>
          <boxGeometry args={isKid ? [0.32, 0.2, 0.5] : [0.46, 0.28, 0.6]} />
          <meshStandardMaterial color="#1a0a05" />
        </mesh>

        {/* Seth: metal boot tips */}
        {!isKid && (
          <>
            <mesh position={[0.3, -0.32, 0.15]}>
              <boxGeometry args={[0.48, 0.12, 0.25]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-0.3, -0.32, 0.15]}>
              <boxGeometry args={[0.48, 0.12, 0.25]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>
          </>
        )}

        {/* === LEFT ARM (shield side) === */}
        <mesh position={[-(isKid ? 0.55 : 0.75), isKid ? 1.4 : 1.6, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={isKid ? [0.25, 0.9, 0.25] : [0.35, 1.1, 0.35]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        {/* === SWORD ARM === */}
        <group ref={swordArm} position={[isKid ? 0.5 : 0.7, isKid ? 1.7 : 2.0, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={isKid ? [0.25, 0.9, 0.25] : [0.35, 1.1, 0.35]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* hand */}
          <mesh position={[0, -0.85, 0.1]}>
            <sphereGeometry args={[isKid ? 0.13 : 0.18]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* SWORD */}
          <group position={[0, -0.9, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} scale={swordScale}>
            {/* grip */}
            <mesh>
              <cylinderGeometry args={[isKid ? 0.05 : 0.08, isKid ? 0.05 : 0.08, isKid ? 0.35 : 0.5, 12]} />
              <meshStandardMaterial color="#3a1a0a" roughness={0.9} />
            </mesh>
            {/* guard */}
            <mesh position={[0, isKid ? 0.2 : 0.28, 0]}>
              <boxGeometry args={[isKid ? 0.5 : 0.8, 0.08, 0.15]} />
              <meshStandardMaterial color="#5a4020" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* blade */}
            <mesh position={[0, isKid ? 1.05 : 1.4, 0]} castShadow>
              <boxGeometry args={[isKid ? 0.16 : 0.24, isKid ? 1.6 : 2.2, 0.04]} />
              <meshStandardMaterial color={swordColor} metalness={0.95} roughness={0.15} emissive={swordColor} emissiveIntensity={0.25} />
            </mesh>
            {/* tip */}
            <mesh position={[0, isKid ? 1.9 : 2.55, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[isKid ? 0.12 : 0.17, isKid ? 0.12 : 0.17, 0.04]} />
              <meshStandardMaterial color={swordColor} metalness={0.95} roughness={0.15} />
            </mesh>
            {/* pommel */}
            <mesh position={[0, -(isKid ? 0.22 : 0.32), 0]}>
              <sphereGeometry args={[isKid ? 0.09 : 0.14]} />
              <meshStandardMaterial color="#a07030" metalness={0.7} />
            </mesh>
          </group>
        </group>

        {/* Seth: cape */}
        {!isKid && (
          <group ref={capeRef} position={[0, 1.6, -0.4]}>
            <mesh rotation={[0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.9, 1.6, 0.06]} />
              <meshStandardMaterial color="#3a1010" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Adam: small scarf */}
        {isKid && (
          <mesh position={[0, 1.82, -0.28]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.4]} />
            <meshStandardMaterial color="#8a5a3a" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Block shield (Adam only) */}
      {isKid && (
        <mesh ref={shieldRef} position={[-0.6, 1.2, 0.5]} rotation={[0, 0.3, 0]} scale={0.001}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#6ab8ff" transparent opacity={0.3} emissive="#6ab8ff" emissiveIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
