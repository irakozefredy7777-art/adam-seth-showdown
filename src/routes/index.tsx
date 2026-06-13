import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Game from "@/game/Game";
import StoryIntro from "@/game/StoryIntro";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Adam: Last Stand — 3D Shooter" },
      { name: "description", content: "Play Adam, a lone gunman fighting waves of hostiles across 5 ruined city districts in this 3D third-person shooter." },
    ],
  }),
});

type Phase = "landing" | "intro" | "game";

function Index() {
  const [phase, setPhase] = useState<Phase>("landing");
  if (phase === "game") return <Game />;
  if (phase === "intro") return <StoryIntro onDone={() => setPhase("game")} />;
  return <Landing onStart={() => setPhase("intro")} />;
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
        <div className="font-display text-xs uppercase tracking-[0.5em] text-muted-foreground">A 3D Third-Person Shooter</div>
        <h1 className="mt-4 font-display text-7xl text-primary glow md:text-8xl">ADAM</h1>
        <div className="my-3 font-display text-2xl uppercase tracking-[0.4em] text-muted-foreground">— Last Stand —</div>
        <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
          One man. Five districts. A city overrun by hostiles. Take cover behind cars, line up your shots, and survive.
        </p>
        <button
          onClick={onStart}
          className="mt-10 rounded-sm border-2 border-primary bg-primary/10 px-12 py-4 font-display text-xl uppercase tracking-[0.4em] text-primary transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_40px_var(--primary)]"
        >
          Deploy
        </button>
        <div className="mt-12 grid grid-cols-3 gap-6 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <div><div className="font-display text-primary">Move</div><div className="mt-1">W A S D</div></div>
          <div><div className="font-display text-primary">Aim</div><div className="mt-1">Mouse</div></div>
          <div><div className="font-display text-primary">Fire</div><div className="mt-1">Click</div></div>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">Click the game to lock the mouse cursor</p>
      </div>
    </div>
  );
}
