import { isProgressionUnlockedForRankId } from '../../content/progressionUnlocks';

/**
 * Progressive disclosure rules for secondary screens.
 * These rules only control discoverability/navigation, never the underlying rewards or save state.
 */
export function shouldShowTower(rankId: string): boolean {
  return isProgressionUnlockedForRankId('tower', rankId);
}

export function shouldShowExpeditions(ownedHeroCount: number): boolean {
  return ownedHeroCount > 0;
}

export function shouldShowRelics(ownedRelicCount: number): boolean {
  return ownedRelicCount > 0;
}

export function shouldShowSoulTree(rankId: string, souls: number): boolean {
  return souls > 0 || isProgressionUnlockedForRankId('rebirth', rankId);
}

export function shouldShowLegacyCodex(reincarnationCount: number, unlockedEndingCount: number): boolean {
  return reincarnationCount > 0 || unlockedEndingCount > 0;
}
