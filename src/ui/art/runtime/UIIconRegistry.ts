import type { UIIconDefinition } from './ArtAssetTypes';
import { reportMissingArtAsset } from './ArtAssetDiagnostics';

function icon(iconId: string, path: string): UIIconDefinition {
  return {
    iconId,
    sourceKind: 'procedural',
    viewBox: '0 0 24 24',
    fallbackSvg: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter"><path d="${path}"/></svg>`,
  };
}

export const UI_ICON_REGISTRY: Record<string, UIIconDefinition> = {
  nav_hero: icon('nav_hero', 'M12 3l4 3v5c0 4-1.7 7-4 10-2.3-3-4-6-4-10V6l4-3z M9 10h6'),
  nav_team: icon('nav_team', 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20v-2c0-2 2-4 5-4s5 2 5 4v2 M13 15c1-.7 2-1 3-1 3 0 5 2 5 4v2'),
  nav_battle: icon('nav_battle', 'M5 4l14 16 M19 4L5 20 M4 7l3-3 M17 20l3-3'),
  nav_settlement: icon('nav_settlement', 'M3 21h18 M5 21V10l7-6 7 6v11 M9 21v-6h6v6'),
  nav_world: icon('nav_world', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9z'),
  nav_more: icon('nav_more', 'M5 12h.01 M12 12h.01 M19 12h.01'),
};

const FALLBACK_ICON = icon('unknown', 'M4 4h16v16H4z M8 8l8 8 M16 8l-8 8');

export function resolveUIIcon(iconId: string): UIIconDefinition {
  const resolved = UI_ICON_REGISTRY[iconId];
  if (resolved) return resolved;
  reportMissingArtAsset('ui-icon', iconId, FALLBACK_ICON.iconId);
  return FALLBACK_ICON;
}
