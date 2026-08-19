import type { CharacterClassId } from '../../../content/classes';
import type { PetEvolutionStage, PetId } from '../../../core/pets/PetTypes';

export type ArtSourceKind = 'atlas' | 'image' | 'procedural';
export type SpriteRole = 'protagonist' | 'minion' | 'elite' | 'boss' | 'pet' | 'ui';
export type SpriteSilhouette =
  | 'humanoid'
  | 'wolf'
  | 'tree'
  | 'spirit'
  | 'golem'
  | 'demon'
  | 'dragon'
  | 'beast'
  | 'void';

export type PlayerSilhouette = 'swordsman' | 'mage' | 'archer' | 'assassin';
export type PetSilhouette = 'dragon' | 'wolf' | 'sprite' | 'golem';
export type WorldFallbackPattern = 'forest' | 'sakura' | 'abyss' | 'frozen' | 'void' | 'unknown';

export interface AnimationFrameMetadata {
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  row: number;
}

export interface SpriteAtlasMetadata {
  atlasId: string;
  src?: string;
  pixelScale: number;
  animations: Record<string, AnimationFrameMetadata>;
}

export interface SpritePresentationMetadata {
  role: SpriteRole;
  width: number;
  height: number;
  renderScale: number;
  groundOffsetPx: number;
  shadowScale: number;
  bossAura?: string;
}

export interface EnemySpriteDefinition {
  spriteId: string;
  sourceKind: ArtSourceKind;
  atlas?: SpriteAtlasMetadata;
  silhouette: SpriteSilhouette;
  bodyColor: string;
  accentColor: string;
  eyeColor: string;
  presentation: SpritePresentationMetadata;
}

export interface PlayerSpriteDefinition {
  classId: CharacterClassId;
  sourceKind: ArtSourceKind;
  atlas?: SpriteAtlasMetadata;
  silhouette: PlayerSilhouette;
  bodyColor: string;
  accentColor: string;
  presentation: SpritePresentationMetadata;
}

export interface PetSpriteDefinition {
  petId: PetId;
  sourceKind: ArtSourceKind;
  atlas?: SpriteAtlasMetadata;
  silhouette: PetSilhouette;
  bodyColor: string;
  accentColor: string;
  presentation: SpritePresentationMetadata;
  supportedEvolutionStages: PetEvolutionStage[];
}

export interface WorldParallaxLayerDefinition {
  id: 'sky' | 'far' | 'mid' | 'foreground';
  assetId: string;
  src?: string;
  speed: number;
  repeatX: true;
  seamlessX: true;
  pixelScale: number;
  zIndex: number;
  opacity: number;
  pattern: WorldFallbackPattern;
  primaryColor: string;
  secondaryColor: string;
}

export interface WorldArtDefinition {
  bgAsset: string;
  sourceKind: ArtSourceKind;
  fallbackPattern: WorldFallbackPattern;
  ambienceTheme: string;
  accentColor: string;
  layers: [
    WorldParallaxLayerDefinition,
    WorldParallaxLayerDefinition,
    WorldParallaxLayerDefinition,
    WorldParallaxLayerDefinition,
  ];
}

export interface UIIconDefinition {
  iconId: string;
  sourceKind: ArtSourceKind;
  src?: string;
  viewBox: string;
  fallbackSvg: string;
}
