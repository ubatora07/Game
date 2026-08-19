import type { PetSpriteDefinition, PetSilhouette } from './ArtAssetTypes';
import { reportMissingArtAsset } from './ArtAssetDiagnostics';

function pet(petId: string, silhouette: PetSilhouette, bodyColor: string, accentColor: string): PetSpriteDefinition {
  return {
    petId,
    sourceKind: 'procedural',
    silhouette,
    bodyColor,
    accentColor,
    presentation: {
      role: 'pet',
      width: 48,
      height: 48,
      renderScale: 1,
      groundOffsetPx: 0,
      shadowScale: 0.8,
    },
    supportedEvolutionStages: [1, 2, 3],
  };
}

export const PET_SPRITE_REGISTRY: Record<string, PetSpriteDefinition> = {
  pet_ignis_drake: pet('pet_ignis_drake', 'dragon', '#dc2626', '#f59e0b'),
  pet_fenrir_wolf: pet('pet_fenrir_wolf', 'wolf', '#0e7490', '#7dd3fc'),
  pet_sylph_sprite: pet('pet_sylph_sprite', 'sprite', '#047857', '#6ee7b7'),
  pet_aegis_golem: pet('pet_aegis_golem', 'golem', '#78716c', '#facc15'),
};

const FALLBACK_PET = pet('pet_unknown', 'sprite', '#475569', '#d97706');

export function resolvePetSprite(petId: string): PetSpriteDefinition {
  const resolved = PET_SPRITE_REGISTRY[petId];
  if (resolved) return resolved;
  reportMissingArtAsset('pet', petId, FALLBACK_PET.petId);
  return { ...FALLBACK_PET, petId };
}
