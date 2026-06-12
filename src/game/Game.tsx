import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Arena3D } from "./Arena3D";
import { Shooter } from "./Shooter";
import { Bullet } from "./Bullet";
import { ARENAS } from "./arenas";

type Phase = "intro" | "fight" | "victory" | "defeat" | "complete";

interface EnemyState {
  id: number;
  x: number;
  z: number;
  hp: number;
  rot: number;
  hit: boolean;
  shirt: string;
}

interface BulletState {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  ttl: number;
  fromPlayer: boolean;
}

interface DamagePopup {
  id: number;
  value: string;
  x: string;
  y: string;
  color: string;
}

let bulletId = 0;
let popupId = 0;

const ARENA_BOUND = 22;

function GameScene({
  arena,
  playerPos,
  playerRot,
  playerFiring,
  playerWalking,
  playerRunning,
  enemies,
  bullets,
  onPlayerHit,
}: {
  arena: ReturnType<typeof getArena>;
  playerPos: { x: number; z: number };
  playerRot: number;
  playerFiring: boolean;
  playerWalking: boolean;
  playerRunning: boolean;
  enemies: EnemyState[];
  bullets: BulletState[];
  onPlayerHit: (id: number) => void;
}) {
  const { camera } = useThree();
  void onPlayerHit;
  useFrame(() => {
    // 3rd person camera follow
    const camTargetX = playerPos.x - Math.sin(playerRot) * 6;
    const camTargetZ = playerPos.z - Math.cos(playerRot) * 6;
    camera.position.x += (camTargetX - camera.position.x) * 0.12;
    camera.position.z += (camTargetZ - camera.position.z) * 0.12;
    camera.position.y += (5 - camera.position.y) * 0.1;
    camera.lookAt(playerPos.x + Math.sin(playerRot) * 3, 1.2, playerPos.z + Math.cos(playerRot) * 3);
  });
  return (
    <>
      <Arena3D arena={arena} />
      <Shooter
        position={[playerPos.x, 0, playerPos.z]}
        rotationY={playerRot}
        isPlayer
        firing={playerFiring}
        walking={playerWalking}
        running={playerRunning}
        shirtColor="#2d5a8a"
        skinColor="#f2cba0"
      />
      {enemies.map((e) => (
        <Shooter
          key={e.id}
          position={[e.x, 0, e.z]}
          rotationY={e.rot}
          hit={e.hit}
          walking
          shirtColor={e.shirt}
          skinColor="#c89878"
          scale={1.05}
        />
      ))}
      {bullets.map((b) => (
        <Bullet key={b.id} position={[b.x, b.y, b.z]} />
      ))}
    </>
  );
}

function getArena(stage: number) {
  return ARENAS[stage];
}

export default function Game() {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const arena = ARENAS[stage];

  const [playerHp, setPlayerHp] = useState(arena.playerHp);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 4 });
  const [playerRot, setPlayerRot] = useState(0);
  const [playerFiring, setPlayerFiring] = useState(false);
  const [playerWalking, setPlayerWalking] = useState(false);
  const [playerRunning, setPlayerRunning] = useState(false);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const [popups, setPopups] = useState<DamagePopup[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [kills, setKills] = useState(0);

  const keys = useRef<Record<string, boolean>>({});
  const lastShot = useRef(0);
  const mouseX = useRef(0);
  const enemyShotCd = useRef<Record<number, number>>({});

  const addPopup = useCallback((value: string, x: string, y: string, color: string) => {
    const id = ++popupId;
    setPopups((p) => [...p, { id, value, x, y, color }]);
    setTimeout(() => setPopups((p) => p.filter((d) => d.id !== id)), 800);
  }, []);

  // spawn enemies per stage
  useEffect(() => {
    setPlayerHp(arena.playerHp);
    setPlayerPos({ x: 0, z: 4 });
    setPlayerRot(0);
    setKills(0);
    setBullets([]);
    const colors = ["#5a1a1a", "#3a2a1a", "#2a3a1a", "#4a1a3a", "#1a3a4a"];
    const newEnemies: EnemyState[] = Array.from({ length: arena.enemyCount }, (_, i) => {
      const a = (i / arena.enemyCount) * Math.PI * 2;
      const r = 12 + Math.random() * 6;
      return {
        id: i + Date.now(),
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 4,
        hp: arena.enemyHp,
        rot: a + Math.PI,
        hit: false,
        shirt: colors[i % colors.length],
      };
    });
    setEnemies(newEnemies);
    setPhase("intro");
    const t = setTimeout(() => setPhase("fight"), 1800);
    return () => clearTimeout(t);
  }, [stage, arena.playerHp, arena.enemyCount, arena.enemyHp]);

  // input
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (phase !== "fight") {
        if (e.key === " " || e.key === "Enter") {
          if (phase === "victory") {
            if (stage < ARENAS.length - 1) setStage((s) => s + 1);
            else setPhase("complete");
          } else if (phase === "defeat" || phase === "complete") {
            setStage(0);
          }
        }
      }
    };
    const ku = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    const mm = (e: MouseEvent) => {
      mouseX.current += e.movementX * 0.003;
      setPlayerRot(-mouseX.current);
    };
    const md = () => { keys.current["fire"] = true; };
    const mu = () => { keys.current["fire"] = false; };
    const click = () => {
      const el = document.getElementById("game-canvas");
      if (el && document.pointerLockElement !== el) {
        el.requestPointerLock?.();
      }
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("click", click);
    };
  }, [phase, stage]);

  // main game tick
  useEffect(() => {
    if (phase !== "fight") return;
    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // move player
      setPlayerPos((p) => {
        const speed = 6 * dt;
        const fwd = (keys.current["w"] ? 1 : 0) - (keys.current["s"] ? 1 : 0);
        const strafe = (keys.current["d"] ? 1 : 0) - (keys.current["a"] ? 1 : 0);
        const sin = Math.sin(playerRot);
        const cos = Math.cos(playerRot);
        let nx = p.x + (sin * fwd + cos * strafe) * speed;
        let nz = p.z + (cos * fwd - sin * strafe) * speed;
        nx = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, nx));
        nz = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, nz));
        return { x: nx, z: nz };
      });

      // player shoot
      if (keys.current["fire"] && now - lastShot.current > arena.fireRate) {
        lastShot.current = now;
        setPlayerFiring(true);
        setTimeout(() => setPlayerFiring(false), 80);
        setBullets((bs) => [
          ...bs,
          {
            id: ++bulletId,
            x: playerPos.x + Math.sin(playerRot) * 0.8,
            y: 1.3,
            z: playerPos.z + Math.cos(playerRot) * 0.8,
            vx: Math.sin(playerRot) * 50,
            vz: Math.cos(playerRot) * 50,
            ttl: 1.2,
            fromPlayer: true,
          },
        ]);
      }

      // enemies AI
      setEnemies((es) =>
        es.map((e) => {
          const dx = playerPos.x - e.x;
          const dz = playerPos.z - e.z;
          const dist = Math.hypot(dx, dz) || 1;
          const rot = Math.atan2(dx, dz);
          // move toward player but stop at shoot range
          const range = 8;
          let nx = e.x;
          let nz = e.z;
          if (dist > range) {
            nx += (dx / dist) * arena.enemySpeed * dt;
            nz += (dz / dist) * arena.enemySpeed * dt;
          }
          // shoot
          const lastEnemyShot = enemyShotCd.current[e.id] || 0;
          if (dist < range + 4 && now - lastEnemyShot > 1400) {
            enemyShotCd.current[e.id] = now;
            setBullets((bs) => [
              ...bs,
              {
                id: ++bulletId,
                x: e.x + (dx / dist) * 0.6,
                y: 1.3,
                z: e.z + (dz / dist) * 0.6,
                vx: (dx / dist) * 22,
                vz: (dz / dist) * 22,
                ttl: 1.5,
                fromPlayer: false,
              },
            ]);
          }
          return { ...e, x: nx, z: nz, rot };
        })
      );

      // bullet physics + collisions
      setBullets((bs) => {
        const remaining: BulletState[] = [];
        for (const b of bs) {
          const nx = b.x + b.vx * dt;
          const nz = b.z + b.vz * dt;
          const nttl = b.ttl - dt;
          if (nttl <= 0) continue;

          let consumed = false;
          if (b.fromPlayer) {
            // check enemy hits
            setEnemies((es) => {
              const hitIdx = es.findIndex((e) => Math.hypot(e.x - nx, e.z - nz) < 0.7);
              if (hitIdx === -1) return es;
              consumed = true;
              const copy = [...es];
              const target = { ...copy[hitIdx] };
              target.hp -= arena.gunDamage;
              target.hit = true;
              setTimeout(() => {
                setEnemies((cur) => cur.map((c) => (c.id === target.id ? { ...c, hit: false } : c)));
              }, 150);
              if (target.hp <= 0) {
                addPopup("KILL", "50%", "40%", "#ffcc55");
                setKills((k) => k + 1);
                copy.splice(hitIdx, 1);
              } else {
                addPopup(`-${arena.gunDamage}`, "55%", "45%", "#ffaa55");
                copy[hitIdx] = target;
              }
              return copy;
            });
          } else {
            // check player hit
            if (Math.hypot(playerPos.x - nx, playerPos.z - nz) < 0.7) {
              consumed = true;
              setPlayerHp((hp) => {
                const next = Math.max(0, hp - arena.enemyDamage);
                if (next <= 0) setPhase("defeat");
                return next;
              });
              setScreenFlash(true);
              setTimeout(() => setScreenFlash(false), 150);
              addPopup(`-${arena.enemyDamage}`, "45%", "55%", "#ff5555");
            }
          }
          if (!consumed) remaining.push({ ...b, x: nx, z: nz, ttl: nttl });
        }
        return remaining;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, playerRot, playerPos.x, playerPos.z, arena, addPopup]);

  // victory check
  useEffect(() => {
    if (phase === "fight" && enemies.length === 0 && kills > 0) {
      setPhase("victory");
    }
  }, [enemies.length, phase, kills]);

  const hpPct = (playerHp / arena.playerHp) * 100;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background" id="game-canvas">
      <Canvas shadows camera={{ position: [0, 5, -2], fov: 65 }}>
        <GameScene
          arena={arena}
          playerPos={playerPos}
          playerRot={playerRot}
          playerFiring={playerFiring}
          enemies={enemies}
          bullets={bullets}
          onPlayerHit={() => {}}
        />
      </Canvas>

      {/* crosshair */}
      {phase === "fight" && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-5 w-5 rounded-full border-2 border-white/80 shadow-lg" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
      )}

      {/* screen flash */}
      {screenFlash && (
        <div className="pointer-events-none absolute inset-0 bg-red-600/30" style={{ animation: "flashOut 0.15s ease-out forwards" }} />
      )}

      {/* popups */}
      {popups.map((d) => (
        <div
          key={d.id}
          className="pointer-events-none absolute font-display text-2xl font-bold damage-float"
          style={{ left: d.x, top: d.y, color: d.color }}
        >
          {d.value}
        </div>
      ))}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-6">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-8">
          <div style={{ maxWidth: 320, flex: 1 }}>
            <div className="mb-1 flex items-baseline justify-between font-display text-sm uppercase tracking-[0.3em]">
              <span style={{ color: "var(--hp-adam)" }}>ADAM</span>
              <span className="text-muted-foreground">{Math.ceil(playerHp)} / {arena.playerHp}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-sm border border-border bg-muted">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${hpPct}%`,
                  background: `linear-gradient(90deg, var(--hp-adam), color-mix(in oklab, var(--hp-adam) 60%, white))`,
                }}
              />
            </div>
            <div className="mt-2 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Weapon: <span className="text-primary">{arena.gunName}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Stage {stage + 1} / 5</div>
            <div className="font-display text-2xl text-primary glow">{arena.name}</div>
          </div>
          <div className="text-right" style={{ maxWidth: 320, flex: 1 }}>
            <div className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Hostiles</div>
            <div className="font-display text-3xl" style={{ color: "var(--hp-seth)" }}>{enemies.length}</div>
            <div className="mt-1 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Kills: {kills}</div>
          </div>
        </div>
      </div>

      {/* controls hint */}
      {phase === "fight" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">WASD</span> move &nbsp;·&nbsp;
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">MOUSE</span> aim &nbsp;·&nbsp;
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">CLICK</span> fire
        </div>
      )}

      {/* overlays */}
      {phase === "intro" && <Overlay title={arena.name} subtitle={arena.subtitle} />}
      {phase === "victory" && (
        <Overlay
          title={stage < ARENAS.length - 1 ? "Area Clear" : "Final Stand Cleared"}
          subtitle={stage < ARENAS.length - 1 ? `Next: ${ARENAS[stage + 1].name} — ${ARENAS[stage + 1].gunName} unlocked` : "The city is yours"}
          cta="Press SPACE to continue"
        />
      )}
      {phase === "defeat" && <Overlay title="Down" subtitle="You were overwhelmed" cta="Press SPACE to retry" tone="bad" />}
      {phase === "complete" && <Overlay title="Legend of Adam" subtitle="All five districts cleared" cta="Press SPACE to begin again" />}
    </div>
  );
}

function Overlay({ title, subtitle, cta, tone = "good" }: { title: string; subtitle: string; cta?: string; tone?: "good" | "bad" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="text-center">
        <h1 className={`font-display text-7xl ${tone === "bad" ? "text-destructive" : "text-primary"} glow`}>{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        {cta && <p className="mt-8 font-display text-sm uppercase tracking-[0.4em] text-foreground/80">{cta}</p>}
      </div>
    </div>
  );
}
