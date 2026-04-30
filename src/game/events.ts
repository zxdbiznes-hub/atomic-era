import type { GameState } from "./engine";

export interface EventChoice {
  label: string;
  apply: (s: GameState) => void;
  description: string;
}

export interface GameEvent {
  id: string;
  title: string;
  body: string;
  weight: number;
  choices: EventChoice[];
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const EVENTS: GameEvent[] = [
  {
    id: "ussar_hbomb",
    title: "USSAR Tests New Hydrogen Bomb",
    body: "Seismic sensors confirm a 50-megaton detonation in the Arctic. The world demands a response.",
    weight: 10,
    choices: [
      {
        label: "Condemn publicly",
        description: "+5 Diplomacy, +8 Global Tension",
        apply: (s) => {
          s.player.diplomacy = clamp(s.player.diplomacy + 5);
          s.globalTension = clamp(s.globalTension + 8);
        },
      },
      {
        label: "Match their arsenal",
        description: "+8 Nuclear, +12 Tension, -150 Treasury",
        apply: (s) => {
          s.player.nuclear = clamp(s.player.nuclear + 8);
          s.globalTension = clamp(s.globalTension + 12);
          s.player.treasury -= 150;
        },
      },
      {
        label: "Stay silent",
        description: "-4 Stability",
        apply: (s) => {
          s.player.stability = clamp(s.player.stability - 4);
        },
      },
    ],
  },
  {
    id: "uranium_china",
    title: "ARC Discovers Vast Uranium Deposits",
    body: "Massive uranium reserves found in the Gobi. Global markets shift overnight.",
    weight: 8,
    choices: [
      {
        label: "Negotiate trade deal",
        description: "+200 Treasury, +5 Diplomacy",
        apply: (s) => {
          s.player.treasury += 200;
          s.player.diplomacy = clamp(s.player.diplomacy + 5);
        },
      },
      {
        label: "Sabotage operation",
        description: "Risky: -8 Diplomacy, +6 Tension, +5 Nuclear edge",
        apply: (s) => {
          s.player.diplomacy = clamp(s.player.diplomacy - 8);
          s.globalTension = clamp(s.globalTension + 6);
          s.player.nuclear = clamp(s.player.nuclear + 5);
        },
      },
    ],
  },
  {
    id: "eu_protests",
    title: "European Mass Protests",
    body: "Millions march across the EAC demanding global disarmament.",
    weight: 7,
    choices: [
      {
        label: "Support disarmament talks",
        description: "-10 Tension, -5 Nuclear",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 10);
          s.player.nuclear = clamp(s.player.nuclear - 5);
          s.nuclearRisk = clamp(s.nuclearRisk - 8);
        },
      },
      {
        label: "Ignore",
        description: "No effect",
        apply: () => {},
      },
    ],
  },
  {
    id: "cyber_attack",
    title: "Cyber Attack on Military Network",
    body: "An unknown actor breached your defense grid. Damage assessment underway.",
    weight: 9,
    choices: [
      {
        label: "Invest in cyber defense",
        description: "-100 Treasury, +6 Stability",
        apply: (s) => {
          s.player.treasury -= 100;
          s.player.stability = clamp(s.player.stability + 6);
        },
      },
      {
        label: "Retaliate digitally",
        description: "+10 Tension, +4 Military",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension + 10);
          s.player.military = clamp(s.player.military + 4);
        },
      },
    ],
  },
  {
    id: "border_conflict",
    title: "Border Conflict Escalates",
    body: "Skirmishes erupt along a contested border. Casualties reported on both sides.",
    weight: 8,
    choices: [
      {
        label: "Deploy troops",
        description: "+6 Military, +10 Tension, -80 Treasury",
        apply: (s) => {
          s.player.military = clamp(s.player.military + 6);
          s.globalTension = clamp(s.globalTension + 10);
          s.player.treasury -= 80;
        },
      },
      {
        label: "Open negotiations",
        description: "-6 Tension, +6 Diplomacy",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 6);
          s.player.diplomacy = clamp(s.player.diplomacy + 6);
        },
      },
    ],
  },
  {
    id: "peace_summit",
    title: "Peace Summit Convened",
    body: "Global leaders gather in Geneva. The world holds its breath.",
    weight: 6,
    choices: [
      {
        label: "Champion the summit",
        description: "-15 Tension, -10 Risk, +10 Diplomacy",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 15);
          s.nuclearRisk = clamp(s.nuclearRisk - 10);
          s.player.diplomacy = clamp(s.player.diplomacy + 10);
        },
      },
      {
        label: "Boycott",
        description: "+5 Tension, -5 Diplomacy",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension + 5);
          s.player.diplomacy = clamp(s.player.diplomacy - 5);
        },
      },
    ],
  },
  {
    id: "economic_boom",
    title: "Global Economic Boom",
    body: "AI-driven productivity surges. Markets reach all-time highs.",
    weight: 6,
    choices: [
      {
        label: "Cash in",
        description: "+300 Treasury, +5 Stability",
        apply: (s) => {
          s.player.treasury += 300;
          s.player.stability = clamp(s.player.stability + 5);
          s.worldEconomy = clamp(s.worldEconomy + 8);
        },
      },
    ],
  },
  {
    id: "rogue_state",
    title: "Rogue State Acquires Warhead",
    body: "Intelligence confirms a non-aligned state has stolen a tactical nuke.",
    weight: 7,
    choices: [
      {
        label: "Joint strike team",
        description: "-7 Risk, -120 Treasury",
        apply: (s) => {
          s.nuclearRisk = clamp(s.nuclearRisk - 7);
          s.player.treasury -= 120;
        },
      },
      {
        label: "Do nothing",
        description: "+12 Risk",
        apply: (s) => {
          s.nuclearRisk = clamp(s.nuclearRisk + 12);
        },
      },
    ],
  },
  {
    id: "fusion_breakthrough",
    title: "Fusion Breakthrough",
    body: "Your scientists achieve sustained net-positive fusion.",
    weight: 5,
    choices: [
      {
        label: "Industrialize",
        description: "+10 Economy, +200 Treasury",
        apply: (s) => {
          s.player.economy = clamp(s.player.economy + 10);
          s.player.treasury += 200;
        },
      },
      {
        label: "Share with allies",
        description: "+12 Diplomacy, -8 Tension",
        apply: (s) => {
          s.player.diplomacy = clamp(s.player.diplomacy + 12);
          s.globalTension = clamp(s.globalTension - 8);
        },
      },
    ],
  },
];

export function pickEvent(): GameEvent {
  const total = EVENTS.reduce((a, e) => a + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EVENTS) {
    if ((r -= e.weight) <= 0) return e;
  }
  return EVENTS[0];
}