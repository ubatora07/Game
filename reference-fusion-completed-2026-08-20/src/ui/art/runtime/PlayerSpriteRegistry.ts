import { SPRITE_DIMENSIONS } from '../../../content/artPipeline';
import type { CharacterClassId } from '../../../content/classes';
import type { PlayerSpriteDefinition, PlayerSilhouette } from './ArtAssetTypes';
import { reportMissingArtAsset } from './ArtAssetDiagnostics';

function player(classId: CharacterClassId, silhouette: PlayerSilhouette, bodyColor: string, accentColor: string): PlayerSpriteDefinition {
  const dimensions = SPRITE_DIMENSIONS.protagonist;
  return {
    classId,
    sourceKind: 'procedural',
    silhouette,
    bodyColor,
    accentColor,
    presentation: {
      role: 'protagonist',
      width: dimensions.width,
      height: dimensions.height,
      renderScale: dimensions.renderScale,
      groundOffsetPx: 0,
      shadowScale: 1,
    },
  };
}

export const PLAYER_SPRITE_REGISTRY: Record<CharacterClassId, PlayerSpriteDefinition> = {
  mage: player('mage', 'mage', '#312e81', '#a78bfa'),
  swordsman: player('swordsman', 'swordsman', '#334155', '#d97706'),
  archer: player('archer', 'archer', '#14532d', '#4ade80'),
  assassin: player('assassin', 'assassin', '#18181b', '#f43f5e'),
};

export function resolvePlayerSprite(classId: CharacterClassId | null | undefined): PlayerSpriteDefinition {
  const normalized = classId || 'swordsman';
  const resolved = PLAYER_SPRITE_REGISTRY[normalized];
  if (resolved) return resolved;
  reportMissingArtAsset('player-class', String(classId), 'swordsman');
  return PLAYER_SPRITE_REGISTRY.swordsman;
}
