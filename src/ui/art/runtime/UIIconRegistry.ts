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

function rankBadge(iconId: string, label: string): UIIconDefinition {
  return {
    iconId,
    sourceKind: 'procedural',
    viewBox: '0 0 24 24',
    fallbackSvg: `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path d="M12 2 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6z" fill="#17130f" stroke="currentColor" stroke-width="1.6"/><text x="12" y="14.5" text-anchor="middle" fill="currentColor" font-family="monospace" font-size="7" font-weight="700">${label}</text></svg>`,
  };
}

export const UI_ICON_REGISTRY: Record<string, UIIconDefinition> = {
  // Primary navigation
  nav_hero: icon('nav_hero', 'M12 3l4 3v5c0 4-1.7 7-4 10-2.3-3-4-6-4-10V6l4-3z M9 10h6'),
  nav_team: icon('nav_team', 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20v-2c0-2 2-4 5-4s5 2 5 4v2 M13 15c1-.7 2-1 3-1 3 0 5 2 5 4v2'),
  nav_battle: icon('nav_battle', 'M5 4l14 16 M19 4L5 20 M4 7l3-3 M17 20l3-3'),
  nav_settlement: icon('nav_settlement', 'M3 21h18 M5 21V10l7-6 7 6v11 M9 21v-6h6v6'),
  nav_world: icon('nav_world', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9z'),
  nav_more: icon('nav_more', 'M5 12h.01 M12 12h.01 M19 12h.01'),

  // Domain actions / More
  domain_rank: icon('domain_rank', 'M12 3l3 5 5 1-4 4 1 6-5-3-5 3 1-6-4-4 5-1z'),
  domain_class: icon('domain_class', 'M12 3l7 4v5c0 4-2 7-7 9-5-2-7-5-7-9V7z M8 11h8'),
  domain_equipment: icon('domain_equipment', 'M5 4l14 14 M16 3l5 5-4 4-5-5z M4 16l4 4-2 2-4-4z'),
  domain_titles: icon('domain_titles', 'M4 17h16l-2-9-4 4-2-7-2 7-4-4z M6 20h12'),
  domain_partner: icon('domain_partner', 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4 20v-3c0-2 2-4 4-4s4 2 4 4v3 M12 17c.6-2.5 2-4 4-4 2.5 0 4 2 4 4v3'),
  domain_roster: icon('domain_roster', 'M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5'),
  domain_recruit: icon('domain_recruit', 'M12 4v16 M4 12h16 M6 6l12 12 M18 6 6 18'),
  domain_pets: icon('domain_pets', 'M7 10c-2 0-3-2-2-4 M17 10c2 0 3-2 2-4 M8 11c0-2 1-4 4-4s4 2 4 4v3c0 4-2 6-4 6s-4-2-4-6z M10 14h.01 M14 14h.01'),
  domain_mercenaries: icon('domain_mercenaries', 'M5 20V9l7-5 7 5v11 M9 20v-5h6v5 M8 9h8'),
  domain_campaign: icon('domain_campaign', 'M5 4l14 16 M19 4 5 18 M8 8l8 8'),
  domain_tower: icon('domain_tower', 'M7 21h10 M8 21V9h8v12 M10 9V5h4v4 M6 9h12'),
  domain_expeditions: icon('domain_expeditions', 'M4 18l5-12 4 7 3-5 4 10z M3 21h18'),
  domain_quests: icon('domain_quests', 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4'),
  more_sect: icon('more_sect', 'M4 20h16 M6 20V9l6-5 6 5v11 M9 12h6'),
  more_legacy: icon('more_legacy', 'M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z'),
  more_relics: icon('more_relics', 'M12 3l7 7-7 11-7-11z M9 10h6'),
  more_dailies: icon('more_dailies', 'M5 5h14v15H5z M8 3v4 M16 3v4 M8 11h3 M13 11h3 M8 15h3'),
  more_codex: icon('more_codex', 'M4 5c4-2 7-1 8 1v15c-1-2-4-3-8-1z M20 5c-4-2-7-1-8 1v15c1-2 4-3 8-1z'),
  more_stats: icon('more_stats', 'M5 20V12h3v8 M10 20V7h3v13 M15 20V4h3v16 M3 20h18'),
  more_settings: icon('more_settings', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.5 5.5 7 7 M17 17l1.5 1.5 M18.5 5.5 17 7 M7 17l-1.5 1.5'),

  // Legacy economy buildings, rendered as semantic line icons instead of emoji.
  building_dojo: icon('building_dojo', 'M5 19h14 M7 19V9h10v10 M9 9l3-5 3 5 M10 13h4'),
  building_meditation_chamber: icon('building_meditation_chamber', 'M6 18h12 M8 15c1-3 2-5 4-7 2 2 3 4 4 7 M7 15h10 M12 4v3'),
  building_spirit_shrine: icon('building_spirit_shrine', 'M4 8h16 M6 8l2-4h8l2 4 M7 8v12 M17 8v12 M10 13h4'),
  building_warrior_academy: icon('building_warrior_academy', 'M4 20h16 M6 20V8l6-4 6 4v12 M9 11h6 M9 15h6'),
  building_arcane_forge: icon('building_arcane_forge', 'M5 18h14 M8 18l2-7h4l2 7 M7 8h10 M9 5h6'),
  building_mana_reactor: icon('building_mana_reactor', 'M12 3l6 4v10l-6 4-6-4V7z M12 7v4l3 1-3 5'),
  building_celestial_temple: icon('building_celestial_temple', 'M4 20h16 M6 20V9h12v11 M8 9l4-5 4 5 M10 13h4'),
  building_dimensional_gate: icon('building_dimensional_gate', 'M6 21V5h12v16 M9 18V8h6v10 M12 11v4'),
  building_star_fortress: icon('building_star_fortress', 'M4 20h16V8l-4 2V6l-4 2-4-2v4L4 8z M9 20v-6h6v6'),
  building_infinite_core: icon('building_infinite_core', 'M12 3l6 6-6 12L6 9z M9 9h6l-3 7z'),

  // Rank badges keep stable rank IDs but remove platform-dependent emoji artwork.
  rank_e: rankBadge('rank_e', 'E'),
  rank_d: rankBadge('rank_d', 'D'),
  rank_c: rankBadge('rank_c', 'C'),
  rank_b: rankBadge('rank_b', 'B'),
  rank_a: rankBadge('rank_a', 'A'),
  rank_s: rankBadge('rank_s', 'S'),
  rank_ss: rankBadge('rank_ss', 'SS'),
  rank_sss: rankBadge('rank_sss', '3S'),
  rank_awakened: rankBadge('rank_awakened', 'AW'),
  rank_transcendent: rankBadge('rank_transcendent', 'TR'),
  rank_celestial: rankBadge('rank_celestial', 'CE'),
  rank_immortal: rankBadge('rank_immortal', 'IM'),
};

const FALLBACK_ICON = icon('unknown', 'M4 4h16v16H4z M8 8l8 8 M16 8l-8 8');

export function resolveUIIcon(iconId: string): UIIconDefinition {
  const resolved = UI_ICON_REGISTRY[iconId];
  if (resolved) return resolved;
  reportMissingArtAsset('ui-icon', iconId, FALLBACK_ICON.iconId);
  return FALLBACK_ICON;
}
