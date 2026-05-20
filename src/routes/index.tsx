import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Game from "@/game/Game";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Adam vs Seth — 3D Sword Duel" },
      { name: "description", content: "Play Adam, a young swordsman fighting the giant Seth across 5 epic 3D arenas." },
    ],
  }),
});

function Index() {
  const [started, setStarted] = useState(false);
  if (started) return <Game />;
  return <Landing onStart={() => setStarted(true)} />;
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.4 0.15 65 / 0.4), transparent 60%), radial-gradient(ellipse at 70% 80%, oklch(0.35 0.22 25 / 0.4), transparent 60%), linear-gradient(180deg, oklch(0.12 0.03 35), oklch(0.06 0.02 30))",
        }}
      />
      <div className="relative z-10 max-w-2xl px-8 text-center">
        <div className="font-display text-xs uppercase tracking-[0.5em] text-muted-foreground">A 3D Sword Saga</div>
        <h1 className="mt-4 font-display text-7xl text-primary glow md:text-8xl">ADAM</h1>
        <div className="my-3 font-display text-2xl uppercase tracking-[0.4em] text-muted-foreground">— vs —</div>
        <h2 className="font-display text-6xl text-destructive md:text-7xl">SETH</h2>
        <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
          A boy with a small blade. A giant with a great one. Five arenas. One legend in the making.
        </p>
        <button
          onClick={onStart}
          className="mt-10 rounded-sm border-2 border-primary bg-primary/10 px-12 py-4 font-display text-xl uppercase tracking-[0.4em] text-primary transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_40px_var(--primary)]"
        >
          Enter the Duel
        </button>
        <div className="mt-12 grid grid-cols-3 gap-6 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <div><div className="font-display text-primary">Attack</div><div className="mt-1">Space / J</div></div>
          <div><div className="font-display text-primary">Block</div><div className="mt-1">Shift / K</div></div>
          <div><div className="font-display text-primary">Stages</div><div className="mt-1">5 Arenas</div></div>
        </div>
      </div>
    </div>
  );
}
