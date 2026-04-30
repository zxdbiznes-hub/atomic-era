import { FACTIONS, Faction, FactionId, getFaction } from "./factions";
import { getNeighbors, initialOwnership, REGIONS, RegionId, getRegion } from "./regions";
import { getTech, isUnlocked, TECHS } from "./tech";

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
  atWar: boolean;
  treasury: number;
}

export interface LogEntry {
  id: string;
  year: number;
  text: string;
  tone: "info" | "warn" | "danger" | "good";
}

export interface GameState {
  year: number;
  /** save schema version */
  version?: number;
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
  /** Owner of each region; null = neutral / unaligned */
  regions: Record<RegionId, FactionId | null>;
  /** Selected region (overrides selectedNation when set) */
  selectedRegion: RegionId | null;
  /** Player tech */
  research: { current: string | null; progress: number; owned: string[]; pointsPerTurn: number };
  /** Wars: faction id -> at war with player */
  wars: FactionId[];
  /** Doctrine */
  doctrine: "balanced" | "hawk" | "dove" | "tech";
}

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function createInitialState(playerId: FactionId): GameState {
  const player = getFaction(playerId);
  return {
    year: 2095,
    version: 2,
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
      atWar: false,
      treasury: f.base.treasury,
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
    regions: initialOwnership(),
    selectedRegion: null,
    research: { current: null, progress: 0, owned: [], pointsPerTurn: 8 },
    wars: [],
    doctrine: "balanced",
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
  declareWar: (s: GameState) => {
    const target = s.selectedNation ? s.ai.find((a) => a.id === s.selectedNation) : null;
    if (!target) return "Wybierz państwo do wypowiedzenia wojny";
    if (target.alliance) return "Nie można atakować sojusznika";
    if (target.atWar) return "Już jesteście w stanie wojny";
    target.atWar = true;
    if (!s.wars.includes(target.id)) s.wars.push(target.id);
    target.relation = -100;
    s.globalTension = clamp(s.globalTension + 18);
    s.nuclearRisk = clamp(s.nuclearRisk + 10);
    s.player.stability = clamp(s.player.stability - 3);
    addLog(s, `WYPOWIEDZIANO WOJNĘ państwu ${target.id}.`, "danger");
    return null;
  },
  peace: (s: GameState) => {
    const target = s.selectedNation ? s.ai.find((a) => a.id === s.selectedNation) : null;
    if (!target) return "Wybierz państwo do zawarcia pokoju";
    if (!target.atWar) return "Nie jesteście w stanie wojny";
    if (s.player.treasury < 100) return "Potrzeba 100 skarbca na reparacje";
    s.player.treasury -= 100;
    target.atWar = false;
    s.wars = s.wars.filter((w) => w !== target.id);
    target.relation = -30;
    s.globalTension = clamp(s.globalTension - 8);
    addLog(s, `Zawarto pokój z ${target.id}.`, "good");
    return null;
  },
};

export type ActionId = keyof typeof ACTIONS;

/** Attack adjacent enemy region with chosen region you own */
export function invadeRegion(s: GameState, fromRegion: RegionId, targetRegion: RegionId): string | null {
  const owner = s.regions[targetRegion];
  if (s.regions[fromRegion] !== s.playerId) return "To nie jest twój region";
  if (owner === s.playerId) return "Region już należy do ciebie";
  if (!getNeighbors(fromRegion).includes(targetRegion)) return "Brak granicy z celem";
  if (owner && owner !== s.playerId) {
    const enemy = s.ai.find((a) => a.id === owner);
    if (enemy?.alliance) return "Nie możesz atakować terytorium sojusznika";
    if (enemy && !enemy.atWar) return `Wypowiedz najpierw wojnę państwu ${owner}`;
  }
  if (s.player.military < 25) return "Zbyt słabe wojsko (min. 25)";
  if (s.player.treasury < 80) return "Potrzeba 80 skarbca na operację";
  s.player.treasury -= 80;

  const target = getRegion(targetRegion)!;
  const attackerStrength = s.player.military * 1.0 + (s.research.owned.includes("doctrine_blitz") ? 12 : 0)
    + (s.research.owned.includes("orbital_strike") ? 15 : 0);
  const defenderStrength = (owner ? (s.ai.find((a) => a.id === owner)?.military ?? 30) : 30) * 0.6
    + target.defense * 4 + 10;
  const roll = Math.random() * 100;
  const winChance = clamp((attackerStrength / (attackerStrength + defenderStrength)) * 100, 5, 95);

  if (roll < winChance) {
    s.regions[targetRegion] = s.playerId;
    s.player.military = clamp(s.player.military - 6);
    s.player.economy = clamp(s.player.economy + Math.round(target.value / 4));
    s.player.population += Math.round(target.population * 0.5);
    addLog(s, `PODBÓJ ${target.name}! (${Math.round(winChance)}% szans)`, "good");
    if (owner) {
      const e = s.ai.find((a) => a.id === owner);
      if (e) { e.military = clamp(e.military - 8); e.economy = clamp(e.economy - 5); }
    }
    s.globalTension = clamp(s.globalTension + 6);
  } else {
    s.player.military = clamp(s.player.military - 10);
    s.player.stability = clamp(s.player.stability - 4);
    addLog(s, `Atak na ${target.name} ODPARTY. Straty są ciężkie.`, "danger");
  }
  return null;
}

/** Set or switch active research */
export function setResearch(s: GameState, techId: string): string | null {
  const t = getTech(techId);
  if (!t) return "Brak technologii";
  if (s.research.owned.includes(techId)) return "Już zbadane";
  if (!isUnlocked(t, s.research.owned)) return "Wymagania niespełnione";
  if (s.research.current === techId) return null;
  s.research.current = techId;
  s.research.progress = 0;
  addLog(s, `Rozpoczęto badania: ${t.name}.`, "info");
  return null;
}

function applyTechEffect(s: GameState, id: string) {
  switch (id) {
    case "fusion_v1":      s.player.economy = clamp(s.player.economy + 8); break;
    case "cyber_def":      s.player.stability = clamp(s.player.stability + 10); break;
    case "rail_logistics": s.player.economy = clamp(s.player.economy + 6); break;
    case "doctrine_blitz": /* applied at combat */ break;
    case "mirv":           s.player.nuclear = clamp(s.player.nuclear + 12); break;
    case "ai_command":     s.player.military = clamp(s.player.military + 10); break;
    case "orbital_strike": s.player.nuclear = clamp(s.player.nuclear + 5); break;
    case "fusion_econ":    s.player.economy = clamp(s.player.economy + 15); s.research.pointsPerTurn += 2; break;
    case "shield_dome":    s.nuclearRisk = clamp(s.nuclearRisk - 25); break;
    case "antimatter":     s.player.economy = clamp(s.player.economy + 25); s.research.pointsPerTurn += 4; break;
    case "neural_state":   s.player.stability = clamp(s.player.stability + 25); s.player.diplomacy = clamp(s.player.diplomacy + 15); break;
  }
}

function progressResearch(s: GameState) {
  if (!s.research.current) return;
  s.research.progress += s.research.pointsPerTurn;
  const t = getTech(s.research.current);
  if (s.research.progress >= t.cost) {
    s.research.owned.push(t.id);
    addLog(s, `BADANIA UKOŃCZONE: ${t.name}.`, "good");
    applyTechEffect(s, t.id);
    s.research.current = null;
    s.research.progress = 0;
  }
}

/** AI invades player or enemy regions when at war */
function aiCombatPhase(s: GameState) {
  for (const enemy of s.ai) {
    if (!enemy.atWar) continue;
    // Find an enemy-owned region adjacent to a player region
    const enemyRegions = Object.entries(s.regions).filter(([, o]) => o === enemy.id).map(([r]) => r);
    for (const er of enemyRegions) {
      const targets = getNeighbors(er).filter((n) => s.regions[n] === s.playerId);
      if (targets.length === 0) continue;
      if (Math.random() > 0.35) continue;
      const target = targets[Math.floor(Math.random() * targets.length)];
      const reg = getRegion(target)!;
      const atk = enemy.military + 5;
      const def = s.player.military * 0.7 + reg.defense * 4 + 10
        + (s.research.owned.includes("ai_command") ? 8 : 0);
      const win = Math.random() < (atk / (atk + def));
      if (win) {
        s.regions[target] = enemy.id;
        s.player.military = clamp(s.player.military - 5);
        s.player.stability = clamp(s.player.stability - 6);
        addLog(s, `${enemy.id} zajmuje ${reg.name}!`, "danger");
      } else {
        enemy.military = clamp(enemy.military - 5);
        addLog(s, `Odparto ofensywę ${enemy.id} na ${reg.name}.`, "good");
      }
      break;
    }
  }
}

// AI turn simulation
export function simulateAITurn(s: GameState) {
  s.ai.forEach((a) => {
    const roll = Math.random();
    const aggression = a.id === "USSAR" ? 0.6 : a.id === "ARC" ? 0.45 : 0.3;
    // AI may declare war if relations are very low and player looks weak
    if (!a.atWar && !a.alliance && a.relation < -55 && Math.random() < aggression * 0.25) {
      if (s.player.military < a.military + 10) {
        a.atWar = true;
        if (!s.wars.includes(a.id)) s.wars.push(a.id);
        s.globalTension = clamp(s.globalTension + 15);
        s.nuclearRisk = clamp(s.nuclearRisk + 8);
        addLog(s, `${a.id} WYPOWIADA CI WOJNĘ.`, "danger");
      }
    }
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
  aiCombatPhase(s);
}

export function endOfTurnDrift(s: GameState) {
  // Economy yields treasury
  const ownedRegions = Object.values(s.regions).filter((o) => o === s.playerId).length;
  const territoryBonus = ownedRegions * 6;
  const fusionMul = s.research.owned.includes("fusion_v1") ? 1.1 : 1;
  s.player.treasury += Math.round((s.player.economy * 2.2 + territoryBonus) * fusionMul);
  // Stability drift
  const warPenalty = s.wars.length * 2;
  s.player.stability = clamp(s.player.stability + (s.player.economy > 70 ? 1 : -1) - warPenalty);
  // World economy reflects tension
  s.worldEconomy = clamp(s.worldEconomy + (s.globalTension > 70 ? -2 : 1));
  // Nuclear risk derived from tension and arsenals
  const avgArsenal =
    (s.player.nuclear + s.ai.reduce((a, b) => a + b.nuclear, 0)) / (s.ai.length + 1);
  const shieldMul = s.research.owned.includes("shield_dome") ? 0.6 : 1;
  s.nuclearRisk = clamp(Math.round((s.nuclearRisk * 0.85 + s.globalTension * 0.1 + avgArsenal * 0.05) * shieldMul));
  // Population drift
  s.player.population = Math.round(s.player.population * (1 + (s.player.stability > 60 ? 0.004 : -0.002)));
  // Research
  progressResearch(s);
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
  // Tech victory
  if (s.research.owned.includes("antimatter") && s.research.owned.includes("neural_state")) {
    s.status = "won";
    s.endReason = "ZWYCIĘSTWO TECHNOLOGICZNE — Twoja cywilizacja przekroczyła erę atomu.";
    return s;
  }
  // Domination victory: own >70% of regions
  const total = REGIONS.length;
  const owned = Object.values(s.regions).filter((o) => o === s.playerId).length;
  if (owned / total >= 0.7) {
    s.status = "won";
    s.endReason = `ZWYCIĘSTWO DOMINACJI — Kontrolujesz ${owned}/${total} regionów świata.`;
    return s;
  }
  return s;
}

export function factionMeta(id: FactionId): Faction {
  return getFaction(id);
}