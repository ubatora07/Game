import { getProgressionUnlockRankIndex } from '../../content/progressionUnlocks';

export type PrimaryDomainId = 'hero' | 'team' | 'battle' | 'settlement' | 'world' | 'more';

export interface PrimaryDomainDefinition {
  id: PrimaryDomainId;
  iconId: string;
  labelKey: string;
  minRankIndex: number;
}

/**
 * UX Information Architecture V3 primary navigation.
 * Keep this array as the single source of truth for order and labels.
 */
export const PRIMARY_DOMAINS: readonly PrimaryDomainDefinition[] = [
  { id: 'hero', iconId: 'nav_hero', labelKey: 'nav.hero', minRankIndex: 0 },
  { id: 'team', iconId: 'nav_team', labelKey: 'nav.team', minRankIndex: 0 },
  { id: 'battle', iconId: 'nav_battle', labelKey: 'nav.battle', minRankIndex: 0 },
  { id: 'settlement', iconId: 'nav_settlement', labelKey: 'nav.settlement', minRankIndex: getProgressionUnlockRankIndex('settlement') },
  { id: 'world', iconId: 'nav_world', labelKey: 'nav.world', minRankIndex: 0 },
  { id: 'more', iconId: 'nav_more', labelKey: 'nav.more', minRankIndex: 0 },
] as const;

const DEEP_ROUTE_DOMAIN: Readonly<Record<string, PrimaryDomainId>> = {
  // Backward-compatible legacy route: old "home" is the battle surface.
  home: 'battle',

  // Hero domain
  ascension: 'hero',

  // Team domain
  heroes: 'team',
  summon: 'team',

  // World / exploration domain
  tower: 'world',
  expeditions: 'world',
  quests: 'world',

  // Legacy/meta systems intentionally remain under More during V3 rollout.
  sect: 'more',
  souls: 'more',
  relics: 'more',
  dailies: 'more',
};

export function getPrimaryDomainForScreen(screenId: string): PrimaryDomainId | null {
  if (PRIMARY_DOMAINS.some((domain) => domain.id === screenId)) {
    return screenId as PrimaryDomainId;
  }
  return DEEP_ROUTE_DOMAIN[screenId] ?? null;
}
