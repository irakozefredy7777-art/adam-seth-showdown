import { useMemo } from "react";
import type { Arena } from "./arenas";
import { blockersFor } from "./arenas";
import { Car } from "./Car";
import { MedKit } from "./MedKit";

export interface CarInstance {
  id: number;
  x: number;
  z: number;
  rot: number;
  color: string;
  hp: number;
  destroyed: boolean;
}

export interface MedKitInstance {
  id: number;
  x: number;
  z: number;
  taken: boolean;
}

export function Arena3D({
  arena,
  cars,
  medkits = [],
}: {
  arena: Arena;
  cars: CarInstance[];
  medkits?: MedKitInstance[];
}) {
  const isForest = arena.biome === "forest" || arena.biome === "burned-forest";
  const isBurned = arena.biome === "burned-forest";

  const blockers = useMemo(() => blockersFor(arena.biome), [arena.biome]);

  const debris = useMemo(
    () =>
      Array.from({ length: isForest ? 28 : 18 }, () => ({
        x: (Math.random() - 0.5) * 50,
        z: (Math.random() - 0.5) * 50,
        s: 0.18 + Math.random() * 0.45,
        r: Math.random() * Math.PI,
      })),
    [arena.name, isForest]
  );

  // Bushes/rocks decorations for forest biomes (purely visual)
  const bushes = useMemo(() => {
    if (!isForest) return [];
    return Array.from({ length: 22 }, (_, i) => ({
      x: Math.cos(i * 1.37) * (5 + (i * 1.7) % 18),
      z: Math.sin(i * 1.91) * (5 + (i * 2.3) % 18),
      s: 0.5 + ((i * 17) % 5) * 0.15,
    }));
  }, [arena.name, isForest]);

  return (
    <>
      <color attach="background" args={[arena.sky]} />
      <fog attach="fog" args={[arena.fog, 12, 55]} />

      <ambientLight intensity={isForest ? 0.7 : 0.55} color={arena.fog} />
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

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={arena.ground} roughness={0.95} />
      </mesh>

      {/* road markings only for road-like biomes */}
      {(arena.biome === "city" || arena.biome === "highway" || arena.biome === "industrial") && (
        <>
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 14]} receiveShadow>
            <planeGeometry args={[60, 4]} />
            <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -14]} receiveShadow>
            <planeGeometry args={[60, 4]} />
            <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
          </mesh>
        </>
      )}

      {/* Render blockers — trees for forest, boxes otherwise */}
      {blockers.map((b, i) =>
        isForest ? (
          <group key={i} position={[b.x, 0, b.z]}>
            {/* trunk */}
            <mesh position={[0, 1.6, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.55, 3.2, 10]} />
              <meshStandardMaterial color={isBurned ? "#1a0f08" : "#5a3a22"} roughness={1} />
            </mesh>
            {/* canopy */}
            {!isBurned && (
              <mesh position={[0, 3.6, 0]} castShadow>
                <coneGeometry args={[1.8, 3, 10]} />
                <meshStandardMaterial color="#2f6a32" roughness={0.9} />
              </mesh>
            )}
            {isBurned && (
              <>
                <mesh position={[0.3, 3.2, 0]} rotation={[0, 0, 0.4]} castShadow>
                  <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
                  <meshStandardMaterial color="#2a1810" />
                </mesh>
                <mesh position={[-0.4, 3.4, 0.2]} rotation={[0, 0, -0.5]} castShadow>
                  <cylinderGeometry args={[0.05, 0.08, 1.0, 6]} />
                  <meshStandardMaterial color="#2a1810" />
                </mesh>
              </>
            )}
          </group>
        ) : (
          <mesh
            key={i}
            position={[b.x, arena.biome === "highway" ? 0.6 : (arena.biome === "plaza" ? 1.5 : 4), b.z]}
            castShadow
          >
            <boxGeometry
              args={[
                b.halfX * 2,
                arena.biome === "highway" ? 1.2 : (arena.biome === "plaza" ? 3 : 8),
                b.halfZ * 2,
              ]}
            />
            <meshStandardMaterial color={arena.accent} roughness={0.85} />
          </mesh>
        )
      )}

      {/* forest bush decorations (non-blocking) */}
      {bushes.map((b, i) => (
        <mesh key={`bush-${i}`} position={[b.x, b.s * 0.5, b.z]} castShadow>
          <sphereGeometry args={[b.s, 8, 8]} />
          <meshStandardMaterial color={isBurned ? "#2a1a10" : "#3a6a3a"} roughness={1} />
        </mesh>
      ))}

      {/* cars */}
      {cars.map((c) => (
        <Car key={c.id} position={[c.x, 0, c.z]} rotation={c.rot} color={c.color} destroyed={c.destroyed} />
      ))}

      {/* medkits */}
      {medkits.filter((m) => !m.taken).map((m) => (
        <MedKit key={m.id} position={[m.x, 0, m.z]} />
      ))}

      {/* debris */}
      {debris.map((r, i) => (
        <mesh key={i} position={[r.x, r.s / 2, r.z]} rotation={[0, r.r, 0]} castShadow>
          <boxGeometry args={[r.s, r.s, r.s]} />
          <meshStandardMaterial color={isBurned ? "#1a1208" : isForest ? "#3a2a18" : "#2a2a2a"} roughness={1} />
        </mesh>
      ))}
    </>
  );
}
