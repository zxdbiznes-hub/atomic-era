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
    name: "Zjednoczone Państwa Atomowe",
    short: "UAS",
    color: "210 90% 55%",
    accent: "blue",
    description:
      "Technokratyczna federacja zrodzona z popiołów dawnych demokracji. Potęga przemysłowa i największa flota na Ziemi.",
    base: { stability: 72, economy: 88, nuclear: 75, military: 90, treasury: 1200, population: 410, diplomacy: 65 },
  },
  {
    id: "EAC",
    name: "Europejska Konfederacja Atomowa",
    short: "EAC",
    color: "270 80% 65%",
    accent: "purple",
    description:
      "Zjednoczona Europa odbudowana wokół sieci fuzyjnych i rządów SI. Dyplomatyczna, bogata i po cichu uzbrojona.",
    base: { stability: 80, economy: 82, nuclear: 55, military: 70, treasury: 1100, population: 520, diplomacy: 90 },
  },
  {
    id: "USSAR",
    name: "Związek Radzieckich Socjalistycznych Republik Atomowych",
    short: "USSAR",
    color: "0 85% 55%",
    accent: "red",
    description:
      "Odrodzony czerwony blok rozciągający się przez Eurazję. Agresywna doktryna, niezrównany arsenał głowic, krucha gospodarka.",
    base: { stability: 58, economy: 60, nuclear: 100, military: 88, treasury: 700, population: 380, diplomacy: 40 },
  },
  {
    id: "ARC",
    name: "Atomowa Republika Chińska",
    short: "ARC",
    color: "20 90% 55%",
    accent: "amber",
    description:
      "Inwigilacyjne supermocarstwo z największą armią świata i kwitnącym przemysłem orbitalnym.",
    base: { stability: 75, economy: 92, nuclear: 80, military: 95, treasury: 1400, population: 1300, diplomacy: 55 },
  },
  {
    id: "JAS",
    name: "Japońskie Państwo Atomowe",
    short: "JAS",
    color: "142 70% 50%",
    accent: "green",
    description:
      "Zmilitaryzowane państwo wyspiarskie, lider w cyberwojnie, robotyce i defensywnej doktrynie nuklearnej.",
    base: { stability: 85, economy: 78, nuclear: 45, military: 72, treasury: 950, population: 110, diplomacy: 70 },
  },
];

export const getFaction = (id: FactionId) => FACTIONS.find((f) => f.id === id)!;