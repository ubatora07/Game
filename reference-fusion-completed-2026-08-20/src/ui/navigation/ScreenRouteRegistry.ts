export interface ScreenRouteElements {
  hero: HTMLElement;
  team: HTMLElement;
  battle: HTMLElement;
  settlement: HTMLElement;
  world: HTMLElement;
  sect: HTMLElement;
  ascension: HTMLElement;
  tower: HTMLElement;
  heroes: HTMLElement;
  summon: HTMLElement;
  souls: HTMLElement;
  quests: HTMLElement;
  relics: HTMLElement;
  expeditions: HTMLElement;
  dailies: HTMLElement;
}

export const REQUIRED_PRIMARY_SCREEN_ROUTES = [
  'hero',
  'team',
  'battle',
  'settlement',
  'world',
] as const;

/**
 * Builds the screen registry in one place so primary IA and legacy deep links
 * cannot silently diverge inside GameApp.bootstrap().
 */
export function createScreenRouteRegistry(elements: ScreenRouteElements): Map<string, HTMLElement> {
  return new Map<string, HTMLElement>([
    // UX IA V3 primary screen domains. More is modal-driven and has no screen.
    ['hero', elements.hero],
    ['team', elements.team],
    ['battle', elements.battle],
    ['settlement', elements.settlement],
    ['world', elements.world],

    // Backward-compatible alias for historical links/events.
    ['home', elements.battle],

    // Deep routes surfaced from domain hubs / More.
    ['sect', elements.sect],
    ['ascension', elements.ascension],
    ['tower', elements.tower],
    ['heroes', elements.heroes],
    ['summon', elements.summon],
    ['souls', elements.souls],
    ['quests', elements.quests],
    ['relics', elements.relics],
    ['expeditions', elements.expeditions],
    ['dailies', elements.dailies],
  ]);
}
