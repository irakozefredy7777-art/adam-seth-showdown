export interface Arena {
  name: string;
  subtitle: string;
  sky: string;
  ground: string;
  fog: string;
  accent: string;
  sethPower: number; // damage per hit
  sethHp: number;
  adamDamage: number; // adam dmg per hit at this level
  adamHp: number;
  swordColor: string;
  swordScale: number;
}

export const ARENAS: Arena[] = [
  {
    name: "Forest of Whispers",
    subtitle: "Stage 1 — Where it begins",
    sky: "#3a5a40", ground: "#2d3a25", fog: "#5a7a52", accent: "#a3b18a",
    sethPower: 12, sethHp: 100, adamDamage: 15, adamHp: 100,
    swordColor: "#cccccc", swordScale: 1,
  },
  {
    name: "Desert of Ash",
    subtitle: "Stage 2 — The sun burns hotter",
    sky: "#d4a574", ground: "#8b6f47", fog: "#e0b88a", accent: "#c97b3a",
    sethPower: 16, sethHp: 130, adamDamage: 20, adamHp: 120,
    swordColor: "#e8c07a", swordScale: 1.1,
  },
  {
    name: "Frozen Peaks",
    subtitle: "Stage 3 — Cold steel, colder heart",
    sky: "#a8c8e0", ground: "#d4e0e8", fog: "#c0d8e8", accent: "#5a8aa8",
    sethPower: 22, sethHp: 170, adamDamage: 26, adamHp: 140,
    swordColor: "#9ad4e8", swordScale: 1.2,
  },
  {
    name: "Volcanic Forge",
    subtitle: "Stage 4 — Forged in fire",
    sky: "#5a1a1a", ground: "#2a0a0a", fog: "#8a2a1a", accent: "#ff5a2a",
    sethPower: 30, sethHp: 220, adamDamage: 34, adamHp: 160,
    swordColor: "#ff7a3a", swordScale: 1.3,
  },
  {
    name: "Shadow Citadel",
    subtitle: "Stage 5 — The final reckoning",
    sky: "#1a0a2a", ground: "#0a0515", fog: "#2a1545", accent: "#a070ff",
    sethPower: 40, sethHp: 300, adamDamage: 45, adamHp: 180,
    swordColor: "#c89aff", swordScale: 1.5,
  },
];
