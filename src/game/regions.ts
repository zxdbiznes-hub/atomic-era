import type { FactionId } from "./factions";

export type RegionId = string;

export interface Region {
  id: RegionId;
  name: string;
  short: string;
  /** SVG path in 1000x500 equirectangular-ish viewbox */
  d: string;
  labelX: number;
  labelY: number;
  /** Initial owner faction or null (neutral / unaligned) */
  owner: FactionId | null;
  /** Strategic value: adds to economy/military when owned */
  value: number;
  /** Population in millions */
  population: number;
  /** Defensive bonus (terrain) */
  defense: number;
}

/*
  Coordinate system: viewBox 0 0 1000 500
  Roughly: x = (lon + 180) * 1000/360, y = (90 - lat) * 500/180
  Polygons are heavily simplified silhouettes — recognizable, not GIS-accurate.
*/

export const REGIONS: Region[] = [
  // ============ NORTH AMERICA — UAS ============
  {
    id: "USA",
    name: "Stany Zjednoczone",
    short: "USA",
    d: "M180,150 L260,145 L300,160 L320,180 L310,205 L280,220 L240,225 L200,215 L170,200 L155,180 L160,160 Z",
    labelX: 235, labelY: 185, owner: "UAS", value: 35, population: 340, defense: 5,
  },
  {
    id: "CAN",
    name: "Kanada",
    short: "CAN",
    d: "M150,90 L320,85 L335,120 L320,150 L260,148 L180,150 L155,140 L140,115 Z",
    labelX: 235, labelY: 120, owner: "UAS", value: 18, population: 40, defense: 8,
  },
  {
    id: "MEX",
    name: "Meksyk",
    short: "MEX",
    d: "M200,225 L260,230 L275,255 L245,265 L215,255 Z",
    labelX: 240, labelY: 248, owner: "UAS", value: 8, population: 130, defense: 4,
  },

  // ============ SOUTH AMERICA — neutral ============
  {
    id: "BRA",
    name: "Brazylia",
    short: "BRA",
    d: "M310,290 L370,285 L385,320 L375,360 L340,380 L310,360 L300,325 Z",
    labelX: 340, labelY: 330, owner: null, value: 14, population: 220, defense: 5,
  },
  {
    id: "ARG",
    name: "Argentyna",
    short: "ARG",
    d: "M305,380 L335,378 L340,420 L320,450 L305,430 Z",
    labelX: 320, labelY: 410, owner: null, value: 7, population: 47, defense: 4,
  },
  {
    id: "COL",
    name: "Andy",
    short: "AND",
    d: "M285,260 L310,265 L308,300 L290,310 L280,285 Z",
    labelX: 295, labelY: 285, owner: null, value: 5, population: 110, defense: 6,
  },

  // ============ EUROPE — EAC ============
  {
    id: "DEU",
    name: "Niemcy",
    short: "DEU",
    d: "M495,165 L515,162 L520,180 L505,188 L490,180 Z",
    labelX: 505, labelY: 178, owner: "EAC", value: 14, population: 84, defense: 4,
  },
  {
    id: "FRA",
    name: "Francja",
    short: "FRA",
    d: "M468,180 L495,178 L500,200 L478,210 L463,195 Z",
    labelX: 480, labelY: 195, owner: "EAC", value: 12, population: 68, defense: 4,
  },
  {
    id: "GBR",
    name: "Wielka Brytania",
    short: "GBR",
    d: "M460,155 L478,153 L480,175 L465,180 Z",
    labelX: 470, labelY: 168, owner: "EAC", value: 10, population: 67, defense: 6,
  },
  {
    id: "POL",
    name: "Polska",
    short: "POL",
    d: "M520,162 L545,160 L548,182 L525,185 Z",
    labelX: 533, labelY: 173, owner: "EAC", value: 8, population: 38, defense: 4,
  },
  {
    id: "ESP",
    name: "Hiszpania",
    short: "ESP",
    d: "M448,200 L478,205 L478,225 L450,228 L440,215 Z",
    labelX: 462, labelY: 215, owner: "EAC", value: 8, population: 48, defense: 5,
  },
  {
    id: "ITA",
    name: "Włochy",
    short: "ITA",
    d: "M500,200 L515,202 L520,225 L508,235 L500,215 Z",
    labelX: 508, labelY: 215, owner: "EAC", value: 9, population: 59, defense: 5,
  },
  {
    id: "SCN",
    name: "Skandynawia",
    short: "SCN",
    d: "M495,110 L530,105 L540,150 L515,158 L498,145 Z",
    labelX: 515, labelY: 130, owner: "EAC", value: 9, population: 27, defense: 7,
  },

  // ============ RUSSIA / EURASIA — USSAR ============
  {
    id: "RUS",
    name: "Rosja",
    short: "RUS",
    d: "M548,100 L860,95 L880,140 L780,160 L680,158 L600,150 L555,140 Z",
    labelX: 700, labelY: 125, owner: "USSAR", value: 28, population: 144, defense: 9,
  },
  {
    id: "UKR",
    name: "Ukraina",
    short: "UKR",
    d: "M548,160 L595,158 L600,180 L555,184 Z",
    labelX: 575, labelY: 172, owner: "USSAR", value: 6, population: 38, defense: 4,
  },
  {
    id: "KAZ",
    name: "Kazachstan",
    short: "KAZ",
    d: "M600,160 L700,160 L710,195 L620,200 L605,180 Z",
    labelX: 655, labelY: 180, owner: "USSAR", value: 8, population: 20, defense: 6,
  },

  // ============ CHINA / EAST ASIA — ARC ============
  {
    id: "CHN",
    name: "Chiny",
    short: "CHN",
    d: "M710,180 L820,175 L840,225 L780,240 L720,235 L705,210 Z",
    labelX: 770, labelY: 210, owner: "ARC", value: 32, population: 1410, defense: 6,
  },
  {
    id: "MNG",
    name: "Mongolia",
    short: "MNG",
    d: "M710,160 L800,158 L810,178 L715,180 Z",
    labelX: 758, labelY: 170, owner: "ARC", value: 5, population: 3, defense: 6,
  },

  // ============ JAPAN / KOREA — JAS ============
  {
    id: "JPN",
    name: "Japonia",
    short: "JPN",
    d: "M858,180 L878,178 L885,215 L865,225 L855,205 Z",
    labelX: 870, labelY: 200, owner: "JAS", value: 16, population: 124, defense: 7,
  },
  {
    id: "KOR",
    name: "Korea",
    short: "KOR",
    d: "M838,195 L852,194 L854,215 L840,218 Z",
    labelX: 846, labelY: 205, owner: "JAS", value: 9, population: 78, defense: 5,
  },

  // ============ MIDDLE EAST / CENTRAL ASIA — neutral ============
  {
    id: "IRN",
    name: "Iran",
    short: "IRN",
    d: "M615,200 L660,200 L668,230 L625,232 L612,220 Z",
    labelX: 640, labelY: 218, owner: null, value: 9, population: 89, defense: 6,
  },
  {
    id: "TUR",
    name: "Turcja",
    short: "TUR",
    d: "M555,190 L605,188 L612,210 L560,212 Z",
    labelX: 583, labelY: 200, owner: null, value: 8, population: 85, defense: 5,
  },
  {
    id: "SAU",
    name: "Arabia Saudyjska",
    short: "SAU",
    d: "M575,225 L625,225 L630,265 L590,275 L570,250 Z",
    labelX: 600, labelY: 250, owner: null, value: 11, population: 36, defense: 4,
  },

  // ============ INDIA / SE ASIA — neutral ============
  {
    id: "IND",
    name: "Indie",
    short: "IND",
    d: "M670,225 L720,225 L725,275 L695,295 L675,265 Z",
    labelX: 698, labelY: 260, owner: null, value: 18, population: 1428, defense: 5,
  },
  {
    id: "IDN",
    name: "Indonezja",
    short: "IDN",
    d: "M770,300 L850,295 L860,318 L795,322 L770,315 Z",
    labelX: 815, labelY: 310, owner: null, value: 8, population: 277, defense: 5,
  },

  // ============ AFRICA — neutral ============
  {
    id: "EGY",
    name: "Egipt",
    short: "EGY",
    d: "M540,228 L575,225 L580,255 L548,260 Z",
    labelX: 560, labelY: 245, owner: null, value: 6, population: 110, defense: 4,
  },
  {
    id: "NGA",
    name: "Afryka Zach.",
    short: "WAF",
    d: "M460,255 L530,255 L535,295 L490,305 L460,285 Z",
    labelX: 495, labelY: 280, owner: null, value: 9, population: 410, defense: 4,
  },
  {
    id: "ZAF",
    name: "Afryka Płd.",
    short: "ZAF",
    d: "M510,365 L555,360 L560,400 L520,415 L505,390 Z",
    labelX: 532, labelY: 388, owner: null, value: 7, population: 60, defense: 4,
  },
  {
    id: "EAF",
    name: "Afryka Wsch.",
    short: "EAF",
    d: "M540,290 L585,290 L590,355 L555,365 L540,330 Z",
    labelX: 562, labelY: 325, owner: null, value: 6, population: 480, defense: 5,
  },

  // ============ OCEANIA — neutral ============
  {
    id: "AUS",
    name: "Australia",
    short: "AUS",
    d: "M820,355 L905,350 L915,400 L835,410 L815,385 Z",
    labelX: 865, labelY: 380, owner: null, value: 10, population: 26, defense: 7,
  },
];

export const getRegion = (id: RegionId) => REGIONS.find((r) => r.id === id);

/** Two regions share a border if their bounding boxes are close. Pre-computed for combat adjacency. */
const ADJACENCY: Record<RegionId, RegionId[]> = {
  USA: ["CAN", "MEX"],
  CAN: ["USA"],
  MEX: ["USA", "COL"],
  COL: ["MEX", "BRA"],
  BRA: ["COL", "ARG"],
  ARG: ["BRA"],
  GBR: ["FRA"],
  FRA: ["DEU", "ESP", "ITA", "GBR"],
  DEU: ["FRA", "POL", "ITA", "SCN"],
  POL: ["DEU", "UKR", "SCN"],
  ESP: ["FRA"],
  ITA: ["FRA", "DEU"],
  SCN: ["DEU", "POL", "RUS"],
  UKR: ["POL", "RUS", "TUR"],
  RUS: ["UKR", "SCN", "KAZ", "MNG", "CHN"],
  KAZ: ["RUS", "CHN", "IRN"],
  CHN: ["RUS", "KAZ", "MNG", "IND", "KOR", "IRN"],
  MNG: ["RUS", "CHN"],
  KOR: ["CHN", "JPN"],
  JPN: ["KOR"],
  IRN: ["TUR", "SAU", "KAZ", "CHN", "IND"],
  TUR: ["UKR", "IRN", "EGY"],
  SAU: ["IRN", "EGY"],
  IND: ["CHN", "IRN", "IDN"],
  IDN: ["IND", "AUS"],
  EGY: ["TUR", "SAU", "EAF", "NGA"],
  NGA: ["EGY", "EAF", "ZAF"],
  EAF: ["EGY", "NGA", "ZAF"],
  ZAF: ["NGA", "EAF"],
  AUS: ["IDN"],
};

export const getNeighbors = (id: RegionId): RegionId[] => ADJACENCY[id] ?? [];

export const regionsOwnedBy = (regions: Record<RegionId, FactionId | null>, faction: FactionId): RegionId[] =>
  Object.entries(regions).filter(([, o]) => o === faction).map(([id]) => id);

export const isAdjacentToFaction = (
  regions: Record<RegionId, FactionId | null>,
  regionId: RegionId,
  faction: FactionId,
): boolean => getNeighbors(regionId).some((n) => regions[n] === faction);

export function initialOwnership(): Record<RegionId, FactionId | null> {
  const o: Record<RegionId, FactionId | null> = {};
  for (const r of REGIONS) o[r.id] = r.owner;
  return o;
}