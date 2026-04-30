import { Button } from "@/components/ui/button";
import { FACTIONS, FactionId } from "@/game/factions";
import { StatBar } from "./StatBar";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  onBack: () => void;
  onConfirm: (id: FactionId) => void;
}

export function FactionSelect({ onBack, onConfirm }: Props) {
  const [sel, setSel] = useState<FactionId>("UAS");
  const f = FACTIONS.find((x) => x.id === sel)!;

  return (
    <div className="min-h-screen p-6 md:p-10 grid-bg">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="display tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> BACK
          </Button>
          <h2 className="display text-2xl md:text-3xl tracking-widest text-glow-blue">SELECT FACTION</h2>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {FACTIONS.map((fac) => {
            const active = fac.id === sel;
            return (
              <button
                key={fac.id}
                onClick={() => setSel(fac.id)}
                className={`panel p-4 text-left transition-all clip-corner ${
                  active ? "ring-2 ring-[hsl(var(--neon-blue))] glow-blue" : "hover:border-foreground/40"
                }`}
                style={{ borderLeft: `3px solid hsl(${fac.color})` }}
              >
                <div className="display text-lg font-bold">{fac.short}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{fac.name}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 panel-hud p-6 clip-corner space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-3 h-12 rounded"
                style={{ background: `hsl(${f.color})`, boxShadow: `0 0 14px hsl(${f.color})` }}
              />
              <div>
                <h3 className="display text-3xl">{f.name}</h3>
                <p className="text-muted-foreground text-sm">{f.short} — Active Doctrine</p>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed">{f.description}</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
              <StatBar label="Stability" value={f.base.stability} tone="green" />
              <StatBar label="Economy" value={f.base.economy} tone="blue" />
              <StatBar label="Nuclear Arsenal" value={f.base.nuclear} tone="red" />
              <StatBar label="Military Power" value={f.base.military} tone="amber" />
              <StatBar label="Diplomacy" value={f.base.diplomacy} tone="green" />
              <StatBar label="Treasury" value={f.base.treasury} max={2000} tone="blue" suffix="B$" />
            </div>
          </div>

          <div className="panel-hud p-6 clip-corner flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="display text-sm tracking-widest text-muted-foreground">BRIEFING</h4>
              <p className="text-sm text-foreground/80">
                The year is <span className="text-neon-blue">2095</span>. Five atomic superpowers stand on the brink.
                Your decisions over the next 55 years will determine whether humanity survives — or burns.
              </p>
              <ul className="text-sm space-y-2 pt-2">
                <li className="flex gap-2"><Check className="w-4 h-4 text-neon-green mt-0.5" /> Survive to 2150</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-neon-green mt-0.5" /> Or achieve full disarmament</li>
                <li className="flex gap-2 text-neon-red"><Check className="w-4 h-4 mt-0.5" /> Avoid 100% Nuclear Risk</li>
              </ul>
            </div>
            <Button
              onClick={() => onConfirm(sel)}
              className="mt-6 h-12 bg-neon-red hover:bg-neon-red/85 text-white display tracking-widest glow-red clip-corner"
            >
              ENGAGE — LEAD {f.short}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}