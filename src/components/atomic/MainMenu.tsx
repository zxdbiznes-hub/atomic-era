import { Button } from "@/components/ui/button";
import { Atom } from "lucide-react";

interface Props {
  onNewGame: () => void;
  hasSave: boolean;
  onLoad: () => void;
}

export function MainMenu({ onNewGame, hasSave, onLoad }: Props) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated globe background */}
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[700px] h-[700px] max-w-[90vw] max-h-[90vw] opacity-30">
          <div className="absolute inset-0 rounded-full border border-neon-blue/40 globe-spin" />
          <div
            className="absolute inset-8 rounded-full border border-neon-red/30 globe-spin"
            style={{ animationDuration: "90s", animationDirection: "reverse" }}
          />
          <div
            className="absolute inset-16 rounded-full border border-neon-green/30 globe-spin"
            style={{ animationDuration: "120s" }}
          />
          <div className="absolute inset-24 rounded-full bg-gradient-to-br from-[hsl(var(--neon-blue)/0.15)] to-[hsl(var(--neon-red)/0.1)] blur-2xl" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center gap-12 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 text-neon-red">
            <Atom className="w-8 h-8 pulse-ring rounded-full" />
            <span className="text-xs tracking-[0.5em] uppercase text-muted-foreground">2095 — Crisis Protocol</span>
            <Atom className="w-8 h-8" />
          </div>
          <h1 className="display text-7xl md:text-8xl font-black tracking-widest text-glow-blue">
            ATOMIC <span className="text-neon-red text-glow-red">FALL</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lead a superpower. Avoid annihilation. Shape the last century of human civilization.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-72">
          <Button
            onClick={onNewGame}
            className="h-12 text-base bg-neon-blue text-primary-foreground hover:bg-neon-blue/80 glow-blue clip-corner display tracking-widest"
          >
            NEW GAME
          </Button>
          <Button
            onClick={onLoad}
            disabled={!hasSave}
            variant="outline"
            className="h-12 border-border bg-card/60 hover:bg-card display tracking-widest clip-corner"
          >
            LOAD GAME
          </Button>
          <Button
            variant="ghost"
            className="h-12 text-muted-foreground hover:text-foreground display tracking-widest"
            onClick={() => alert("Settings — coming soon. Audio: ON • Difficulty: NORMAL")}
          >
            SETTINGS
          </Button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-muted-foreground tracking-widest">
          v0.1 PROTOTYPE • BUILD 2095.04
        </div>
      </div>
    </div>
  );
}