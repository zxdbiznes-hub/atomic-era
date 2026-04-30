import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { WorldMap } from "./WorldMap";
import { StatBar } from "./StatBar";
import { EventModal } from "./EventModal";
import { TechPanel } from "./TechPanel";
import {
  ACTIONS, ActionId, addLog, checkEndState, createInitialState, endOfTurnDrift,
  factionMeta, GameState, simulateAITurn, invadeRegion, setResearch,
} from "@/game/engine";
import { pickEvent, GameEvent } from "@/game/events";
import { FactionId } from "@/game/factions";
import { REGIONS, RegionId, getRegion, getNeighbors } from "@/game/regions";
import {
  Atom, Banknote, Eye, Handshake, HeartHandshake, Radiation, ShieldAlert, Sword,
  Timer, TrendingUp, Users, X, Map as MapIcon, FlaskConical, Swords, Globe, BookOpen, Flag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  playerId: FactionId;
  initial?: GameState;
  onExit: (state: GameState) => void;
}

const ACTION_BUTTONS: { id: ActionId; label: string; icon: any; cost: string; tone: string }[] = [
  { id: "negotiate", label: "Negocjuj", icon: Handshake, cost: "50$", tone: "blue" },
  { id: "buildMilitary", label: "Armia", icon: Sword, cost: "120$", tone: "amber" },
  { id: "expandNuclear", label: "Atom", icon: Radiation, cost: "200$", tone: "red" },
  { id: "investEconomy", label: "Inwestuj", icon: TrendingUp, cost: "100$", tone: "green" },
  { id: "spy", label: "Szpieguj", icon: Eye, cost: "80$", tone: "purple" },
  { id: "formAlliance", label: "Sojusz", icon: HeartHandshake, cost: "150$", tone: "green" },
  { id: "sanction", label: "Sankcje", icon: ShieldAlert, cost: "—", tone: "red" },
];

const TICKER_LINES = [
  "RYNKI OBSERWUJĄ SZCZYT W BERLINIE • ",
  "ARC WYSTRZELIWUJE ORBITALNĄ PLATFORMĘ OBRONNĄ • ",
  "FLOTA USSAR PROWADZI MANEWRY W ARKTYCE • ",
  "PARLAMENT EAC GŁOSUJE NAD SIECIĄ FUZYJNĄ • ",
  "DRONY JAS PRZECHWYCIŁY NIEZNANY SYGNAŁ • ",
  "GLOBALNA ROPA -2,4% • INDEKS KREDYTOWY STABILNY • ",
];

type Tab = "map" | "tech" | "diplomacy" | "military" | "log";

export function GameScreen({ playerId, initial, onExit }: Props) {
  const [s, setS] = useState<GameState>(() => initial ?? createInitialState(playerId));
  const [pending, setPending] = useState<GameEvent | null>(null);
  const [tab, setTab] = useState<Tab>("map");
  const [invadeFrom, setInvadeFrom] = useState<RegionId | null>(null);
  const [invadeMode, setInvadeMode] = useState(false);
  const player = factionMeta(s.playerId);

  useEffect(() => {
    try { localStorage.setItem("atomicfall:save", JSON.stringify(s)); } catch {}
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
      if (err) toast({ title: "Akcja zablokowana", description: err, variant: "destructive" });
    });
  }

  function endTurn() {
    if (s.status !== "playing") return;
    update((d) => {
      d.year += 1;
      simulateAITurn(d);
      endOfTurnDrift(d);
      addLog(d, `Rozpoczyna się rok ${d.year}.`, "info");
    });
    if (Math.random() < 0.55) setTimeout(() => setPending(pickEvent()), 300);
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

  function handleRegionClick(rid: RegionId) {
    if (invadeMode) {
      if (!invadeFrom) {
        if (s.regions[rid] !== s.playerId) {
          toast({ title: "To nie twój region", description: "Wybierz region, z którego ruszysz atak.", variant: "destructive" });
          return;
        }
        setInvadeFrom(rid);
        return;
      }
      // attempt invasion
      update((d) => {
        const err = invadeRegion(d, invadeFrom, rid);
        if (err) toast({ title: "Atak niemożliwy", description: err, variant: "destructive" });
      });
      setInvadeFrom(null);
      setInvadeMode(false);
      return;
    }
    update((d) => {
      d.selectedRegion = rid;
      const owner = d.regions[rid];
      d.selectedNation = owner;
    });
  }

  function pickResearch(id: string) {
    update((d) => {
      const err = setResearch(d, id);
      if (err) toast({ title: "Badania", description: err, variant: "destructive" });
    });
  }

  const alliances = useMemo(() => s.ai.filter((a) => a.alliance).map((a) => a.id), [s.ai]);
  const selectedNation = s.selectedNation && s.selectedNation !== s.playerId
    ? s.ai.find((a) => a.id === s.selectedNation) : null;
  const selectedMeta = s.selectedNation ? factionMeta(s.selectedNation) : null;
  const selectedRegionMeta = s.selectedRegion ? getRegion(s.selectedRegion) : null;
  const ownedCount = Object.values(s.regions).filter((o) => o === s.playerId).length;

  const tickerText = TICKER_LINES.concat(s.log.slice(0, 4).map((l) => `[${l.year}] ${l.text.toUpperCase()} • `)).join("");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="panel-hud border-b m-2 mb-0 px-4 py-2 flex items-center gap-4 lg:gap-6 clip-corner flex-wrap">
        <div className="flex items-center gap-2 text-neon-blue">
          <Atom className="w-5 h-5" />
          <span className="display tracking-widest font-bold">ATOMIC FALL</span>
        </div>
        <div className="h-6 w-px bg-border hidden md:block" />
        <Stat icon={Timer} label="ROK" value={`${s.year}`} tone="blue" />
        <Stat icon={ShieldAlert} label="NAPIĘCIE" value={`${s.globalTension}%`} tone={s.globalTension > 70 ? "red" : "amber"} />
        <Stat icon={TrendingUp} label="GOSP. ŚW." value={`${s.worldEconomy}%`} tone="green" />
        <Stat icon={Radiation} label="RYZYKO ATOM." value={`${s.nuclearRisk}%`} tone={s.nuclearRisk > 70 ? "red" : "amber"} flash={s.nuclearRisk > 80} />
        <Stat icon={Globe} label="REGIONY" value={`${ownedCount}/${REGIONS.length}`} tone="blue" />
        {s.wars.length > 0 && (
          <Stat icon={Swords} label="WOJNY" value={s.wars.join(",")} tone="red" flash />
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground display tracking-widest">{player.short}</span>
          <span className="w-3 h-3 rounded-full" style={{ background: `hsl(${player.color})`, boxShadow: `0 0 8px hsl(${player.color})` }} />
          <Button variant="ghost" size="sm" onClick={() => onExit(s)} className="display tracking-widest">
            <X className="w-4 h-4 mr-1" /> WYJDŹ
          </Button>
        </div>
      </header>

      {/* Ticker */}
      <div className="mx-2 mt-2 panel border border-border h-7 overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full px-3 flex items-center bg-neon-red text-primary-foreground text-[10px] display tracking-widest z-10">LIVE</div>
        <div className="ticker whitespace-nowrap text-xs text-muted-foreground leading-7 pl-16">{tickerText}</div>
      </div>

      {/* Tabs */}
      <nav className="mx-2 mt-2 panel-hud px-2 py-1 flex gap-1 overflow-x-auto">
        {([
          { id: "map", label: "MAPA", icon: MapIcon },
          { id: "tech", label: "TECHNOLOGIE", icon: FlaskConical },
          { id: "diplomacy", label: "DYPLOMACJA", icon: Handshake },
          { id: "military", label: "WOJSKO", icon: Swords },
          { id: "log", label: "DZIENNIK", icon: BookOpen },
        ] as const).map((t) => {
          const Ico = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs display tracking-widest flex items-center gap-1.5 rounded-sm transition-all ${
                active ? "bg-neon-blue/20 text-neon-blue border border-[hsl(var(--neon-blue)/0.5)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ico className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </nav>

      {/* Main */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-2 p-2 min-h-0">
        {/* Left content */}
        <div className="flex flex-col gap-2 min-h-0">
          {tab === "map" && (
            <div className="flex-1 min-h-[460px] relative">
              <WorldMap
                playerId={s.playerId}
                regions={s.regions}
                selectedRegion={s.selectedRegion}
                selectedFaction={s.selectedNation}
                onSelectRegion={handleRegionClick}
                tension={s.globalTension}
                alliances={alliances}
                wars={s.wars}
                invadeMode={invadeMode}
                invadeFrom={invadeFrom}
              />

              {/* Region info popup */}
              {selectedRegionMeta && !invadeMode && (
                <div className="absolute top-3 right-3 panel-hud p-4 w-80 clip-corner animate-scale-in">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="display text-lg flex items-center gap-2">
                        <Flag className="w-4 h-4" /> {selectedRegionMeta.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedMeta ? selectedMeta.name : "Region niezrzeszony"}
                      </div>
                    </div>
                    <button onClick={() => update((d) => { d.selectedRegion = null; d.selectedNation = null; })} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <Mini label="Wartość" value={selectedRegionMeta.value} />
                    <Mini label="Populacja" value={`${selectedRegionMeta.population}M`} />
                    <Mini label="Obrona" value={selectedRegionMeta.defense} />
                  </div>
                  {selectedNation ? (
                    <div className="space-y-2">
                      <StatBar label="Stabilność" value={selectedNation.stability} tone="green" />
                      <StatBar label="Gospodarka" value={selectedNation.economy} tone="blue" />
                      <StatBar label="Atom" value={selectedNation.nuclear} tone="red" />
                      <StatBar label="Wojsko" value={selectedNation.military} tone="amber" />
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground">Relacje</span>
                        <span className={selectedNation.relation >= 0 ? "text-neon-green" : "text-neon-red"}>
                          {selectedNation.relation > 0 ? "+" : ""}{selectedNation.relation}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedNation.alliance && <Tag tone="green">SOJUSZNIK</Tag>}
                        {selectedNation.sanctioned && <Tag tone="red">SANKCJE</Tag>}
                        {selectedNation.atWar && <Tag tone="red">WOJNA</Tag>}
                        {selectedNation.relation < -50 && !selectedNation.atWar && <Tag tone="red">WROGI</Tag>}
                      </div>
                    </div>
                  ) : s.regions[selectedRegionMeta.id] === s.playerId ? (
                    <div className="text-sm text-neon-blue display">TWOJE TERYTORIUM</div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">Region niezrzeszony — może zostać podbity bez wypowiedzenia wojny.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "tech" && (
            <div className="flex-1 min-h-[460px] panel-hud p-3 clip-corner">
              <TechPanel state={s} onPick={pickResearch} />
            </div>
          )}

          {tab === "diplomacy" && (
            <div className="flex-1 min-h-[460px] panel-hud p-4 clip-corner overflow-y-auto">
              <div className="display tracking-widest text-sm mb-3 flex items-center gap-2">
                <Handshake className="w-4 h-4 text-neon-blue" /> STOSUNKI MIĘDZYNARODOWE
              </div>
              <div className="space-y-2">
                {s.ai.map((a) => {
                  const meta = factionMeta(a.id);
                  return (
                    <div key={a.id} className="panel p-3 border border-border" style={{ borderLeftColor: `hsl(${meta.color})`, borderLeftWidth: 3 }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="display text-sm">{meta.name}</div>
                          <div className="text-[10px] text-muted-foreground">{meta.short}</div>
                        </div>
                        <div className="flex gap-1">
                          {a.alliance && <Tag tone="green">SOJUSZ</Tag>}
                          {a.atWar && <Tag tone="red">WOJNA</Tag>}
                          {a.sanctioned && <Tag tone="amber">SANKCJE</Tag>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[11px] mb-2">
                        <Mini label="Stab." value={a.stability} />
                        <Mini label="Gosp." value={a.economy} />
                        <Mini label="Wojsko" value={a.military} />
                        <Mini label="Atom" value={a.nuclear} />
                      </div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Relacje</span>
                        <span className={a.relation >= 0 ? "text-neon-green" : "text-neon-red"}>{a.relation > 0 ? "+" : ""}{a.relation}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${a.relation >= 0 ? "bg-neon-green" : "bg-neon-red"}`}
                             style={{ width: `${Math.abs(a.relation)}%`, marginLeft: a.relation < 0 ? `${100 - Math.abs(a.relation)}%` : 0 }} />
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { update((d) => { d.selectedNation = a.id; }); doAction("negotiate"); }}>Negocjuj</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => update((d) => { d.selectedNation = a.id; const e = ACTIONS.sanction(d); if (e) toast({title:"",description:e,variant:"destructive"}); })}>Sankcje</Button>
                        {!a.atWar ? (
                          <Button size="sm" variant="outline" className="h-7 text-[11px] text-neon-red border-[hsl(var(--neon-red)/0.5)]"
                            onClick={() => update((d) => { d.selectedNation = a.id; const e = ACTIONS.declareWar(d); if (e) toast({title:"",description:e,variant:"destructive"}); })}>
                            Wojna
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-[11px] text-neon-green border-[hsl(var(--neon-green)/0.5)]"
                            onClick={() => update((d) => { d.selectedNation = a.id; const e = ACTIONS.peace(d); if (e) toast({title:"",description:e,variant:"destructive"}); })}>
                            Pokój (100$)
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "military" && (
            <div className="flex-1 min-h-[460px] panel-hud p-4 clip-corner overflow-y-auto space-y-4">
              <div className="display tracking-widest text-sm flex items-center gap-2">
                <Swords className="w-4 h-4 text-neon-red" /> DOWÓDZTWO WOJSKOWE
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Mini label="Siła armii" value={s.player.military} />
                <Mini label="Arsenał atomowy" value={s.player.nuclear} />
                <Mini label="Regiony" value={ownedCount} />
                <Mini label="Aktywne wojny" value={s.wars.length} />
              </div>

              <div>
                <div className="text-xs display tracking-widest text-muted-foreground mb-2">OPERACJE OFENSYWNE</div>
                <div className="panel p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Tryb inwazji: wybierz <span className="text-neon-blue">swój region</span>, potem
                    <span className="text-neon-amber"> sąsiedni region</span> do ataku. Aby zaatakować państwo SI musisz najpierw wypowiedzieć wojnę. Regiony niezrzeszone można podbijać bez wojny.
                  </p>
                  <Button
                    onClick={() => { setInvadeMode(!invadeMode); setInvadeFrom(null); setTab("map"); }}
                    className={`w-full display tracking-widest ${invadeMode ? "bg-neon-amber text-background" : "bg-neon-red text-white glow-red"}`}
                  >
                    <Swords className="w-4 h-4 mr-2" />
                    {invadeMode ? "ANULUJ INWAZJĘ" : "ROZPOCZNIJ INWAZJĘ"}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-xs display tracking-widest text-muted-foreground mb-2">TWOJE REGIONY</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
                  {REGIONS.filter((r) => s.regions[r.id] === s.playerId).map((r) => (
                    <div key={r.id} className="panel px-2 py-1 flex justify-between">
                      <span>{r.name}</span>
                      <span className="text-muted-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "log" && (
            <div className="flex-1 min-h-[460px] panel-hud p-4 clip-corner overflow-y-auto">
              <div className="display tracking-widest text-sm mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neon-blue" /> KRONIKA WYDARZEŃ
              </div>
              <div className="space-y-1 text-xs">
                {s.log.map((l) => (
                  <div key={l.id} className={`border-l-2 pl-3 py-1 ${
                    l.tone === "danger" ? "border-[hsl(var(--neon-red))] text-neon-red" :
                    l.tone === "warn" ? "border-[hsl(var(--neon-amber))]" :
                    l.tone === "good" ? "border-[hsl(var(--neon-green))]" : "border-border text-muted-foreground"
                  }`}>
                    <span className="text-muted-foreground">[{l.year}]</span> {l.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action panel */}
          <div className="panel-hud p-3 clip-corner">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {ACTION_BUTTONS.map((b) => {
                const Icon = b.icon;
                return (
                  <Button key={b.id} onClick={() => doAction(b.id)} variant="outline"
                    className="h-auto flex-col gap-1 py-2 px-1 panel hover:border-[hsl(var(--neon-blue))] hover:glow-blue">
                    <Icon className={`w-4 h-4 text-neon-${b.tone === "amber" ? "amber" : b.tone}`} />
                    <span className="text-[11px] font-semibold leading-tight">{b.label}</span>
                    <span className="text-[9px] text-muted-foreground">{b.cost}</span>
                  </Button>
                );
              })}
              <Button onClick={endTurn}
                className="h-auto flex-col gap-1 py-2 col-span-2 sm:col-span-4 lg:col-span-1 bg-neon-red hover:bg-neon-red/85 text-white glow-red display tracking-widest">
                <Timer className="w-5 h-5" />
                <span className="text-xs font-bold">KONIEC TURY</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right panel — always visible */}
        <aside className="panel-hud p-4 clip-corner flex flex-col gap-3 overflow-hidden">
          <div>
            <div className="text-xs text-muted-foreground display tracking-widest">DOWÓDZTWO</div>
            <div className="display text-xl">{player.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KV icon={Banknote} label="Skarbiec" value={`${s.player.treasury} mld$`} tone="blue" />
            <KV icon={Users} label="Populacja" value={`${s.player.population} mln`} tone="green" />
          </div>

          <div className="space-y-2">
            <StatBar label="Stabilność" value={s.player.stability} tone="green" />
            <StatBar label="Gospodarka" value={s.player.economy} tone="blue" />
            <StatBar label="Siła armii" value={s.player.military} tone="amber" />
            <StatBar label="Głowice nuklearne" value={s.player.nuclear} tone="red" />
            <StatBar label="Dyplomacja" value={s.player.diplomacy} tone="green" />
          </div>

          {s.research.current && (
            <div className="panel p-2">
              <div className="text-[10px] display tracking-widest text-muted-foreground flex items-center gap-1 mb-1">
                <FlaskConical className="w-3 h-3" /> BADANIA
              </div>
              <div className="flex justify-between text-[11px] mb-1">
                <span>{(s.research.current && (TECHS_NAME[s.research.current] ?? s.research.current))}</span>
                <span className="text-neon-blue">{Math.round((s.research.progress / TECH_COST(s.research.current)) * 100)}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue" style={{ width: `${(s.research.progress / TECH_COST(s.research.current)) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="border-t border-border pt-2 flex-1 min-h-0 flex flex-col">
            <div className="text-xs text-muted-foreground display tracking-widest mb-1">DZIENNIK</div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
              {s.log.slice(0, 30).map((l) => (
                <div key={l.id} className={`border-l-2 pl-2 py-0.5 ${
                  l.tone === "danger" ? "border-[hsl(var(--neon-red))] text-neon-red" :
                  l.tone === "warn" ? "border-[hsl(var(--neon-amber))] text-foreground" :
                  l.tone === "good" ? "border-[hsl(var(--neon-green))] text-foreground" : "border-border text-muted-foreground"
                }`}>
                  <span className="text-muted-foreground">[{l.year}]</span> {l.text}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {pending && s.status === "playing" && <EventModal event={pending} onChoose={chooseEvent} />}

      {s.status !== "playing" && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur flex items-center justify-center animate-fade-in">
          <div className="panel-hud p-10 max-w-md text-center clip-corner space-y-4 border-l-4"
               style={{ borderLeftColor: s.status === "won" ? "hsl(var(--neon-green))" : "hsl(var(--neon-red))" }}>
            <div className={`display text-5xl ${s.status === "won" ? "text-neon-green text-glow-green" : "text-neon-red text-glow-red"}`}>
              {s.status === "won" ? "ZWYCIĘSTWO" : "PORAŻKA"}
            </div>
            <p className="text-foreground/80">{s.endReason}</p>
            <div className="text-xs text-muted-foreground">Ostatni rok: {s.year} • Regionów: {ownedCount}/{REGIONS.length}</div>
            <Button onClick={() => onExit(s)} className="bg-neon-blue text-primary-foreground display tracking-widest glow-blue">POWRÓT DO MENU</Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { TECHS } from "@/game/tech";
const TECHS_NAME: Record<string, string> = Object.fromEntries(TECHS.map((t) => [t.id, t.name]));
const TECH_COST = (id: string) => TECHS.find((t) => t.id === id)?.cost ?? 1;

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

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="panel px-2 py-1">
      <div className="text-[9px] text-muted-foreground display tracking-widest">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Tag({ tone, children }: { tone: "green" | "red" | "amber"; children: any }) {
  const cls = tone === "green" ? "bg-neon-green/20 text-neon-green" : tone === "red" ? "bg-neon-red/20 text-neon-red" : "bg-[hsl(var(--neon-amber)/0.2)] text-[hsl(var(--neon-amber))]";
  return <span className={`text-[10px] px-2 py-0.5 rounded display tracking-widest ${cls}`}>{children}</span>;
}