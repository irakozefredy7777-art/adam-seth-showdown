interface Props {
  position: [number, number, number];
  rotation?: number;
  color?: string;
  destroyed?: boolean;
}

export function Car({ position, rotation = 0, color = "#b03030", destroyed = false }: Props) {
  if (destroyed) {
    return (
      <group position={position} rotation={[0, rotation, 0.15]}>
        {/* burnt out hulk */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.55, 4]} />
          <meshStandardMaterial color="#1a1410" roughness={1} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.75, -0.1]} castShadow>
          <boxGeometry args={[1.7, 0.45, 1.8]} />
          <meshStandardMaterial color="#0a0808" roughness={1} />
        </mesh>
        {/* smoldering glow */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#ff5a1a" emissive="#ff5a1a" emissiveIntensity={1.4} transparent opacity={0.55} />
        </mesh>
        {[
          [-0.95, 0.25, 1.3],
          [0.95, 0.25, 1.3],
          [-0.95, 0.25, -1.3],
          [0.95, 0.25, -1.3],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.28, 12]} />
            <meshStandardMaterial color="#050505" roughness={1} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.7, 4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 1.05, -0.1]} castShadow>
        <boxGeometry args={[1.8, 0.7, 2]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* windows trim */}
      <mesh position={[0, 1.05, -0.1]}>
        <boxGeometry args={[1.82, 0.5, 2.02]} />
        <meshStandardMaterial color="#5ab8e8" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* wheels */}
      {[
        [-0.95, 0.3, 1.3],
        [0.95, 0.3, 1.3],
        [-0.95, 0.3, -1.3],
        [0.95, 0.3, -1.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* headlights */}
      <mesh position={[-0.6, 0.55, 2]}>
        <boxGeometry args={[0.35, 0.2, 0.05]} />
        <meshStandardMaterial color="#fff8c0" emissive="#fff8c0" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.6, 0.55, 2]}>
        <boxGeometry args={[0.35, 0.2, 0.05]} />
        <meshStandardMaterial color="#fff8c0" emissive="#fff8c0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}
