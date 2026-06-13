import { useEffect, useState } from "react";
import { Sound } from "./sound";

const SCENES = [
  {
    title: "Three Days Ago",
    body: "The city went dark. Radios stopped. Lights died. Strangers in the streets stopped answering to their names.",
    bg: "radial-gradient(ellipse at 50% 60%, oklch(0.25 0.05 30 / 0.9), oklch(0.06 0.02 25))",
  },
  {
    title: "One Boy. One Pistol.",
    body: "Adam grabbed the pistol from his father's desk, slipped through the back door, and never looked back.",
    bg: "radial-gradient(ellipse at 30% 40%, oklch(0.35 0.15 60 / 0.6), oklch(0.08 0.02 30))",
  },
  {
    title: "Five Districts to the Harbor",
    body: "Downtown. The Industrial Yard. The Overpass. The Burning District. Final Stand Plaza. The last boat leaves at dawn.",
    bg: "radial-gradient(ellipse at 70% 50%, oklch(0.4 0.22 25 / 0.55), oklch(0.07 0.02 30))",
  },
  {
    title: "Survive.",
    body: "WASD to move · Shift to run · Mouse to aim · Click to fire · ESC for menu",
    bg: "radial-gradient(ellipse at 50% 50%, oklch(0.45 0.2 65 / 0.55), oklch(0.06 0.02 30))",
  },
];

const SCENE_MS = 4200;

export default function StoryIntro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    // resume audio context on user gesture (mount happens after click)
    Sound.setMusic(true);
    Sound.startMusic();
  }, []);

  useEffect(() => {
    if (i >= SCENES.length) { onDone(); return; }
    // subtle scene sound
    if (i === 1) Sound.shoot();
    if (i === 2) Sound.explosion();
    if (i === 3) Sound.levelUp();
    const t = setTimeout(() => setI((n) => n + 1), SCENE_MS);
    return () => clearTimeout(t);
  }, [i, onDone]);

  const scene = SCENES[Math.min(i, SCENES.length - 1)];
  const progress = ((i + 1) / SCENES.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      <div
        key={i}
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: scene.bg, animation: "fadeInScene 0.8s ease-out" }}
      />
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* letterbox */}
      <div className="absolute inset-x-0 top-0 h-16 bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-black" />

      <div key={`txt-${i}`} className="relative z-10 max-w-3xl px-10 text-center" style={{ animation: "slideUpScene 1s ease-out" }}>
        <div className="font-display text-xs uppercase tracking-[0.5em] text-primary/80">
          Chapter {i + 1} / {SCENES.length}
        </div>
        <h2 className="mt-4 font-display text-5xl uppercase tracking-[0.2em] text-primary glow md:text-6xl">
          {scene.title}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-foreground/90">
          {scene.body}
        </p>
      </div>

      {/* progress bar */}
      <div className="absolute bottom-20 left-1/2 h-[2px] w-64 -translate-x-1/2 bg-white/10">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%`, boxShadow: "0 0 10px var(--primary)" }}
        />
      </div>

      <button
        onClick={onDone}
        className="absolute bottom-6 right-6 z-20 rounded-sm border border-primary/40 bg-black/50 px-4 py-2 font-display text-xs uppercase tracking-[0.3em] text-primary/80 hover:bg-primary hover:text-primary-foreground"
      >
        Skip ▶
      </button>

      <style>{`
        @keyframes fadeInScene { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpScene {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
