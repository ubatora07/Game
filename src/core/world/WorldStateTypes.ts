export type WorldFlagId =
  | 'village_saved'
  | 'village_ruined'
  | 'refugees_accepted'
  | 'refugees_turned_away'
  | 'smuggler_alliance'
  | 'smuggler_syndicate_crushed'
  | 'kingdom_trusted'
  | 'dark_reputation'
  | 'sovereign_citadel_erected';

export interface WorldFlagDefinition {
  id: WorldFlagId;
  nameKey: string;
  defaultName: string;
  description: string;
  source: string;
  persistsThroughSamsara: boolean; // false = current life only, true = permanent legacy chronicle
  visualConsequence: {
    ambientBannerKey?: string;
    npcReactionKey?: string;
    townOverlayClass?: string;
    ambientPropSvg?: string;
  };
}

export interface WorldSaveState {
  currentLifeFlags: Record<string, boolean>;
  legacyWorldChronicle: Record<string, boolean>;
}
