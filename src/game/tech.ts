export interface Tech {
  id: string;
  name: string;
  description: string;
  cost: number;        // research points required
  era: 1 | 2 | 3;
  requires?: string[];
  effect: string;      // human-readable
}

export const TECHS: Tech[] = [
  // ===== Era 1 — Foundations =====
  { id: "fusion_v1",     name: "Fuzja Tokamak",        description: "Stabilna fuzja deuter-tryt zasila przemysł.", cost: 60,  era: 1, effect: "+8 Gospodarka, +1/turę Skarbiec×1.1" },
  { id: "cyber_def",     name: "Cyberobrona Aegis",    description: "Tarcza sieciowa SI chroni infrastrukturę.",   cost: 50,  era: 1, effect: "+10 Stabilność, odporność na cyberataki" },
  { id: "rail_logistics",name: "Logistyka Maglev",     description: "Sieć kolei magnetycznych łączy regiony.",     cost: 45,  era: 1, effect: "+6 Gospodarka, +1 obrona regionów" },
  { id: "doctrine_blitz",name: "Doktryna Błyskawiczna",description: "Manewr i zaskoczenie ponad masą.",            cost: 55,  era: 1, effect: "+15% siła ataku" },

  // ===== Era 2 — Power =====
  { id: "mirv",          name: "Głowice MIRV",         description: "Wielogłowicowe pociski balistyczne.",         cost: 90,  era: 2, requires: ["fusion_v1"], effect: "+12 Atom, +5% odstraszanie" },
  { id: "ai_command",    name: "Dowodzenie SI",        description: "Kwantowa SI dowodzi twoimi siłami.",          cost: 100, era: 2, requires: ["cyber_def"], effect: "+10 Wojsko, AI rzadziej cię atakuje" },
  { id: "orbital_strike",name: "Uderzenia Orbitalne",  description: "Kinetyczne pociski z orbity.",                cost: 110, era: 2, requires: ["doctrine_blitz"], effect: "+18% siła ataku, +5 Atom" },
  { id: "fusion_econ",   name: "Reaktory Towarowe",    description: "Fuzja w przemyśle ciężkim na masową skalę.",  cost: 95,  era: 2, requires: ["fusion_v1", "rail_logistics"], effect: "+15 Gospodarka, +1 Stab/turę" },

  // ===== Era 3 — Endgame =====
  { id: "shield_dome",   name: "Kopuła Antyrakietowa", description: "Globalna sieć przechwytywania pocisków.",     cost: 160, era: 3, requires: ["orbital_strike", "ai_command"], effect: "−40% Ryzyko Atomowe rocznie" },
  { id: "antimatter",    name: "Reaktor Antymaterii",  description: "Era post-atomowa rozpoczyna się tutaj.",      cost: 200, era: 3, requires: ["fusion_econ", "mirv"], effect: "+25 Gospodarka, otwiera ZWYCIĘSTWO TECHNOLOGICZNE" },
  { id: "neural_state",  name: "Państwo Neuralne",     description: "Bezpośrednia demokracja interfejsu mózg-SI.", cost: 180, era: 3, requires: ["ai_command", "fusion_econ"], effect: "+25 Stabilność, +15 Dyplomacja" },
];

export const getTech = (id: string) => TECHS.find((t) => t.id === id)!;

export function isUnlocked(t: Tech, owned: string[]): boolean {
  return !t.requires || t.requires.every((r) => owned.includes(r));
}