import { Button } from "@/components/ui/button";
import type { GameEvent } from "@/game/events";
import { AlertTriangle } from "lucide-react";

interface Props {
  event: GameEvent;
  onChoose: (idx: number) => void;
}

export function EventModal({ event, onChoose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="panel-hud max-w-lg w-[92%] p-6 clip-corner space-y-4 animate-scale-in border-l-4 border-l-[hsl(var(--neon-amber))]">
        <div className="flex items-center gap-3 text-[hsl(var(--neon-amber))]">
          <AlertTriangle className="w-6 h-6 flash" />
          <span className="display text-xs tracking-[0.4em] uppercase">Global Event</span>
        </div>
        <h3 className="display text-2xl">{event.title}</h3>
        <p className="text-foreground/80">{event.body}</p>
        <div className="space-y-2 pt-2">
          {event.choices.map((c, i) => (
            <Button
              key={i}
              onClick={() => onChoose(i)}
              variant="outline"
              className="w-full justify-between h-auto py-3 panel hover:border-[hsl(var(--neon-blue))] hover:glow-blue text-left"
            >
              <span className="font-semibold">{c.label}</span>
              <span className="text-xs text-muted-foreground ml-3">{c.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}