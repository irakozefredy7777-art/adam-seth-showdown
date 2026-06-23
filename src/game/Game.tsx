import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Arena3D, type CarInstance, type MedKitInstance } from "./Arena3D";
import { Shooter } from "./Shooter";
import { Bullet } from "./Bullet";
import { Explosion } from "./Explosion";
import { ARENAS, blockersFor } from "./arenas";
import { Sound } from "./sound";
import { STORY } from "./story";


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

interface ExplosionState {
  id: number;
  x: number;
  z: number;
  startedAt: number;
}

let bulletId = 0;
let popupId = 0;
let explosionId = 0;
let carIdCounter = 0;

const ARENA_BOUND = 26;
const PLAYER_RADIUS = 0.5;
const CAR_HALF_X = 1.1;
const CAR_HALF_Z = 2.1;

function buildCars(arena: typeof ARENAS[number]): CarInstance[] {
  const colors = ["#b03030", "#2a4a8a", "#1a1a1a", "#d4a020", "#3a7a3a", "#7a3a7a", "#c0c0c0"];
  return Array.from({ length: arena.carCount }, (_, i) => {
    const angle = (i / arena.carCount) * Math.PI * 2 + (i * 0.7);
    const r = 10 + ((i * 3.1) % 12);
    return {
      id: ++carIdCounter,
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      rot: (i * 1.3) % (Math.PI * 2),
      color: colors[i % colors.length],
      hp: 60,
      destroyed: false,
    };
  });
}

// Collision: returns true if the AABB of the point (with radius) hits any blocker.
function collidesAt(x: number, z: number, cars: CarInstance[], blockers: { x: number; z: number; halfX: number; halfZ: number }[]) {
  for (const b of blockers) {
    if (
      x > b.x - b.halfX - PLAYER_RADIUS &&
      x < b.x + b.halfX + PLAYER_RADIUS &&
      z > b.z - b.halfZ - PLAYER_RADIUS &&
      z < b.z + b.halfZ + PLAYER_RADIUS
    ) return true;
  }
  for (const c of cars) {
    if (c.destroyed) continue;
    const dx = x - c.x;
    const dz = z - c.z;
    const cos = Math.cos(-c.rot);
    const sin = Math.sin(-c.rot);
    const lx = dx * cos - dz * sin;
    const lz = dx * sin + dz * cos;
    if (
      Math.abs(lx) < CAR_HALF_X + PLAYER_RADIUS &&
      Math.abs(lz) < CAR_HALF_Z + PLAYER_RADIUS
    ) return true;
  }
  return false;
}


function GameScene({
  arena,
  cars,
  playerPos,
  playerRot,
  playerFiring,
  playerWalking,
  playerRunning,
  enemies,
  bullets,
  explosions,
}: {
  arena: typeof ARENAS[number];
  cars: CarInstance[];
  playerPos: { x: number; z: number };
  playerRot: number;
  playerFiring: boolean;
  playerWalking: boolean;
  playerRunning: boolean;
  enemies: EnemyState[];
  bullets: BulletState[];
  explosions: ExplosionState[];
}) {
  const { camera } = useThree();
  useFrame(() => {
    const camTargetX = playerPos.x - Math.sin(playerRot) * 6;
    const camTargetZ = playerPos.z - Math.cos(playerRot) * 6;
    camera.position.x += (camTargetX - camera.position.x) * 0.12;
    camera.position.z += (camTargetZ - camera.position.z) * 0.12;
    camera.position.y += (5 - camera.position.y) * 0.1;
    camera.lookAt(playerPos.x + Math.sin(playerRot) * 3, 1.2, playerPos.z + Math.cos(playerRot) * 3);
  });
  return (
    <>
      <Arena3D arena={arena} cars={cars} />
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
      {explosions.map((ex) => (
        <Explosion key={ex.id} position={[ex.x, 0.6, ex.z]} startedAt={ex.startedAt} />
      ))}
    </>
  );
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
  const [explosions, setExplosions] = useState<ExplosionState[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [kills, setKills] = useState(0);
  const [cars, setCars] = useState<CarInstance[]>(() => buildCars(arena));
  const carsRef = useRef<CarInstance[]>(cars);
  useEffect(() => { carsRef.current = cars; }, [cars]);
  const [showSettings, setShowSettings] = useState(false);
  const [sfxOn, setSfxOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [stageFlash, setStageFlash] = useState(false);

  const keys = useRef<Record<string, boolean>>({});
  const lastShot = useRef(0);
  const mouseX = useRef(0);
  const enemyShotCd = useRef<Record<number, number>>({});

  const addPopup = useCallback((value: string, x: string, y: string, color: string) => {
    const id = ++popupId;
    setPopups((p) => [...p, { id, value, x, y, color }]);
    setTimeout(() => setPopups((p) => p.filter((d) => d.id !== id)), 800);
  }, []);

  const spawnExplosion = useCallback((x: number, z: number) => {
    const id = ++explosionId;
    setExplosions((e) => [...e, { id, x, z, startedAt: performance.now() / 1000 }]);
    setTimeout(() => setExplosions((e) => e.filter((x) => x.id !== id)), 1000);
  }, []);

  // spawn enemies + cars per stage
  useEffect(() => {
    setPlayerHp(arena.playerHp);
    setPlayerPos({ x: 0, z: 4 });
    setPlayerRot(0);
    setKills(0);
    setBullets([]);
    setExplosions([]);
    setCars(buildCars(arena));
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
    setStageFlash(true);
    setTimeout(() => setStageFlash(false), 700);
    if (stage > 0) Sound.levelUp();
    Sound.startMusic();
    const t = setTimeout(() => setPhase("fight"), 2600);
    return () => clearTimeout(t);
  }, [stage, arena]);

  // input
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === "Escape") {
        setShowSettings((s) => !s);
        if (document.pointerLockElement) document.exitPointerLock?.();
        return;
      }
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

      // move player with collision (axis-separated to allow sliding)
      const fwd = (keys.current["w"] ? 1 : 0) - (keys.current["s"] ? 1 : 0);
      const strafe = (keys.current["d"] ? 1 : 0) - (keys.current["a"] ? 1 : 0);
      const isMoving = fwd !== 0 || strafe !== 0;
      const isRunning = isMoving && (keys.current["shift"] || keys.current["shiftleft"] || keys.current["shiftright"]);
      setPlayerWalking(isMoving);
      setPlayerRunning(isRunning);
      setPlayerPos((p) => {
        const speed = (isRunning ? 11 : 6) * dt;
        const sin = Math.sin(playerRot);
        const cos = Math.cos(playerRot);
        const dx = (sin * fwd + cos * strafe) * speed;
        const dz = (cos * fwd - sin * strafe) * speed;
        let nx = p.x;
        let nz = p.z;
        const cs = carsRef.current;
        const tryX = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, p.x + dx));
        if (!collidesAt(tryX, p.z, cs)) nx = tryX;
        const tryZ = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, p.z + dz));
        if (!collidesAt(nx, tryZ, cs)) nz = tryZ;
        return { x: nx, z: nz };
      });

      // player shoot
      if (keys.current["fire"] && now - lastShot.current > arena.fireRate) {
        lastShot.current = now;
        setPlayerFiring(true);
        Sound.shoot();
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

      // enemies AI (with simple wall avoidance via collision)
      setEnemies((es) =>
        es.map((e) => {
          const dx = playerPos.x - e.x;
          const dz = playerPos.z - e.z;
          const dist = Math.hypot(dx, dz) || 1;
          const rot = Math.atan2(dx, dz);
          const range = 8;
          let nx = e.x;
          let nz = e.z;
          if (dist > range) {
            const stepX = (dx / dist) * arena.enemySpeed * dt;
            const stepZ = (dz / dist) * arena.enemySpeed * dt;
            const tx = e.x + stepX;
            const tz = e.z + stepZ;
            const cs = carsRef.current;
            if (!collidesAt(tx, e.z, cs)) nx = tx;
            if (!collidesAt(nx, tz, cs)) nz = tz;
          }
          const lastEnemyShot = enemyShotCd.current[e.id] || 0;
          if (dist < range + 4 && now - lastEnemyShot > 1400) {
            enemyShotCd.current[e.id] = now;
            Sound.enemyShoot();
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

          // bullets hit alive cars (either side)
          const cs = carsRef.current;
          for (const c of cs) {
            if (c.destroyed) continue;
            const ddx = nx - c.x;
            const ddz = nz - c.z;
            const cos = Math.cos(-c.rot);
            const sin = Math.sin(-c.rot);
            const lx = ddx * cos - ddz * sin;
            const lz = ddx * sin + ddz * cos;
            if (Math.abs(lx) < CAR_HALF_X && Math.abs(lz) < CAR_HALF_Z) {
              consumed = true;
              const dmg = b.fromPlayer ? arena.gunDamage : 5;
              setCars((cur) => cur.map((cc) => {
                if (cc.id !== c.id || cc.destroyed) return cc;
                const newHp = cc.hp - dmg;
                if (newHp <= 0) {
                  spawnExplosion(cc.x, cc.z);
                  Sound.explosion();
                  addPopup("BOOM", "50%", "42%", "#ff8a2a");
                  // damage nearby entities from blast
                  setEnemies((eList) => eList.flatMap((en) => {
                    const d = Math.hypot(en.x - cc.x, en.z - cc.z);
                    if (d < 4.5) {
                      const blast = 50;
                      const nh = en.hp - blast;
                      if (nh <= 0) {
                        setKills((k) => k + 1);
                        return [];
                      }
                      return [{ ...en, hp: nh, hit: true }];
                    }
                    return [en];
                  }));
                  const pd = Math.hypot(playerPos.x - cc.x, playerPos.z - cc.z);
                  if (pd < 4.5) {
                    setPlayerHp((hp) => {
                      const next = Math.max(0, hp - 25);
                      if (next <= 0) setPhase("defeat");
                      return next;
                    });
                    setScreenFlash(true);
                    setTimeout(() => setScreenFlash(false), 200);
                  }
                  return { ...cc, hp: 0, destroyed: true };
                }
                return { ...cc, hp: newHp };
              }));
              break;
            }
          }
          if (consumed) continue;

          if (b.fromPlayer) {
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
            if (Math.hypot(playerPos.x - nx, playerPos.z - nz) < 0.7) {
              consumed = true;
              Sound.hit();
              setPlayerHp((hp) => {
                const next = Math.max(0, hp - arena.enemyDamage);
                if (next <= 0) { setPhase("defeat"); Sound.defeat(); Sound.stopMusic(); }
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
  }, [phase, playerRot, playerPos.x, playerPos.z, arena, addPopup, spawnExplosion]);

  // victory check
  useEffect(() => {
    if (phase === "fight" && enemies.length === 0 && kills > 0) {
      setPhase("victory");
      Sound.victory();
    }
  }, [enemies.length, phase, kills]);

  const hpPct = (playerHp / arena.playerHp) * 100;
  const sceneCars = useMemo(() => cars, [cars]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background" id="game-canvas">
      <Canvas shadows camera={{ position: [0, 5, -2], fov: 65 }}>
        <GameScene
          arena={arena}
          cars={sceneCars}
          playerPos={playerPos}
          playerRot={playerRot}
          playerFiring={playerFiring}
          playerWalking={playerWalking}
          playerRunning={playerRunning}
          enemies={enemies}
          bullets={bullets}
          explosions={explosions}
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
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">SHIFT</span> run &nbsp;·&nbsp;
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">CLICK</span> fire
        </div>
      )}

      {/* level change flash */}
      {stageFlash && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${arena.accent}55, transparent 70%)`,
            animation: "flashOut 0.7s ease-out forwards",
          }}
        />
      )}

      {/* overlays */}
      {phase === "intro" && (
        <Overlay
          title={arena.name}
          subtitle={arena.subtitle}
          story={stage === 0 ? STORY.intro : STORY.stages[stage]}
        />
      )}
      {phase === "victory" && (
        <Overlay
          title={stage < ARENAS.length - 1 ? "Area Clear" : "Final Stand Cleared"}
          subtitle={stage < ARENAS.length - 1 ? `Next: ${ARENAS[stage + 1].name} — ${ARENAS[stage + 1].gunName} unlocked` : "The city is yours"}
          cta="Press SPACE to continue"
        />
      )}
      {phase === "defeat" && <Overlay title="Down" subtitle="You were overwhelmed" cta="Press SPACE to retry" tone="bad" />}
      {phase === "complete" && (
        <Overlay
          title="Legend of Adam"
          subtitle="All five districts cleared. The harbor is yours."
          cta="Press SPACE to begin again"
        />
      )}

      {/* settings button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowSettings((s) => !s); if (document.pointerLockElement) document.exitPointerLock?.(); }}
        className="absolute right-4 top-4 z-20 rounded border border-border bg-card/70 px-3 py-1 font-display text-xs uppercase tracking-[0.3em] text-foreground/80 backdrop-blur hover:bg-card"
      >
        ⚙ Menu
      </button>

      {/* settings panel */}
      {showSettings && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="w-[min(420px,90vw)] rounded border border-border bg-card p-8 shadow-2xl">
            <h2 className="font-display text-3xl text-primary glow">Settings</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">Press ESC to close</p>
            <div className="mt-6 space-y-4">
              <SettingRow label="Sound Effects" on={sfxOn} onToggle={() => { const n = !sfxOn; setSfxOn(n); Sound.setSfx(n); }} />
              <SettingRow label="Music" on={musicOn} onToggle={() => { const n = !musicOn; setMusicOn(n); Sound.setMusic(n); }} />
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Story</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{STORY.intro}</p>
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Controls</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <div>WASD</div><div className="text-right text-foreground">Move</div>
                <div>Shift</div><div className="text-right text-foreground">Run</div>
                <div>Mouse</div><div className="text-right text-foreground">Aim</div>
                <div>Click</div><div className="text-right text-foreground">Fire</div>
                <div>Esc</div><div className="text-right text-foreground">Menu</div>
                <div>Space</div><div className="text-right text-foreground">Continue / Retry</div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-8 w-full rounded border-2 border-primary bg-primary/10 py-3 font-display text-sm uppercase tracking-[0.4em] text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded border border-border bg-muted/30 px-4 py-3">
      <span className="font-display text-sm uppercase tracking-[0.3em] text-foreground/90">{label}</span>
      <button
        onClick={onToggle}
        className={`rounded px-4 py-1 font-display text-xs uppercase tracking-[0.3em] transition ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
      >
        {on ? "On" : "Off"}
      </button>
    </div>
  );
}

function Overlay({ title, subtitle, cta, tone = "good", story }: { title: string; subtitle: string; cta?: string; tone?: "good" | "bad"; story?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="max-w-2xl px-8 text-center">
        <h1 className={`font-display text-7xl ${tone === "bad" ? "text-destructive" : "text-primary"} glow`}>{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        {story && <p className="mt-6 text-base italic leading-relaxed text-foreground/80">&ldquo;{story}&rdquo;</p>}
        {cta && <p className="mt-8 font-display text-sm uppercase tracking-[0.4em] text-foreground/80">{cta}</p>}
      </div>
    </div>
  );
}
