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
    title: "USSAR testuje nową bombę wodorową",
    body: "Czujniki sejsmiczne potwierdzają detonację 50 megaton w Arktyce. Świat domaga się odpowiedzi.",
    weight: 10,
    choices: [
      {
        label: "Potępij publicznie",
        description: "+5 Dyplomacja, +8 Napięcie",
        apply: (s) => {
          s.player.diplomacy = clamp(s.player.diplomacy + 5);
          s.globalTension = clamp(s.globalTension + 8);
        },
      },
      {
        label: "Dorównaj ich arsenałowi",
        description: "+8 Atom, +12 Napięcie, -150 Skarbiec",
        apply: (s) => {
          s.player.nuclear = clamp(s.player.nuclear + 8);
          s.globalTension = clamp(s.globalTension + 12);
          s.player.treasury -= 150;
        },
      },
      {
        label: "Zachowaj milczenie",
        description: "-4 Stabilność",
        apply: (s) => {
          s.player.stability = clamp(s.player.stability - 4);
        },
      },
    ],
  },
  {
    id: "uranium_china",
    title: "ARC odkrywa ogromne złoża uranu",
    body: "Olbrzymie rezerwy uranu znalezione na pustyni Gobi. Globalne rynki zmieniają się z dnia na dzień.",
    weight: 8,
    choices: [
      {
        label: "Negocjuj umowę handlową",
        description: "+200 Skarbiec, +5 Dyplomacja",
        apply: (s) => {
          s.player.treasury += 200;
          s.player.diplomacy = clamp(s.player.diplomacy + 5);
        },
      },
      {
        label: "Operacja sabotażowa",
        description: "Ryzyko: -8 Dyplomacja, +6 Napięcie, +5 Przewaga nuklearna",
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
    title: "Masowe protesty w Europie",
    body: "Miliony ludzi maszerują w EAC, żądając globalnego rozbrojenia.",
    weight: 7,
    choices: [
      {
        label: "Wesprzyj rozmowy rozbrojeniowe",
        description: "-10 Napięcie, -5 Atom",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 10);
          s.player.nuclear = clamp(s.player.nuclear - 5);
          s.nuclearRisk = clamp(s.nuclearRisk - 8);
        },
      },
      {
        label: "Zignoruj",
        description: "Bez efektu",
        apply: () => {},
      },
    ],
  },
  {
    id: "cyber_attack",
    title: "Cyberatak na sieć wojskową",
    body: "Nieznany sprawca włamał się do twojej sieci obronnej. Trwa ocena strat.",
    weight: 9,
    choices: [
      {
        label: "Zainwestuj w cyberobronę",
        description: "-100 Skarbiec, +6 Stabilność",
        apply: (s) => {
          s.player.treasury -= 100;
          s.player.stability = clamp(s.player.stability + 6);
        },
      },
      {
        label: "Cyfrowy odwet",
        description: "+10 Napięcie, +4 Wojsko",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension + 10);
          s.player.military = clamp(s.player.military + 4);
        },
      },
    ],
  },
  {
    id: "border_conflict",
    title: "Konflikt graniczny eskaluje",
    body: "Wybuchają potyczki na spornej granicy. Po obu stronach są ofiary.",
    weight: 8,
    choices: [
      {
        label: "Wyślij wojska",
        description: "+6 Wojsko, +10 Napięcie, -80 Skarbiec",
        apply: (s) => {
          s.player.military = clamp(s.player.military + 6);
          s.globalTension = clamp(s.globalTension + 10);
          s.player.treasury -= 80;
        },
      },
      {
        label: "Rozpocznij negocjacje",
        description: "-6 Napięcie, +6 Dyplomacja",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 6);
          s.player.diplomacy = clamp(s.player.diplomacy + 6);
        },
      },
    ],
  },
  {
    id: "peace_summit",
    title: "Zwołano szczyt pokojowy",
    body: "Światowi przywódcy zbierają się w Genewie. Świat wstrzymuje oddech.",
    weight: 6,
    choices: [
      {
        label: "Stań na czele szczytu",
        description: "-15 Napięcie, -10 Ryzyko, +10 Dyplomacja",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension - 15);
          s.nuclearRisk = clamp(s.nuclearRisk - 10);
          s.player.diplomacy = clamp(s.player.diplomacy + 10);
        },
      },
      {
        label: "Bojkotuj",
        description: "+5 Napięcie, -5 Dyplomacja",
        apply: (s) => {
          s.globalTension = clamp(s.globalTension + 5);
          s.player.diplomacy = clamp(s.player.diplomacy - 5);
        },
      },
    ],
  },
  {
    id: "economic_boom",
    title: "Globalny boom gospodarczy",
    body: "Wydajność napędzana przez SI gwałtownie rośnie. Rynki biją historyczne rekordy.",
    weight: 6,
    choices: [
      {
        label: "Zarób na tym",
        description: "+300 Skarbiec, +5 Stabilność",
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
    title: "Państwo zbójeckie zdobywa głowicę",
    body: "Wywiad potwierdza, że niezrzeszone państwo ukradło taktyczny ładunek jądrowy.",
    weight: 7,
    choices: [
      {
        label: "Wspólna grupa uderzeniowa",
        description: "-7 Ryzyko, -120 Skarbiec",
        apply: (s) => {
          s.nuclearRisk = clamp(s.nuclearRisk - 7);
          s.player.treasury -= 120;
        },
      },
      {
        label: "Nie rób nic",
        description: "+12 Ryzyko",
        apply: (s) => {
          s.nuclearRisk = clamp(s.nuclearRisk + 12);
        },
      },
    ],
  },
  {
    id: "fusion_breakthrough",
    title: "Przełom w fuzji jądrowej",
    body: "Twoi naukowcy osiągają stabilną, dodatnią energetycznie reakcję fuzji.",
    weight: 5,
    choices: [
      {
        label: "Uprzemysłowij",
        description: "+10 Gospodarka, +200 Skarbiec",
        apply: (s) => {
          s.player.economy = clamp(s.player.economy + 10);
          s.player.treasury += 200;
        },
      },
      {
        label: "Podziel się z sojusznikami",
        description: "+12 Dyplomacja, -8 Napięcie",
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