import { Button } from "@/components/ui/button";
import { TECHS, isUnlocked, getTech } from "@/game/tech";
import { GameState } from "@/game/engine";
import { FlaskConical, Lock, Check, Loader2 } from "lucide-react";

interface Props {
  state: GameState;
  onPick: (id: string) => void;
}

export function TechPanel({ state, onPick }: Props) {
  const owned = state.research.owned;
  const current = state.research.current ? getTech(state.research.current) : null;
  const pct = current ? Math.round((state.research.progress / current.cost) * 100) : 0;

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <div className="panel-hud p-3 clip-corner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-neon-blue" />
            <span className="display tracking-widest text-sm">BADANIA</span>
          </div>
          <span className="text-xs text-muted-foreground">+{state.research.pointsPerTurn} pkt/turę</span>
        </div>
        {current ? (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground">{current.name}</span>
              <span className="text-neon-blue">{state.research.progress} / {current.cost}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue transition-all" style={{ width: `${pct}%`, boxShadow: "0 0 8px hsl(var(--neon-blue))" }} />
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">Brak aktywnego projektu badawczego — wybierz technologię poniżej.</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {[1, 2, 3].map((era) => (
          <div key={era}>
            <div className="text-xs display tracking-widest text-muted-foreground mb-2">ERA {era}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TECHS.filter((t) => t.era === era).map((t) => {
                const isOwned = owned.includes(t.id);
                const unlocked = isUnlocked(t, owned);
                const isCurrent = state.research.current === t.id;
                return (
                  <button
                    key={t.id}
                    disabled={isOwned || !unlocked}
                    onClick={() => onPick(t.id)}
                    className={`text-left panel p-3 border transition-all ${
                      isOwned ? "border-[hsl(var(--neon-green))] opacity-80" :
                      isCurrent ? "border-[hsl(var(--neon-blue))] glow-blue" :
                      unlocked ? "hover:border-[hsl(var(--neon-blue))]" :
                      "opacity-40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{t.name}</span>
                      {isOwned ? <Check className="w-4 h-4 text-neon-green" /> :
                       isCurrent ? <Loader2 className="w-4 h-4 text-neon-blue animate-spin" /> :
                       !unlocked ? <Lock className="w-3 h-3 text-muted-foreground" /> :
                       <span className="text-[10px] text-muted-foreground">{t.cost}pkt</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-1">{t.description}</div>
                    <div className="text-[10px] text-neon-amber display tracking-wide">{t.effect}</div>
                    {t.requires && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Wymaga: {t.requires.map((r) => getTech(r).name).join(", ")}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}