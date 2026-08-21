import { describe, it, expect } from 'vitest';
import {
  createScreenRouteRegistry,
  REQUIRED_PRIMARY_SCREEN_ROUTES,
  ScreenRouteElements,
} from '../src/ui/navigation/ScreenRouteRegistry';

function stubElement(id: string): HTMLElement {
  return { id } as HTMLElement;
}

function createStubRoutes(): ScreenRouteElements {
  return {
    hero: stubElement('hero'),
    team: stubElement('team'),
    battle: stubElement('battle'),
    settlement: stubElement('settlement'),
    world: stubElement('world'),
    sect: stubElement('sect'),
    ascension: stubElement('ascension'),
    tower: stubElement('tower'),
    heroes: stubElement('heroes'),
    summon: stubElement('summon'),
    souls: stubElement('souls'),
    quests: stubElement('quests'),
    relics: stubElement('relics'),
    expeditions: stubElement('expeditions'),
    dailies: stubElement('dailies'),
  };
}

describe('UX IA V3 — Screen route registry', () => {
  it('registers every screen-backed primary domain', () => {
    const routes = createScreenRouteRegistry(createStubRoutes());
    for (const routeId of REQUIRED_PRIMARY_SCREEN_ROUTES) {
      expect(routes.has(routeId), `missing primary route ${routeId}`).toBe(true);
    }
  });

  it('keeps legacy home as an alias of Battle instead of a Sect route', () => {
    const routes = createScreenRouteRegistry(createStubRoutes());
    expect(routes.get('home')).toBe(routes.get('battle'));
    expect(routes.get('sect')).not.toBe(routes.get('battle'));
  });

  it('keeps deep-route destinations available after the primary-nav migration', () => {
    const routes = createScreenRouteRegistry(createStubRoutes());
    for (const routeId of ['sect', 'ascension', 'tower', 'heroes', 'summon', 'souls', 'quests', 'relics', 'expeditions', 'dailies']) {
      expect(routes.has(routeId), `missing deep route ${routeId}`).toBe(true);
    }
  });
});
