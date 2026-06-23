export type Biome = "city" | "industrial" | "highway" | "forest" | "burned-forest" | "plaza";

export interface Arena {
  name: string;
  subtitle: string;
  sky: string;
  ground: string;
  fog: string;
  accent: string;
  enemyCount: number;
  enemyHp: number;
  enemySpeed: number;
  enemyDamage: number;
  playerHp: number;
  gunDamage: number;
  gunName: string;
  fireRate: number; // ms between shots
  carCount: number;
  biome: Biome;
  medkitCount: number;
}

export const ARENAS: Arena[] = [
  {
    name: "Downtown Streets",
    subtitle: "Stage 1 — The outbreak begins",
    sky: "#7a8a95", ground: "#3a3a3a", fog: "#8a9aa5", accent: "#ffcc55",
    enemyCount: 6, enemyHp: 40, enemySpeed: 1.2, enemyDamage: 8,
    playerHp: 240, gunDamage: 20, gunName: "Pistol", fireRate: 350, carCount: 4,
    biome: "city", medkitCount: 2,
  },
  {
    name: "Riverside Forest",
    subtitle: "Stage 2 — Into the trees",
    sky: "#7ea27a", ground: "#2a3a1f", fog: "#a8c098", accent: "#b8e060",
    enemyCount: 9, enemyHp: 55, enemySpeed: 1.5, enemyDamage: 10,
    playerHp: 280, gunDamage: 26, gunName: "SMG", fireRate: 180, carCount: 2,
    biome: "forest", medkitCount: 3,
  },
  {
    name: "Highway Overpass",
    subtitle: "Stage 3 — Nowhere to hide",
    sky: "#5a6a7a", ground: "#2a2e34", fog: "#6a7585", accent: "#5acdff",
    enemyCount: 12, enemyHp: 70, enemySpeed: 1.7, enemyDamage: 12,
    playerHp: 320, gunDamage: 32, gunName: "Rifle", fireRate: 220, carCount: 7,
    biome: "highway", medkitCount: 2,
  },
  {
    name: "Burning Woods",
    subtitle: "Stage 4 — Ash and embers",
    sky: "#5a1a1a", ground: "#2a1a10", fog: "#8a3a1a", accent: "#ff5a2a",
    enemyCount: 15, enemyHp: 90, enemySpeed: 1.9, enemyDamage: 15,
    playerHp: 360, gunDamage: 40, gunName: "Shotgun", fireRate: 500, carCount: 5,
    biome: "burned-forest", medkitCount: 3,
  },
  {
    name: "Final Stand Plaza",
    subtitle: "Stage 5 — The last stand",
    sky: "#1a0a2a", ground: "#0f0a18", fog: "#2a1545", accent: "#a070ff",
    enemyCount: 20, enemyHp: 110, enemySpeed: 2.1, enemyDamage: 18,
    playerHp: 420, gunDamage: 50, gunName: "Heavy MG", fireRate: 120, carCount: 9,
    biome: "plaza", medkitCount: 3,
  },
];

// Static blockers (axis-aligned boxes) — shared with collision logic.
export interface Blocker { x: number; z: number; halfX: number; halfZ: number }

function cityBlockers(): Blocker[] {
  const out: Blocker[] = [];
  for (const x of [-22, 22]) for (const z of [-18, -6, 6, 18]) out.push({ x, z, halfX: 3, halfZ: 3 });
  return out;
}

function forestBlockers(seed = 1): Blocker[] {
  // pseudo-random but stable tree trunks scattered around the arena
  const out: Blocker[] = [];
  let s = seed * 9301 + 49297;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 38; i++) {
    const a = rand() * Math.PI * 2;
    const r = 7 + rand() * 18;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    // keep spawn area clear
    if (Math.hypot(x, z - 4) < 4) continue;
    out.push({ x, z, halfX: 0.55, halfZ: 0.55 });
  }
  return out;
}

function highwayBlockers(): Blocker[] {
  // concrete barriers along the road
  const out: Blocker[] = [];
  for (const z of [-22, -10, 10, 22]) for (const x of [-18, -6, 6, 18]) out.push({ x, z, halfX: 2, halfZ: 0.6 });
  return out;
}

function plazaBlockers(): Blocker[] {
  const out: Blocker[] = [];
  for (const x of [-20, 0, 20]) for (const z of [-20, 0, 20]) {
    if (x === 0 && z === 0) continue;
    out.push({ x, z, halfX: 2, halfZ: 2 });
  }
  return out;
}

export function blockersFor(biome: Biome): Blocker[] {
  switch (biome) {
    case "forest": return forestBlockers(7);
    case "burned-forest": return forestBlockers(13);
    case "highway": return highwayBlockers();
    case "plaza": return plazaBlockers();
    case "industrial":
    case "city":
    default: return cityBlockers();
  }
}

// Back-compat (Game.tsx still imports BUILDINGS)
export const BUILDINGS: Blocker[] = cityBlockers();
