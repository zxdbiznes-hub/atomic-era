import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { WorldMap } from "./WorldMap";
import { StatBar } from "./StatBar";
import { EventModal } from "./EventModal";
import {
  ACTIONS,
  ActionId,
  addLog,
  checkEndState,
  createInitialState,
  endOfTurnDrift,
  factionMeta,
  GameState,
  simulateAITurn,
} from "@/game/engine";
import { pickEvent, GameEvent } from "@/game/events";
import { FactionId } from "@/game/factions";
import {
  Atom,
  Banknote,
  Building2,
  Eye,
  Handshake,
  HeartHandshake,
  Radiation,
  ShieldAlert,
  Sword,
  Timer,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  playerId: FactionId;
  initial?: GameState;
  onExit: (state: GameState) => void;
}

const ACTION_BUTTONS: { id: ActionId; label: string; icon: any; cost: string; tone: string }[] = [
  { id: "negotiate", label: "Negotiate", icon: Handshake, cost: "50$", tone: "blue" },
  { id: "buildMilitary", label: "Build Military", icon: Sword, cost: "120$", tone: "amber" },
  { id: "expandNuclear", label: "Expand Nuclear", icon: Radiation, cost: "200$", tone: "red" },
  { id: "investEconomy", label: "Invest Economy", icon: TrendingUp, cost: "100$", tone: "green" },
  { id: "spy", label: "Spy Op", icon: Eye, cost: "80$", tone: "purple" },
  { id: "formAlliance", label: "Form Alliance", icon: HeartHandshake, cost: "150$", tone: "green" },
  { id: "sanction", label: "Sanction", icon: ShieldAlert, cost: "—", tone: "red" },
];

const TICKER_LINES = [
  "MARKETS WATCH BERLIN SUMMIT • ",
  "ARC LAUNCHES ORBITAL DEFENSE PLATFORM • ",
  "USSAR FLEET MANEUVERS IN ARCTIC • ",
  "EAC PARLIAMENT VOTES ON FUSION GRID • ",
  "JAS DRONES INTERCEPT UNKNOWN SIGNAL • ",
  "GLOBAL OIL DOWN 2.4% • CREDIT INDEX STABLE • ",
];

export function GameScreen({ playerId, initial, onExit }: Props) {
  const [s, setS] = useState<GameState>(() => initial ?? createInitialState(playerId));
  const [pending, setPending] = useState<GameEvent | null>(null);
  const player = factionMeta(s.playerId);

  // Auto-save
  useEffect(() => {
    try {
      localStorage.setItem("atomicfall:save", JSON.stringify(s));
    } catch {}
  }, [s]);

  function update(mut: (draft: GameState) => void) {
    setS((prev) => {
      const next: GameState = JSON.parse(JSON.stringify(prev));
      mut(next);
      checkEndState(next);
      return next;
    });
  }

  function doAction(id: ActionId) {
    if (s.status !== "playing") return;
    update((d) => {
      const err = ACTIONS[id](d);
      if (err) {
        toast({ title: "Action blocked", description: err, variant: "destructive" });
      }
    });
  }

  function endTurn() {
    if (s.status !== "playing") return;
    update((d) => {
      d.year += 1;
      simulateAITurn(d);
      endOfTurnDrift(d);
      addLog(d, `Year ${d.year} begins.`, "info");
    });
    // Trigger event ~55% chance
    if (Math.random() < 0.55) {
      setTimeout(() => setPending(pickEvent()), 300);
    }
  }

  function chooseEvent(idx: number) {
    if (!pending) return;
    const ev = pending;
    setPending(null);
    update((d) => {
      ev.choices[idx].apply(d);
      addLog(d, `${ev.title} → ${ev.choices[idx].label}`, "warn");
    });
  }

  const alliances = useMemo(() => s.ai.filter((a) => a.alliance).map((a) => a.id), [s.ai]);
  const selectedNation = s.selectedNation
    ? s.selectedNation === s.playerId
      ? null
      : s.ai.find((a) => a.id === s.selectedNation)
    : null;
  const selectedMeta = s.selectedNation ? factionMeta(s.selectedNation) : null;

  const tickerText = TICKER_LINES.concat(
    s.log.slice(0, 4).map((l) => `[${l.year}] ${l.text.toUpperCase()} • `)
  ).join("");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="panel-hud border-b m-2 mb-0 px-4 py-2 flex items-center gap-6 clip-corner">
        <div className="flex items-center gap-2 text-neon-blue">
          <Atom className="w-5 h-5" />
          <span className="display tracking-widest font-bold">ATOMIC FALL</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <Stat icon={Timer} label="YEAR" value={`${s.year}`} tone="blue" />
        <Stat icon={ShieldAlert} label="TENSION" value={`${s.globalTension}%`} tone={s.globalTension > 70 ? "red" : "amber"} />
        <Stat icon={TrendingUp} label="WORLD ECON" value={`${s.worldEconomy}%`} tone="green" />
        <Stat icon={Radiation} label="NUCLEAR RISK" value={`${s.nuclearRisk}%`} tone={s.nuclearRisk > 70 ? "red" : "amber"} flash={s.nuclearRisk > 80} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground display tracking-widest">{player.short}</span>
          <span className="w-3 h-3 rounded-full" style={{ background: `hsl(${player.color})`, boxShadow: `0 0 8px hsl(${player.color})` }} />
          <Button variant="ghost" size="sm" onClick={() => onExit(s)} className="display tracking-widest">
            <X className="w-4 h-4 mr-1" /> EXIT
          </Button>
        </div>
      </header>

      {/* Ticker */}
      <div className="mx-2 mt-2 panel border border-border h-7 overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full px-3 flex items-center bg-neon-red text-primary-foreground text-[10px] display tracking-widest z-10">
          LIVE
        </div>
        <div className="ticker whitespace-nowrap text-xs text-muted-foreground leading-7 pl-16">
          {tickerText}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-2 p-2 min-h-0">
        {/* Left: Map + Action Bar */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-[420px] relative">
            <WorldMap
              playerId={s.playerId}
              selected={s.selectedNation}
              onSelect={(id) => update((d) => { d.selectedNation = id; })}
              tension={s.globalTension}
              alliances={alliances}
            />

            {selectedMeta && (
              <div className="absolute top-3 right-3 panel-hud p-4 w-72 clip-corner animate-scale-in">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="display text-lg">{selectedMeta.short}</div>
                    <div className="text-xs text-muted-foreground">{selectedMeta.name}</div>
                  </div>
                  <button onClick={() => update((d) => { d.selectedNation = null; })} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedMeta.id === s.playerId ? (
                  <div className="text-sm text-neon-blue display">YOUR NATION</div>
                ) : selectedNation ? (
                  <div className="space-y-2">
                    <StatBar label="Stability" value={selectedNation.stability} tone="green" />
                    <StatBar label="Economy" value={selectedNation.economy} tone="blue" />
                    <StatBar label="Nuclear" value={selectedNation.nuclear} tone="red" />
                    <StatBar label="Military" value={selectedNation.military} tone="amber" />
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Relation</span>
                      <span className={selectedNation.relation >= 0 ? "text-neon-green" : "text-neon-red"}>
                        {selectedNation.relation > 0 ? "+" : ""}{selectedNation.relation}
                      </span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {selectedNation.alliance && <span className="text-[10px] px-2 py-0.5 bg-neon-green/20 text-neon-green rounded display tracking-widest">ALLY</span>}
                      {selectedNation.sanctioned && <span className="text-[10px] px-2 py-0.5 bg-neon-red/20 text-neon-red rounded display tracking-widest">SANCTIONED</span>}
                      {selectedNation.relation < -50 && <span className="text-[10px] px-2 py-0.5 bg-neon-red/20 text-neon-red rounded display tracking-widest">HOSTILE</span>}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Action panel */}
          <div className="panel-hud p-3 clip-corner">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {ACTION_BUTTONS.map((b) => {
                const Icon = b.icon;
                return (
                  <Button
                    key={b.id}
                    onClick={() => doAction(b.id)}
                    variant="outline"
                    className="h-auto flex-col gap-1 py-2 px-1 panel hover:border-[hsl(var(--neon-blue))] hover:glow-blue"
                  >
                    <Icon className={`w-4 h-4 text-neon-${b.tone === "amber" ? "amber" : b.tone}`} />
                    <span className="text-[11px] font-semibold leading-tight">{b.label}</span>
                    <span className="text-[9px] text-muted-foreground">{b.cost}</span>
                  </Button>
                );
              })}
              <Button
                onClick={endTurn}
                className="h-auto flex-col gap-1 py-2 col-span-2 sm:col-span-4 lg:col-span-1 bg-neon-red hover:bg-neon-red/85 text-white glow-red display tracking-widest"
              >
                <Timer className="w-5 h-5" />
                <span className="text-xs font-bold">END TURN</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="panel-hud p-4 clip-corner flex flex-col gap-3 overflow-hidden">
          <div>
            <div className="text-xs text-muted-foreground display tracking-widest">COMMAND</div>
            <div className="display text-xl">{player.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KV icon={Banknote} label="Treasury" value={`${s.player.treasury}B$`} tone="blue" />
            <KV icon={Users} label="Population" value={`${s.player.population}M`} tone="green" />
          </div>

          <div className="space-y-2">
            <StatBar label="Stability" value={s.player.stability} tone="green" />
            <StatBar label="Economy" value={s.player.economy} tone="blue" />
            <StatBar label="Army Strength" value={s.player.military} tone="amber" />
            <StatBar label="Nuclear Warheads" value={s.player.nuclear} tone="red" />
            <StatBar label="Diplomacy" value={s.player.diplomacy} tone="green" />
          </div>

          <div className="border-t border-border pt-2 flex-1 min-h-0 flex flex-col">
            <div className="text-xs text-muted-foreground display tracking-widest mb-1">EVENT LOG</div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
              {s.log.map((l) => (
                <div
                  key={l.id}
                  className={`border-l-2 pl-2 py-0.5 ${
                    l.tone === "danger"
                      ? "border-[hsl(var(--neon-red))] text-neon-red"
                      : l.tone === "warn"
                      ? "border-[hsl(var(--neon-amber))] text-foreground"
                      : l.tone === "good"
                      ? "border-[hsl(var(--neon-green))] text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground">[{l.year}]</span> {l.text}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Event modal */}
      {pending && s.status === "playing" && <EventModal event={pending} onChoose={chooseEvent} />}

      {/* End screen */}
      {s.status !== "playing" && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur flex items-center justify-center animate-fade-in">
          <div className="panel-hud p-10 max-w-md text-center clip-corner space-y-4 border-l-4"
               style={{ borderLeftColor: s.status === "won" ? "hsl(var(--neon-green))" : "hsl(var(--neon-red))" }}>
            <div className={`display text-5xl ${s.status === "won" ? "text-neon-green text-glow-green" : "text-neon-red text-glow-red"}`}>
              {s.status === "won" ? "VICTORY" : "DEFEAT"}
            </div>
            <p className="text-foreground/80">{s.endReason}</p>
            <div className="text-xs text-muted-foreground">Final year: {s.year}</div>
            <Button onClick={() => onExit(s)} className="bg-neon-blue text-primary-foreground display tracking-widest glow-blue">
              RETURN TO MENU
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone, flash }: { icon: any; label: string; value: string; tone: string; flash?: boolean }) {
  const colorClass =
    tone === "red" ? "text-neon-red" : tone === "green" ? "text-neon-green" : tone === "amber" ? "text-[hsl(var(--neon-amber))]" : "text-neon-blue";
  return (
    <div className={`flex items-center gap-2 ${flash ? "flash" : ""}`}>
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <div className="leading-tight">
        <div className="text-[10px] text-muted-foreground display tracking-widest">{label}</div>
        <div className={`text-sm font-bold ${colorClass}`}>{value}</div>
      </div>
    </div>
  );
}

function KV({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const colorClass = tone === "blue" ? "text-neon-blue" : "text-neon-green";
  return (
    <div className="panel p-2">
      <div className="text-[10px] text-muted-foreground display tracking-widest flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-base font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}