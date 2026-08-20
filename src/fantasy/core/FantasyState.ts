import { events } from './EventBus';

export type GearSlot = 'weapon' | 'armor' | 'ring';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: ItemRarity;
  level: number;
  icon: string;
  stats: {
    damagePct?: number;
    critChance?: number;
    attackSpeedPct?: number;
    clickDamagePct?: number;
    goldFindPct?: number;
    bossDamagePct?: number;
  };
  value: number;
}

export interface FantasyGameState {
  version: 1;
  hero: {
    name: string;
    level: number;
    xp: number;
    xpToNext: number;
    power: number;
  };
  currencies: {
    gold: number;
    gems: number;
    legacyPoints: number;
    lifetimeGold: number;
    lifetimeKills: number;
    lifetimeBossKills: number;
  };
  world: {
    currentWorldId: number; // 1: Greenvale, 2: Whisperwood, 3: Broken Highlands
    currentStageNumber: number; // 1 to 10
    waveProgress: number; // 0 to 5 enemies killed in current stage
    isBossActive: boolean;
    bossTimeRemaining: number;
    isFarmMode: boolean; // True if repeating stage after boss fail
    highestWorld: number;
    highestStage: number;
    autoAdvance: boolean;
  };
  upgrades: {
    damage: number;
    click_damage: number;
    attack_speed: number;
    crit_chance: number;
    gold_find: number;
  };
  gear: {
    equipped: {
      weapon: GearItem | null;
      armor: GearItem | null;
      ring: GearItem | null;
    };
    inventory: GearItem[];
  };
  legacy: {
    legacyCount: number;
    upgrades: {
      veteran: number; // +10% All Damage / lvl
      treasure_hunter: number; // +10% Gold / lvl
      swift_strikes: number; // +3% Attack Speed / lvl
      idle_mastery: number; // +10% Offline Efficiency / lvl
    };
  };
  settings: {
    sound: boolean;
    music: boolean;
    damageNumbers: boolean;
    screenShake: boolean;
  };
  lastSaveTime: number;
  lastActiveTime: number;
}

export function createInitialFantasyState(): FantasyGameState {
  return {
    version: 1,
    hero: {
      name: 'Valiant Knight',
      level: 1,
      xp: 0,
      xpToNext: 20,
      power: 10,
    },
    currencies: {
      gold: 0,
      gems: 0,
      legacyPoints: 0,
      lifetimeGold: 0,
      lifetimeKills: 0,
      lifetimeBossKills: 0,
    },
    world: {
      currentWorldId: 1,
      currentStageNumber: 1,
      waveProgress: 0,
      isBossActive: false,
      bossTimeRemaining: 0,
      isFarmMode: false,
      highestWorld: 1,
      highestStage: 1,
      autoAdvance: true,
    },
    upgrades: {
      damage: 1,
      click_damage: 1,
      attack_speed: 1,
      crit_chance: 0,
      gold_find: 0,
    },
    gear: {
      equipped: {
        weapon: null,
        armor: null,
        ring: null,
      },
      inventory: [],
    },
    legacy: {
      legacyCount: 0,
      upgrades: {
        veteran: 0,
        treasure_hunter: 0,
        swift_strikes: 0,
        idle_mastery: 0,
      },
    },
    settings: {
      sound: true,
      music: true,
      damageNumbers: true,
      screenShake: true,
    },
    lastSaveTime: Date.now(),
    lastActiveTime: Date.now(),
  };
}

class FantasyStateStore {
  private state: FantasyGameState = createInitialFantasyState();

  public get(): Readonly<FantasyGameState> {
    return this.state;
  }

  public set(mutator: (draft: FantasyGameState) => void): void {
    mutator(this.state);
    events.emit('state:changed', this.state);
  }

  public replace(newState: FantasyGameState): void {
    this.state = newState;
    events.emit('state:changed', this.state);
  }

  public reset(): void {
    this.state = createInitialFantasyState();
    events.emit('state:changed', this.state);
  }
}

export const store = new FantasyStateStore();
