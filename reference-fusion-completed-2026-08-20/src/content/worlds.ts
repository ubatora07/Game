export interface WorldTheme {
  worldIndex: number;
  minFloor: number;
  maxFloor: number;
  nameKey: string;
  bgGradient: string;
  accentColor: string;
  ambientParticles: 'leaves' | 'petals' | 'embers' | 'snow' | 'void-stars';
  monsterTypes: Array<{
    nameKey: string;
    icon: string;
    descriptionKey: string;
  }>;
  bosses: Array<{
    nameKey: string;
    icon: string;
    descriptionKey: string;
  }>;
}

export const TOWER_WORLDS: readonly WorldTheme[] = [
  {
    worldIndex: 1,
    minFloor: 1,
    maxFloor: 50,
    nameKey: 'world.forest.name',
    bgGradient: 'radial-gradient(ellipse at bottom, #064e3b 0%, #022c22 70%, #030712 100%)',
    accentColor: '#10b981',
    ambientParticles: 'leaves',
    monsterTypes: [
      { nameKey: 'monster.goblin', icon: '👺', descriptionKey: 'monster.goblin.desc' },
      { nameKey: 'monster.shadow_wolf', icon: '🐺', descriptionKey: 'monster.shadow_wolf.desc' },
      { nameKey: 'monster.treant', icon: '🪵', descriptionKey: 'monster.treant.desc' }
    ],
    bosses: [
      { nameKey: 'boss.forest_king', icon: '🧌', descriptionKey: 'boss.forest_king.desc' }
    ]
  },
  {
    worldIndex: 2,
    minFloor: 51,
    maxFloor: 100,
    nameKey: 'world.sakura.name',
    bgGradient: 'radial-gradient(ellipse at bottom, #831843 0%, #4c0519 70%, #030712 100%)',
    accentColor: '#f43f5e',
    ambientParticles: 'leaves',
    monsterTypes: [
      { nameKey: 'monster.ronin', icon: '⚔️', descriptionKey: 'monster.ronin.desc' },
      { nameKey: 'monster.kitsune', icon: '🦊', descriptionKey: 'monster.kitsune.desc' },
      { nameKey: 'monster.monk', icon: '📿', descriptionKey: 'monster.monk.desc' }
    ],
    bosses: [
      { nameKey: 'boss.shogun', icon: '👹', descriptionKey: 'boss.shogun.desc' }
    ]
  },
  {
    worldIndex: 3,
    minFloor: 101,
    maxFloor: 150,
    nameKey: 'world.abyss.name',
    bgGradient: 'radial-gradient(ellipse at bottom, #7f1d1d 0%, #450a0a 70%, #030712 100%)',
    accentColor: '#ef4444',
    ambientParticles: 'embers',
    monsterTypes: [
      { nameKey: 'monster.hellhound', icon: '🐕‍🦺', descriptionKey: 'monster.hellhound.desc' },
      { nameKey: 'monster.fire_demon', icon: '👿', descriptionKey: 'monster.fire_demon.desc' },
      { nameKey: 'monster.lava_golem', icon: '🌋', descriptionKey: 'monster.lava_golem.desc' }
    ],
    bosses: [
      { nameKey: 'boss.dragon', icon: '🐉', descriptionKey: 'boss.dragon.desc' }
    ]
  },
  {
    worldIndex: 4,
    minFloor: 151,
    maxFloor: 200,
    nameKey: 'world.frozen.name',
    bgGradient: 'radial-gradient(ellipse at bottom, #0c4a6e 0%, #082f49 70%, #030712 100%)',
    accentColor: '#38bdf8',
    ambientParticles: 'snow',
    monsterTypes: [
      { nameKey: 'monster.frost_golem', icon: '🧊', descriptionKey: 'monster.frost_golem.desc' },
      { nameKey: 'monster.ice_specter', icon: '👻', descriptionKey: 'monster.ice_specter.desc' },
      { nameKey: 'monster.blizzard_hawk', icon: '🦅', descriptionKey: 'monster.blizzard_hawk.desc' }
    ],
    bosses: [
      { nameKey: 'boss.frost_monarch', icon: '❄️', descriptionKey: 'boss.frost_monarch.desc' }
    ]
  },
  {
    worldIndex: 5,
    minFloor: 201,
    maxFloor: Infinity,
    nameKey: 'world.void.name',
    bgGradient: 'radial-gradient(ellipse at bottom, #4c1d95 0%, #2e1065 70%, #030712 100%)',
    accentColor: '#a855f7',
    ambientParticles: 'void-stars',
    monsterTypes: [
      { nameKey: 'monster.void_phantom', icon: '👤', descriptionKey: 'monster.void_phantom.desc' },
      { nameKey: 'monster.astral_knight', icon: '🛡️', descriptionKey: 'monster.astral_knight.desc' },
      { nameKey: 'monster.chaos_orb', icon: '🔮', descriptionKey: 'monster.chaos_orb.desc' }
    ],
    bosses: [
      { nameKey: 'boss.cosmic_sovereign', icon: '👁️', descriptionKey: 'boss.cosmic_sovereign.desc' }
    ]
  }
];

export function getWorldForFloor(floor: number): WorldTheme {
  return TOWER_WORLDS.find(w => floor >= w.minFloor && floor <= w.maxFloor) || TOWER_WORLDS[TOWER_WORLDS.length - 1];
}

export function isFloorBoss(floor: number): boolean {
  return floor > 0 && floor % 10 === 0;
}

export function calculateEnemyStats(floor: number): {
  maxHp: number;
  power: number;
  isBoss: boolean;
  nameKey: string;
  icon: string;
} {
  const isBoss = isFloorBoss(floor);
  const world = getWorldForFloor(floor);

  // Scaled stats
  const baseHp = 120 * Math.pow(1.105, floor - 1);
  const maxHp = Math.floor(baseHp * (isBoss ? 4.0 : 1.0));
  
  const basePower = 20 * Math.pow(1.095, floor - 1);
  const power = Math.floor(basePower * (isBoss ? 2.5 : 1.0));

  let nameKey: string;
  let icon: string;

  if (isBoss) {
    const boss = world.bosses[Math.floor((floor / 10 - 1)) % world.bosses.length];
    nameKey = boss.nameKey;
    icon = boss.icon;
  } else {
    const monster = world.monsterTypes[(floor - 1) % world.monsterTypes.length];
    nameKey = monster.nameKey;
    icon = monster.icon;
  }

  return { maxHp, power, isBoss, nameKey, icon };
}
