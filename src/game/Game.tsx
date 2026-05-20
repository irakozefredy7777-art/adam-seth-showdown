import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Arena3D } from "./Arena3D";
import { Fighter } from "./Fighter";
import { ARENAS } from "./arenas";

interface DamageNumber {
  id: number;
  value: string;
  x: string;
  color: string;
  isBlock?: boolean;
}

type Phase = "intro" | "fight" | "victory" | "defeat" | "complete";

let dmgId = 0;

export default function Game() {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const arena = ARENAS[stage];

  const [adamHp, setAdamHp] = useState(arena.adamHp);
  const [sethHp, setSethHp] = useState(arena.sethHp);
  const [adamAttacking, setAdamAttacking] = useState(false);
  const [sethAttacking, setSethAttacking] = useState(false);
  const [adamHit, setAdamHit] = useState(false);
  const [sethHit, setSethHit] = useState(false);
  const [adamBlocking, setAdamBlocking] = useState(false);

  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);

  const adamCdRef = useRef(0);
  const sethCdRef = useRef(0);

  const addDamageNumber = useCallback((value: string, x: string, color: string, isBlock?: boolean) => {
    const id = ++dmgId;
    setDamageNumbers(prev => [...prev, { id, value, x, color, isBlock }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 900);
  }, []);

  const triggerHitEffects = useCallback((isAdamHit: boolean, isBlocked: boolean) => {
    setScreenFlash(true);
    setCameraShake(true);
    setTimeout(() => setScreenFlash(false), 120);
    setTimeout(() => setCameraShake(false), 250);

    if (isAdamHit) {
      if (isBlocked) {
        addDamageNumber("BLOCKED", "25%", "#6ab8ff", true);
      } else {
        addDamageNumber(`-${Math.round(arena.sethPower)}`, "25%", "#ff5555");
      }
    } else {
      addDamageNumber(`-${Math.round(arena.adamDamage)}`, "75%", "#ffcc55");
    }
  }, [addDamageNumber, arena.sethPower, arena.adamDamage]);

  // reset on stage change
  useEffect(() => {
    setAdamHp(arena.adamHp);
    setSethHp(arena.sethHp);
    setPhase("intro");
    const t = setTimeout(() => setPhase("fight"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  // seth AI attack loop
  useEffect(() => {
    if (phase !== "fight") return;
    const interval = setInterval(() => {
      setSethAttacking(true);
      setTimeout(() => setSethAttacking(false), 350);
      setTimeout(() => {
        setAdamHit(true);
        setTimeout(() => setAdamHit(false), 250);
        const wasBlocking = adamBlocking;
        setAdamHp((hp) => {
          const dmg = wasBlocking ? arena.sethPower * 0.2 : arena.sethPower;
          const next = Math.max(0, hp - dmg);
          if (next <= 0) setPhase("defeat");
          return next;
        });
        triggerHitEffects(true, wasBlocking);
      }, 400);
    }, 1800 - stage * 100);
    return () => clearInterval(interval);
  }, [phase, stage, adamBlocking, arena.sethPower, triggerHitEffects]);

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (phase !== "fight") {
        if (e.key === " " || e.key === "Enter") {
          if (phase === "victory") {
            if (stage < ARENAS.length - 1) setStage((s) => s + 1);
            else setPhase("complete");
          } else if (phase === "defeat") {
            setStage(0);
          } else if (phase === "complete") {
            setStage(0);
          }
        }
        return;
      }
      if ((e.key === " " || e.key.toLowerCase() === "j") && Date.now() > adamCdRef.current) {
        adamCdRef.current = Date.now() + 500;
        setAdamAttacking(true);
        setTimeout(() => setAdamAttacking(false), 350);
        setTimeout(() => {
          setSethHit(true);
          setTimeout(() => setSethHit(false), 250);
          setSethHp((hp) => {
            const next = Math.max(0, hp - arena.adamDamage);
            if (next <= 0) setPhase("victory");
            return next;
          });
          triggerHitEffects(false, false);
        }, 200);
      }
      if (e.key.toLowerCase() === "k" || e.key === "Shift") {
        setAdamBlocking(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" || e.key === "Shift") setAdamBlocking(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [phase, stage, arena.adamDamage, triggerHitEffects]);

  const adamPct = (adamHp / arena.adamHp) * 100;
  const sethPct = (sethHp / arena.sethHp) * 100;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Camera shake wrapper */}
      <div className={`h-full w-full ${cameraShake ? "camera-shake" : ""}`}>
        <Canvas shadows camera={{ position: [0, 3, 9], fov: 50 }}>
          <Arena3D arena={arena} />
          <Fighter
            position={[-2.2, 0, 0]}
            isKid
            attacking={adamAttacking}
            hit={adamHit}
            facing={1}
            swordColor={arena.swordColor}
            swordScale={arena.swordScale * 0.7}
            skinColor="#f2cba0"
            shirtColor="#2d5a8a"
            blocking={adamBlocking}
          />
          <Fighter
            position={[2.2, 0, 0]}
            attacking={sethAttacking}
            hit={sethHit}
            facing={-1}
            swordColor="#8a8a95"
            swordScale={1.6 + stage * 0.15}
            skinColor="#c89878"
            shirtColor="#5a1a1a"
          />
        </Canvas>
      </div>

      {/* Screen flash on hit */}
      {screenFlash && (
        <div className="pointer-events-none absolute inset-0 bg-white/20" style={{ animation: "flashOut 0.15s ease-out forwards" }} />
      )}

      {/* Floating damage numbers */}
      {damageNumbers.map(d => (
        <div
          key={d.id}
          className={`pointer-events-none absolute top-1/3 font-display text-4xl font-bold damage-float ${d.isBlock ? "text-sky-400" : ""}`}
          style={{ left: d.x, color: d.color }}
        >
          {d.value}
        </div>
      ))}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-6">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-8">
          <HpBar name="ADAM" hp={adamHp} max={arena.adamHp} pct={adamPct} color="var(--hp-adam)" align="left" />
          <div className="text-center">
            <div className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Stage {stage + 1} / 5</div>
            <div className="font-display text-2xl text-primary glow">{arena.name}</div>
          </div>
          <HpBar name="SETH" hp={sethHp} max={arena.sethHp} pct={sethPct} color="var(--hp-seth)" align="right" />
        </div>
      </div>

      {/* Block indicator */}
      {adamBlocking && phase === "fight" && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="rounded-full border-2 border-sky-400 bg-sky-400/20 px-6 py-2 font-display text-sm uppercase tracking-[0.3em] text-sky-300 backdrop-blur">
            Blocking
          </div>
        </div>
      )}

      {/* Controls hint */}
      {phase === "fight" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">SPACE / J</span> attack &nbsp;·&nbsp;
          <span className="rounded border border-border bg-card/60 px-2 py-1 backdrop-blur">SHIFT / K</span> block
        </div>
      )}

      {/* Overlays */}
      {phase === "intro" && <Overlay title={arena.name} subtitle={arena.subtitle} />}
      {phase === "victory" && (
        <Overlay
          title={stage < ARENAS.length - 1 ? "Victory" : "Final Blow"}
          subtitle={stage < ARENAS.length - 1 ? `Adam grows stronger. Next: ${ARENAS[stage + 1].name}` : "The Shadow Citadel falls"}
          cta="Press SPACE to continue"
        />
      )}
      {phase === "defeat" && (
        <Overlay title="Defeated" subtitle="Seth stands victorious" cta="Press SPACE to try again" tone="bad" />
      )}
      {phase === "complete" && (
        <Overlay title="Legend of Adam" subtitle="You have bested Seth across all five realms" cta="Press SPACE to begin again" />
      )}
    </div>
  );
}

function HpBar({ name, hp, max, pct, color, align }: { name: string; hp: number; max: number; pct: number; color: string; align: "left" | "right" }) {
  return (
    <div className={`flex-1 ${align === "right" ? "text-right" : ""}`} style={{ maxWidth: 360 }}>
      <div className="mb-1 flex items-baseline justify-between font-display text-sm uppercase tracking-[0.3em]" style={{ flexDirection: align === "right" ? "row-reverse" : "row" }}>
        <span style={{ color }}>{name}</span>
        <span className="text-muted-foreground">{Math.ceil(hp)} / {max}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm border border-border bg-muted">
        <div
          className="h-full transition-all duration-200"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, white))`,
            marginLeft: align === "right" ? "auto" : 0,
          }}
        />
      </div>
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
