import { SPRITE_DIMENSIONS } from '../../../content/artPipeline';
import type { EnemySpriteDefinition, SpritePresentationMetadata, SpriteRole, SpriteSilhouette } from './ArtAssetTypes';
import { reportMissingArtAsset } from './ArtAssetDiagnostics';

function presentation(role: SpriteRole, bossAura?: string): SpritePresentationMetadata {
  const key = role === 'boss' ? 'boss' : role === 'elite' ? 'elite' : 'minion';
  const dimensions = SPRITE_DIMENSIONS[key];
  return {
    role,
    width: dimensions.width,
    height: dimensions.height,
    renderScale: dimensions.renderScale,
    groundOffsetPx: role === 'boss' ? -4 : 0,
    shadowScale: role === 'boss' ? 1.45 : role === 'elite' ? 1.2 : 1,
    bossAura,
  };
}

function enemy(
  spriteId: string,
  silhouette: SpriteSilhouette,
  bodyColor: string,
  accentColor: string,
  eyeColor: string = '#f8fafc',
  role: SpriteRole = 'minion',
  bossAura?: string,
): EnemySpriteDefinition {
  return {
    spriteId,
    sourceKind: 'procedural',
    silhouette,
    bodyColor,
    accentColor,
    eyeColor,
    presentation: presentation(role, bossAura),
  };
}

export const ENEMY_SPRITE_REGISTRY: Record<string, EnemySpriteDefinition> = {
  enemy_goblin: enemy('enemy_goblin', 'humanoid', '#4d7c0f', '#a3e635'),
  enemy_wolf: enemy('enemy_wolf', 'wolf', '#475569', '#94a3b8'),
  enemy_treant: enemy('enemy_treant', 'tree', '#5b3a1e', '#65a30d'),
  enemy_sprite: enemy('enemy_sprite', 'spirit', '#0f766e', '#5eead4'),
  enemy_alpha_wolf: enemy('enemy_alpha_wolf', 'wolf', '#334155', '#f59e0b', '#fef08a', 'elite'),

  enemy_ninja: enemy('enemy_ninja', 'humanoid', '#312e81', '#f472b6'),
  enemy_ronin: enemy('enemy_ronin', 'humanoid', '#7f1d1d', '#fca5a5'),
  enemy_stone_lion: enemy('enemy_stone_lion', 'beast', '#57534e', '#d6d3d1'),
  enemy_kitsune: enemy('enemy_kitsune', 'wolf', '#f9a8d4', '#fef3c7'),
  enemy_corrupted_samurai: enemy('enemy_corrupted_samurai', 'humanoid', '#3f3f46', '#ef4444', '#fecaca', 'elite'),

  enemy_imp: enemy('enemy_imp', 'demon', '#991b1b', '#fb923c'),
  enemy_magma_hound: enemy('enemy_magma_hound', 'beast', '#7f1d1d', '#f97316'),
  enemy_obsidian_golem: enemy('enemy_obsidian_golem', 'golem', '#292524', '#ef4444'),
  enemy_pyromancer: enemy('enemy_pyromancer', 'humanoid', '#7c2d12', '#fbbf24'),
  enemy_executioner: enemy('enemy_executioner', 'demon', '#450a0a', '#f87171', '#fde68a', 'elite'),

  enemy_frost_wolf: enemy('enemy_frost_wolf', 'wolf', '#164e63', '#7dd3fc'),
  enemy_ice_archer: enemy('enemy_ice_archer', 'humanoid', '#075985', '#bae6fd'),
  enemy_ice_titan: enemy('enemy_ice_titan', 'golem', '#155e75', '#a5f3fc'),
  enemy_specter: enemy('enemy_specter', 'spirit', '#3730a3', '#c4b5fd'),
  enemy_frost_wyrm: enemy('enemy_frost_wyrm', 'dragon', '#0e7490', '#cffafe', '#ffffff', 'elite'),

  enemy_void_crawler: enemy('enemy_void_crawler', 'void', '#3b0764', '#c084fc'),
  enemy_dimensional_weaver: enemy('enemy_dimensional_weaver', 'spirit', '#581c87', '#e879f9'),
  enemy_astral_colossus: enemy('enemy_astral_colossus', 'golem', '#312e81', '#a78bfa'),
  enemy_void_prophet: enemy('enemy_void_prophet', 'humanoid', '#4c1d95', '#d8b4fe'),
  enemy_void_harbinger: enemy('enemy_void_harbinger', 'void', '#2e1065', '#f0abfc', '#ffffff', 'elite'),

  boss_treant: enemy('boss_treant', 'tree', '#3f2a18', '#84cc16', '#fef08a', 'boss', '#84cc16'),
  boss_forest_demon: enemy('boss_forest_demon', 'demon', '#365314', '#f59e0b', '#fde68a', 'boss', '#65a30d'),
  boss_shadow_ninja: enemy('boss_shadow_ninja', 'humanoid', '#1e1b4b', '#f472b6', '#fdf2f8', 'boss', '#c026d3'),
  boss_ghost_shogun: enemy('boss_ghost_shogun', 'spirit', '#4c1d95', '#f9a8d4', '#ffffff', 'boss', '#e879f9'),
  boss_magma_core: enemy('boss_magma_core', 'golem', '#450a0a', '#fb923c', '#fef08a', 'boss', '#ef4444'),
  boss_infernal_lord: enemy('boss_infernal_lord', 'demon', '#7f1d1d', '#fbbf24', '#fff7ed', 'boss', '#f97316'),
  boss_frost_queen: enemy('boss_frost_queen', 'humanoid', '#164e63', '#a5f3fc', '#ffffff', 'boss', '#38bdf8'),
  boss_frost_dragon: enemy('boss_frost_dragon', 'dragon', '#0e7490', '#e0f2fe', '#ffffff', 'boss', '#67e8f9'),
  boss_void_eater: enemy('boss_void_eater', 'void', '#2e1065', '#c084fc', '#ffffff', 'boss', '#8b5cf6'),
  boss_void_god: enemy('boss_void_god', 'void', '#1e0638', '#f0abfc', '#ffffff', 'boss', '#d946ef'),
};

const FALLBACK_ENEMY = enemy('enemy_unknown', 'humanoid', '#3f3f46', '#d97706', '#f8fafc');

export function resolveEnemySprite(spriteId: string): EnemySpriteDefinition {
  const resolved = ENEMY_SPRITE_REGISTRY[spriteId];
  if (resolved) return resolved;
  reportMissingArtAsset('enemy', spriteId, FALLBACK_ENEMY.spriteId);
  return { ...FALLBACK_ENEMY, spriteId };
}
