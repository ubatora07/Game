import { describe, expect, it } from 'vitest';
import { CAMPAIGN_WORLDS } from '../src/content/campaignWorlds';
import { CAMPAIGN_ENEMIES } from '../src/content/campaignEnemies';
import { CAMPAIGN_BOSSES } from '../src/content/campaignBosses';
import { getAllClasses } from '../src/content/classes';
import { PETS_CATALOG } from '../src/content/petsCatalog';
import { resolveWorldArt } from '../src/ui/art/runtime/WorldArtRegistry';
import { resolveEnemySprite } from '../src/ui/art/runtime/EnemySpriteRegistry';
import { resolvePlayerSprite } from '../src/ui/art/runtime/PlayerSpriteRegistry';
import { resolvePetSprite } from '../src/ui/art/runtime/PetSpriteRegistry';
import { resolveUIIcon } from '../src/ui/art/runtime/UIIconRegistry';
import { ArtRuntimeRenderer } from '../src/ui/art/runtime/ArtRuntimeRenderer';

const flattenEnemies = () => Object.values(CAMPAIGN_ENEMIES).flatMap((entries) => entries);
const flattenBosses = () => Object.values(CAMPAIGN_BOSSES);

describe('Phase 8 — runtime art registry contracts', () => {
  it('resolves every campaign world into four horizontally seamless parallax layers', () => {
    for (const world of CAMPAIGN_WORLDS) {
      const art = resolveWorldArt(world.bgAsset);
      expect(art.bgAsset).toBe(world.bgAsset);
      expect(art.layers).toHaveLength(4);
      expect(art.layers.map((layer) => layer.id)).toEqual(['sky', 'far', 'mid', 'foreground']);
      expect(art.layers.every((layer) => layer.repeatX && layer.seamlessX)).toBe(true);
      expect(art.layers.map((layer) => layer.speed)).toEqual([...art.layers.map((layer) => layer.speed)].sort((a, b) => a - b));
    }
  });

  it('resolves every enemy and boss spriteId without collapsing to one goblin definition', () => {
    const all = [...flattenEnemies(), ...flattenBosses()];
    for (const entity of all) {
      const art = resolveEnemySprite(entity.spriteId);
      expect(art.spriteId).toBe(entity.spriteId);
      expect(art.presentation.role).toBeTruthy();
    }
    expect(new Set(all.map((entity) => resolveEnemySprite(entity.spriteId).silhouette)).size).toBeGreaterThan(4);
  });

  it('resolves all four protagonist classes', () => {
    for (const classDef of getAllClasses()) {
      expect(resolvePlayerSprite(classDef.id).classId).toBe(classDef.id);
    }
  });

  it('resolves each pet independently across all three evolution stages', () => {
    for (const petDef of Object.values(PETS_CATALOG)) {
      const art = resolvePetSprite(petDef.id);
      expect(art.petId).toBe(petDef.id);
      expect(art.supportedEvolutionStages).toEqual([1, 2, 3]);
      for (const stage of [1, 2, 3] as const) {
        expect(ArtRuntimeRenderer.renderPet(petDef.id, stage)).toContain('<svg');
      }
    }
  });

  it('has non-emoji primary-domain UI icon fallbacks', () => {
    for (const iconId of ['nav_hero', 'nav_team', 'nav_battle', 'nav_settlement', 'nav_world', 'nav_more']) {
      expect(resolveUIIcon(iconId).fallbackSvg).toContain('<svg');
    }
  });

  it('returns safe fallbacks for unknown art IDs', () => {
    expect(resolveWorldArt('missing_world').bgAsset).toBe('bg_unknown');
    expect(resolveEnemySprite('missing_enemy').sourceKind).toBe('procedural');
    expect(resolvePetSprite('missing_pet').sourceKind).toBe('procedural');
  });
});
