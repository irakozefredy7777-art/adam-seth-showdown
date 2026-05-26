import { useMemo } from "react";
import type { Arena } from "./arenas";
import { Car } from "./Car";

export function Arena3D({ arena }: { arena: Arena }) {
  const cars = useMemo(() => {
    const colors = ["#b03030", "#2a4a8a", "#1a1a1a", "#d4a020", "#3a7a3a", "#7a3a7a", "#c0c0c0"];
    return Array.from({ length: arena.carCount }, (_, i) => {
      const angle = (i / arena.carCount) * Math.PI * 2 + Math.random();
      const r = 10 + Math.random() * 12;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        rot: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
      };
    });
  }, [arena.name, arena.carCount]);

  const debris = useMemo(() => Array.from({ length: 18 }, () => ({
    x: (Math.random() - 0.5) * 50,
    z: (Math.random() - 0.5) * 50,
    s: 0.2 + Math.random() * 0.5,
    r: Math.random() * Math.PI,
  })), [arena.name]);

  return (
    <>
      <color attach="background" args={[arena.sky]} />
      <fog attach="fog" args={[arena.fog, 12, 55]} />

      <ambientLight intensity={0.55} color={arena.fog} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        color={arena.accent}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[-10, 6, -8]} intensity={0.35} color={arena.sky} />

      {/* flat asphalt ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={arena.ground} roughness={0.95} />
      </mesh>

      {/* road lane markings - cross pattern */}
      {[-1, 1].map((d) => (
        <mesh key={`h${d}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, d * 8]}>
          <planeGeometry args={[60, 0.3]} />
          <meshStandardMaterial color="#e8e0a0" emissive="#e8e0a0" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {[-1, 1].map((d) => (
        <mesh key={`v${d}`} rotation={[-Math.PI / 2, 0, 0]} position={[d * 8, 0.01, 0]}>
          <planeGeometry args={[0.3, 60]} />
          <meshStandardMaterial color="#e8e0a0" emissive="#e8e0a0" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* sidewalks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 14]} receiveShadow>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -14]} receiveShadow>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
      </mesh>

      {/* buildings around perimeter */}
      {[-22, 22].map((x) =>
        [-18, -6, 6, 18].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 4, z]} castShadow>
            <boxGeometry args={[6, 8, 6]} />
            <meshStandardMaterial color={arena.accent} roughness={0.85} />
          </mesh>
        ))
      )}

      {/* cars */}
      {cars.map((c, i) => (
        <Car key={i} position={[c.x, 0, c.z]} rotation={c.rot} color={c.color} />
      ))}

      {/* debris */}
      {debris.map((r, i) => (
        <mesh key={i} position={[r.x, r.s / 2, r.z]} rotation={[0, r.r, 0]} castShadow>
          <boxGeometry args={[r.s, r.s, r.s]} />
          <meshStandardMaterial color="#2a2a2a" roughness={1} />
        </mesh>
      ))}
    </>
  );
}
