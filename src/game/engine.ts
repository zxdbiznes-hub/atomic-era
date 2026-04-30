import { FACTIONS, Faction, FactionId, getFaction } from "./factions";

export interface NationStats {
  stability: number;
  economy: number;
  nuclear: number;
  military: number;
  treasury: number;
  population: number;
  diplomacy: number;
}

export interface AIFactionState {
  id: FactionId;
  stability: number;
  economy: number;
  nuclear: number;
  military: number;
  relation: number; // -100..100 vs player
  alliance: boolean;
  sanctioned: boolean;
}

export interface LogEntry {
  id: string;
  year: number;
  text: string;
  tone: "info" | "warn" | "danger" | "good";
}

export interface GameState {
  year: number;
  globalTension: number;
  worldEconomy: number;
  nuclearRisk: number;
  playerId: FactionId;
  player: NationStats;
  ai: AIFactionState[];
  log: LogEntry[];
  selectedNation: FactionId | null;
  status: "playing" | "won" | "lost";
  endReason?: string;
}

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function createInitialState(playerId: FactionId): GameState {
  const player = getFaction(playerId);
  return {
    year: 2095,
    globalTension: 55,
    worldEconomy: 70,
    nuclearRisk: 35,
    playerId,
    player: { ...player.base },
    ai: FACTIONS.filter((f) => f.id !== playerId).map((f) => ({
      id: f.id,
      stability: f.base.stability,
      economy: f.base.economy,
      nuclear: f.base.nuclear,
      military: f.base.military,
      relation: f.id === "USSAR" ? -20 : 10,
      alliance: false,
      sanctioned: false,
    })),
    log: [
      {
        id: "init",
        year: 2095,
        text: `${player.name} obejmuje przywództwo. Świat patrzy.`,
        tone: "info",
      },
    ],
    selectedNation: null,
    status: "playing",
  };
}

let logCounter = 0;
export function addLog(s: GameState, text: string, tone: LogEntry["tone"] = "info") {
  s.log.unshift({ id: `l${++logCounter}`, year: s.year, text, tone });
  if (s.log.length > 60) s.log.length = 60;
}

// Player actions
export const ACTIONS = {
  negotiate: (s: GameState) => {
    if (s.player.treasury < 50) return "Potrzeba 50 skarbca";
    s.player.treasury -= 50;
    s.player.diplomacy = clamp(s.player.diplomacy + 6);
    s.globalTension = clamp(s.globalTension - 4);
    s.ai.forEach((a) => (a.relation = clamp(a.relation + 4, -100, 100)));
    addLog(s, "Otwarto kanały dyplomatyczne. Napięcia maleją.", "good");
    return null;
  },
  buildMilitary: (s: GameState) => {
    if (s.player.treasury < 120) return "Potrzeba 120 skarbca";
    s.player.treasury -= 120;
    s.player.military = clamp(s.player.military + 5);
    s.globalTension = clamp(s.globalTension + 3);
    addLog(s, "Zatwierdzono rozbudowę wojska.", "info");
    return null;
  },
  expandNuclear: (s: GameState) => {
    if (s.player.treasury < 200) return "Potrzeba 200 skarbca";
    s.player.treasury -= 200;
    s.player.nuclear = clamp(s.player.nuclear + 6);
    s.globalTension = clamp(s.globalTension + 8);
    s.nuclearRisk = clamp(s.nuclearRisk + 5);
    addLog(s, "Rozbudowano arsenał nuklearny. Światowy niepokój rośnie.", "warn");
    return null;
  },
  investEconomy: (s: GameState) => {
    if (s.player.treasury < 100) return "Potrzeba 100 skarbca";
    s.player.treasury -= 100;
    s.player.economy = clamp(s.player.economy + 5);
    s.player.stability = clamp(s.player.stability + 3);
    addLog(s, "Zainwestowano kapitał w przemysł narodowy.", "good");
    return null;
  },
  spy: (s: GameState) => {
    if (s.player.treasury < 80) return "Potrzeba 80 skarbca";
    s.player.treasury -= 80;
    const target = s.ai[Math.floor(Math.random() * s.ai.length)];
    if (Math.random() < 0.65) {
      target.military = clamp(target.military - 4);
      addLog(s, `Operacja szpiegowska przeciw ${target.id} udana. Zdobyto wywiad.`, "good");
    } else {
      target.relation = clamp(target.relation - 12, -100, 100);
      s.globalTension = clamp(s.globalTension + 6);
      addLog(s, `Operacja szpiegowska przeciw ${target.id} ZDEMASKOWANA. Skutki dyplomatyczne.`, "danger");
    }
    return null;
  },
  formAlliance: (s: GameState) => {
    const candidate = s.ai
      .filter((a) => !a.alliance)
      .sort((a, b) => b.relation - a.relation)[0];
    if (!candidate) return "Brak kandydata";
    if (candidate.relation < 30) return `Relacje z ${candidate.id} zbyt niskie (${candidate.relation})`;
    if (s.player.treasury < 150) return "Potrzeba 150 skarbca";
    s.player.treasury -= 150;
    candidate.alliance = true;
    candidate.relation = clamp(candidate.relation + 20, -100, 100);
    s.player.diplomacy = clamp(s.player.diplomacy + 8);
    s.globalTension = clamp(s.globalTension - 6);
    addLog(s, `Podpisano sojusz z ${candidate.id}.`, "good");
    return null;
  },
  sanction: (s: GameState) => {
    const target = s.selectedNation
      ? s.ai.find((a) => a.id === s.selectedNation)
      : s.ai.sort((a, b) => a.relation - b.relation)[0];
    if (!target) return "Wybierz państwo SI";
    if (target.alliance) return "Nie można nałożyć sankcji na sojusznika";
    target.sanctioned = true;
    target.economy = clamp(target.economy - 6);
    target.relation = clamp(target.relation - 15, -100, 100);
    s.globalTension = clamp(s.globalTension + 5);
    addLog(s, `Nałożono sankcje na ${target.id}.`, "warn");
    return null;
  },
};

export type ActionId = keyof typeof ACTIONS;

// AI turn simulation
export function simulateAITurn(s: GameState) {
  s.ai.forEach((a) => {
    const roll = Math.random();
    const aggression = a.id === "USSAR" ? 0.6 : a.id === "ARC" ? 0.45 : 0.3;
    if (roll < aggression * 0.4) {
      a.nuclear = clamp(a.nuclear + 3);
      s.globalTension = clamp(s.globalTension + 2);
      s.nuclearRisk = clamp(s.nuclearRisk + 2);
      addLog(s, `${a.id} rozbudowuje arsenał nuklearny.`, "warn");
    } else if (roll < aggression * 0.7) {
      a.military = clamp(a.military + 3);
      s.globalTension = clamp(s.globalTension + 1);
      addLog(s, `${a.id} mobilizuje kolejne dywizje.`, "info");
    } else if (roll < 0.85) {
      a.economy = clamp(a.economy + 2);
    } else {
      a.relation = clamp(a.relation + 5, -100, 100);
      s.globalTension = clamp(s.globalTension - 1);
      addLog(s, `${a.id} sygnalizuje otwartość dyplomatyczną.`, "good");
    }
    if (a.sanctioned && Math.random() < 0.4) {
      a.relation = clamp(a.relation - 4, -100, 100);
    }
  });
}

export function endOfTurnDrift(s: GameState) {
  // Economy yields treasury
  s.player.treasury += Math.round(s.player.economy * 2.2);
  // Stability drift
  s.player.stability = clamp(s.player.stability + (s.player.economy > 70 ? 1 : -1));
  // World economy reflects tension
  s.worldEconomy = clamp(s.worldEconomy + (s.globalTension > 70 ? -2 : 1));
  // Nuclear risk derived from tension and arsenals
  const avgArsenal =
    (s.player.nuclear + s.ai.reduce((a, b) => a + b.nuclear, 0)) / (s.ai.length + 1);
  s.nuclearRisk = clamp(Math.round(s.nuclearRisk * 0.85 + s.globalTension * 0.1 + avgArsenal * 0.05));
  // Population drift
  s.player.population = Math.round(s.player.population * (1 + (s.player.stability > 60 ? 0.004 : -0.002)));
}

export function checkEndState(s: GameState): GameState {
  if (s.nuclearRisk >= 100 || s.globalTension >= 100) {
    s.status = "lost";
    s.endReason = "GLOBALNA WOJNA TERMOJĄDROWA — cywilizacja upada.";
    return s;
  }
  if (s.player.stability <= 0) {
    s.status = "lost";
    s.endReason = "Wewnętrzny upadek. Twój rząd został obalony.";
    return s;
  }
  if (s.year >= 2150) {
    s.status = "won";
    s.endReason =
      s.nuclearRisk < 30
        ? "ZWYCIĘSTWO — Przeprowadziłeś ludzkość poza erę atomu."
        : "ZWYCIĘSTWO — Przetrwałeś do 2150 jako dominująca potęga.";
    return s;
  }
  // Disarmament victory
  const allLowNuclear = s.player.nuclear < 20 && s.ai.every((a) => a.nuclear < 25);
  if (allLowNuclear && s.year > 2110) {
    s.status = "won";
    s.endReason = "Osiągnięto GLOBALNE ROZBROJENIE. Era atomu się kończy.";
    return s;
  }
  return s;
}

export function factionMeta(id: FactionId): Faction {
  return getFaction(id);
}