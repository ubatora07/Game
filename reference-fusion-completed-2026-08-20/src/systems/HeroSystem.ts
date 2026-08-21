import { store } from '../core/GameState';
import { HEROES, HERO_RARITY_CONFIG, HeroDefinition, HeroRarity, getHeroById, getStarUpgradeCost } from '../content/heroes';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { isProgressionUnlockedForRankId } from '../content/progressionUnlocks';

export interface SummonResult {
  hero: HeroDefinition;
  isNew: boolean;
  essenceGranted?: number;
}

export class HeroSystem {
  public static isRecruitmentUnlocked(): boolean {
    return isProgressionUnlockedForRankId('hero_roster', store.get().rankId);
  }

  public static summon(count: 1 | 10, isFree: boolean = false): SummonResult[] | null {
    const cost = count === 1 ? 100 : 900;
    const state = store.get();

    if (!this.isRecruitmentUnlocked()) {
      return null;
    }

    if (!isFree && state.crystals < cost) {
      return null;
    }

    // Deduct crystals
    store.set((draft) => {
      if (!isFree) {
        draft.crystals -= cost;
      }
      draft.stats.totalSummons += count;
    });

    const results: SummonResult[] = [];

    for (let i = 0; i < count; i++) {
      const rolledRarity = this.rollRarity();
      const pool = HEROES.filter(h => h.rarity === rolledRarity);
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      const isOwned = Boolean(store.get().heroes[chosen.id]);

      if (!isOwned) {
        // Unlock new hero
        store.set((draft) => {
          draft.heroes[chosen.id] = { stars: 1, duplicates: 0 };
        });
        results.push({ hero: chosen, isNew: true });
        events.emit('hero:unlocked', { heroId: chosen.id, rarity: chosen.rarity, isNew: true });
      } else {
        // Duplicate conversion to Essence
        const soulEssenceLvl = store.get().soulSkills['soul_essence'] || 0;
        const essenceBonus = 1.0 + soulEssenceLvl * 0.30;
        const baseEssence = HERO_RARITY_CONFIG[chosen.rarity].duplicateEssence;
        const essenceGain = Math.floor(baseEssence * essenceBonus);

        store.set((draft) => {
          draft.essence += essenceGain;
          if (draft.heroes[chosen.id]) {
            draft.heroes[chosen.id].duplicates += 1;
          }
        });
        results.push({ hero: chosen, isNew: false, essenceGranted: essenceGain });
      }
    }

    sound.playSummon();

    return results;
  }

  public static upgradeHeroStars(heroId: string): boolean {
    const state = store.get();
    const heroData = state.heroes[heroId];
    const heroDef = getHeroById(heroId);

    if (!heroData || !heroDef || heroData.stars >= 5) {
      return false;
    }

    const cost = getStarUpgradeCost(heroData.stars, heroDef.rarity);
    if (state.essence < cost) {
      return false;
    }

    store.set((draft) => {
      draft.essence -= cost;
      if (draft.heroes[heroId]) {
        draft.heroes[heroId].stars += 1;
      }
    });

    sound.playUpgrade();

    events.emit('hero:starUp', {
      heroId,
      newStars: heroData.stars + 1
    });

    return true;
  }

  private static rollRarity(): HeroRarity {
    const rand = Math.random() * 100;
    let cumulative = 0;

    const rarities: HeroRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];
    for (const r of rarities) {
      cumulative += HERO_RARITY_CONFIG[r].pullRate;
      if (rand <= cumulative) {
        return r;
      }
    }

    return 'common';
  }

  /**
   * Returns up to `limit` active party support members from unlocked heroes
   */
  public static getActiveParty(limit: number = 3): { hero: HeroDefinition; stars: number; duplicates: number }[] {
    const state = store.get();
    const rarityWeights: Record<HeroRarity, number> = {
      mythic: 5,
      legendary: 4,
      epic: 3,
      rare: 2,
      common: 1
    };

    const owned: { hero: HeroDefinition; stars: number; duplicates: number }[] = [];
    for (const [id, data] of Object.entries(state.heroes)) {
      const def = getHeroById(id);
      if (def && data.stars > 0) {
        owned.push({
          hero: def,
          stars: data.stars,
          duplicates: data.duplicates
        });
      }
    }

    // Sort by rarity rank, then stars
    owned.sort((a, b) => {
      const weightA = rarityWeights[a.hero.rarity] || 0;
      const weightB = rarityWeights[b.hero.rarity] || 0;
      if (weightB !== weightA) return weightB - weightA;
      return b.stars - a.stars;
    });

    return owned.slice(0, limit);
  }

  /**
   * Calculates party synergy metrics
   */
  public static getPartySynergy(): {
    partyCount: number;
    synergyMultiplier: number;
    synergyPctText: string;
  } {
    const party = this.getActiveParty(3);
    const count = party.length;
    const synergyMultiplier = 1.0 + count * 0.05;
    return {
      partyCount: count,
      synergyMultiplier,
      synergyPctText: `+${Math.round(count * 5)}%`
    };
  }
}
