export type FactionId = "UAS" | "EAC" | "USSAR" | "ARC" | "JAS";

export interface Faction {
  id: FactionId;
  name: string;
  short: string;
  color: string; // hsl
  accent: string;
  description: string;
  base: {
    stability: number;
    economy: number;
    nuclear: number;
    military: number;
    treasury: number;
    population: number; // millions
    diplomacy: number;
  };
}

export const FACTIONS: Faction[] = [
  {
    id: "UAS",
    name: "United Atomic States",
    short: "UAS",
    color: "210 90% 55%",
    accent: "blue",
    description:
      "A technocratic federation born from the ashes of old democracies. Industrial might and the largest navy on Earth.",
    base: { stability: 72, economy: 88, nuclear: 75, military: 90, treasury: 1200, population: 410, diplomacy: 65 },
  },
  {
    id: "EAC",
    name: "European Atomic Confederation",
    short: "EAC",
    color: "270 80% 65%",
    accent: "purple",
    description:
      "A unified Europe rebuilt around fusion grids and AI governance. Diplomatic, wealthy, and quietly armed.",
    base: { stability: 80, economy: 82, nuclear: 55, military: 70, treasury: 1100, population: 520, diplomacy: 90 },
  },
  {
    id: "USSAR",
    name: "Union of Soviet Socialist Atomic Republics",
    short: "USSAR",
    color: "0 85% 55%",
    accent: "red",
    description:
      "Reborn red bloc spanning Eurasia. Aggressive doctrine, unmatched warhead stockpile, fragile economy.",
    base: { stability: 58, economy: 60, nuclear: 100, military: 88, treasury: 700, population: 380, diplomacy: 40 },
  },
  {
    id: "ARC",
    name: "Atomic Republic of China",
    short: "ARC",
    color: "20 90% 55%",
    accent: "amber",
    description:
      "A surveillance superstate with the world's largest army and a booming orbital industry.",
    base: { stability: 75, economy: 92, nuclear: 80, military: 95, treasury: 1400, population: 1300, diplomacy: 55 },
  },
  {
    id: "JAS",
    name: "Japan Atomic State",
    short: "JAS",
    color: "142 70% 50%",
    accent: "green",
    description:
      "Militarized island nation leading in cyberwarfare, robotics, and defensive nuclear posture.",
    base: { stability: 85, economy: 78, nuclear: 45, military: 72, treasury: 950, population: 110, diplomacy: 70 },
  },
];

export const getFaction = (id: FactionId) => FACTIONS.find((f) => f.id === id)!;