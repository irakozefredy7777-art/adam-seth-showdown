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
}

export const ARENAS: Arena[] = [
  {
    name: "Downtown Streets",
    subtitle: "Stage 1 — The outbreak begins",
    sky: "#7a8a95", ground: "#3a3a3a", fog: "#8a9aa5", accent: "#ffcc55",
    enemyCount: 6, enemyHp: 40, enemySpeed: 1.2, enemyDamage: 8,
    playerHp: 100, gunDamage: 20, gunName: "Pistol", fireRate: 350, carCount: 4,
  },
  {
    name: "Industrial Yard",
    subtitle: "Stage 2 — More hostiles inbound",
    sky: "#8a7a6a", ground: "#454035", fog: "#a89580", accent: "#ff8a3a",
    enemyCount: 9, enemyHp: 55, enemySpeed: 1.5, enemyDamage: 10,
    playerHp: 110, gunDamage: 26, gunName: "SMG", fireRate: 180, carCount: 5,
  },
  {
    name: "Highway Overpass",
    subtitle: "Stage 3 — Nowhere to hide",
    sky: "#5a6a7a", ground: "#2a2e34", fog: "#6a7585", accent: "#5acdff",
    enemyCount: 12, enemyHp: 70, enemySpeed: 1.7, enemyDamage: 12,
    playerHp: 120, gunDamage: 32, gunName: "Rifle", fireRate: 220, carCount: 7,
  },
  {
    name: "Burning District",
    subtitle: "Stage 4 — The city falls",
    sky: "#5a1a1a", ground: "#2a1410", fog: "#8a2a1a", accent: "#ff5a2a",
    enemyCount: 15, enemyHp: 90, enemySpeed: 1.9, enemyDamage: 15,
    playerHp: 130, gunDamage: 40, gunName: "Shotgun", fireRate: 500, carCount: 8,
  },
  {
    name: "Final Stand Plaza",
    subtitle: "Stage 5 — The last stand",
    sky: "#1a0a2a", ground: "#0f0a18", fog: "#2a1545", accent: "#a070ff",
    enemyCount: 20, enemyHp: 110, enemySpeed: 2.1, enemyDamage: 18,
    playerHp: 150, gunDamage: 50, gunName: "Heavy MG", fireRate: 120, carCount: 9,
  },
];
