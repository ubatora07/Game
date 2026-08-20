import { store } from '../../../core/GameState';
import { BigNumber } from '../../../core/BigNumber';
import { HEROES, HeroDefinition } from '../../../content/heroes';
import { getRankById } from '../../../content/ranks';
import { t } from '../../../services/i18n/I18nService';

export interface HeroDisplay {
  id: string;
  name: string;
  stars: number;
  level: number;
  isUnlocked: boolean;
  powerContribution: number;
}

export class HeroViewModel {
  public static getHeroData() {
    const state = store.get();
    const rank = getRankById(state.rankId);

    const heroesList: HeroDisplay[] = HEROES.map((def: HeroDefinition) => {
      const heroState = state.heroes[def.id];
      const isUnlocked = Boolean(heroState);
      const stars = heroState?.stars || 1;

      return {
        id: def.id,
        name: t(def.nameKey) || def.id,
        stars,
        level: stars * 10,
        isUnlocked,
        powerContribution: isUnlocked ? stars * 500 : 0,
      };
    });

    return {
      rankId: state.rankId,
      rankName: rank ? (t(rank.nameKey) || rank.id) : state.rankId,
      totalPower: state.power,
      formattedPower: BigNumber.format(state.power),
      heroes: heroesList,
      unlockedHeroesCount: heroesList.filter((h) => h.isUnlocked).length,
      totalHeroesCount: heroesList.length,
    };
  }
}
