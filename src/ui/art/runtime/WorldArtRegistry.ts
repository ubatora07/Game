import type { WorldArtDefinition, WorldFallbackPattern, WorldParallaxLayerDefinition } from './ArtAssetTypes';
import { reportMissingArtAsset } from './ArtAssetDiagnostics';

function createLayer(
  worldId: string,
  id: WorldParallaxLayerDefinition['id'],
  speed: number,
  zIndex: number,
  opacity: number,
  pattern: WorldFallbackPattern,
  primaryColor: string,
  secondaryColor: string,
): WorldParallaxLayerDefinition {
  return {
    id,
    assetId: `${worldId}_${id}`,
    speed,
    repeatX: true,
    seamlessX: true,
    pixelScale: 1,
    zIndex,
    opacity,
    pattern,
    primaryColor,
    secondaryColor,
  };
}

function createLayers(
  worldId: string,
  pattern: WorldFallbackPattern,
  colors: [string, string, string, string, string],
): WorldArtDefinition['layers'] {
  return [
    createLayer(worldId, 'sky', 0.05, 0, 1, pattern, colors[0], colors[1]),
    createLayer(worldId, 'far', 0.14, 1, 0.92, pattern, colors[1], colors[2]),
    createLayer(worldId, 'mid', 0.32, 2, 0.96, pattern, colors[2], colors[3]),
    createLayer(worldId, 'foreground', 0.68, 3, 1, pattern, colors[3], colors[4]),
  ];
}

export const WORLD_ART_REGISTRY: Record<string, WorldArtDefinition> = {
  bg_forest: {
    bgAsset: 'bg_forest',
    sourceKind: 'procedural',
    fallbackPattern: 'forest',
    ambienceTheme: 'world_1',
    accentColor: '#4ade80',
    layers: createLayers('bg_forest', 'forest', ['#07120e', '#123522', '#1f5b32', '#173f25', '#08180f']),
  },
  bg_sakura: {
    bgAsset: 'bg_sakura',
    sourceKind: 'procedural',
    fallbackPattern: 'sakura',
    ambienceTheme: 'world_2',
    accentColor: '#f472b6',
    layers: createLayers('bg_sakura', 'sakura', ['#160d1d', '#43213d', '#7a3157', '#3c2237', '#140c16']),
  },
  bg_abyss: {
    bgAsset: 'bg_abyss',
    sourceKind: 'procedural',
    fallbackPattern: 'abyss',
    ambienceTheme: 'world_3',
    accentColor: '#f87171',
    layers: createLayers('bg_abyss', 'abyss', ['#120707', '#3d1111', '#781c16', '#42100d', '#100504']),
  },
  bg_frozen: {
    bgAsset: 'bg_frozen',
    sourceKind: 'procedural',
    fallbackPattern: 'frozen',
    ambienceTheme: 'world_4',
    accentColor: '#38bdf8',
    layers: createLayers('bg_frozen', 'frozen', ['#07131d', '#123148', '#1d5a79', '#15384a', '#07131a']),
  },
  bg_void: {
    bgAsset: 'bg_void',
    sourceKind: 'procedural',
    fallbackPattern: 'void',
    ambienceTheme: 'world_5',
    accentColor: '#c084fc',
    layers: createLayers('bg_void', 'void', ['#080611', '#21113b', '#51206f', '#28143a', '#08060d']),
  },
};

const FALLBACK_WORLD: WorldArtDefinition = {
  bgAsset: 'bg_unknown',
  sourceKind: 'procedural',
  fallbackPattern: 'unknown',
  ambienceTheme: 'world_1',
  accentColor: '#d97706',
  layers: createLayers('bg_unknown', 'unknown', ['#09090b', '#18181b', '#27272a', '#18181b', '#09090b']),
};

export function resolveWorldArt(bgAsset: string): WorldArtDefinition {
  const resolved = WORLD_ART_REGISTRY[bgAsset];
  if (resolved) return resolved;
  reportMissingArtAsset('world', bgAsset, FALLBACK_WORLD.bgAsset);
  return FALLBACK_WORLD;
}
