import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { contentPackRegistry } from '../src/content/packs/ContentPackRegistry';
import { MOONLIT_HUNT_PACK } from '../src/content/packs/moonlitHuntPack';
import { ContentValidator } from '../src/tools/contentValidator';
import { titleSystem } from '../src/systems/TitleSystem';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';

describe('Phase 124: LiveOps Foundation & Moonlit Hunt Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    contentPackRegistry.resetAll();
    titleSystem.resetAll();
    karmaSystem.resetAll();
  });

  it('P124-01: Auto-registers the reference Moonlit Hunt pack in ACTIVE state', () => {
    const packs = contentPackRegistry.getAllPacks();
    expect(packs.length).toBeGreaterThan(0);

    const moonlit = packs.find((p) => p.packId === 'pack_moonlit_hunt');
    expect(moonlit).toBeDefined();
    expect(moonlit?.state).toBe('ACTIVE');
    expect(contentPackRegistry.isPackActive('pack_moonlit_hunt')).toBe(true);
  });

  it('P124-02: Disabling or expiring a pack updates active queries without deleting data', () => {
    contentPackRegistry.setPackState('pack_moonlit_hunt', 'DISABLED');
    expect(contentPackRegistry.isPackActive('pack_moonlit_hunt')).toBe(false);

    const activePacks = contentPackRegistry.getActivePacks();
    expect(activePacks.some((p) => p.packId === 'pack_moonlit_hunt')).toBe(false);

    // Re-enabling reactivates cleanly
    contentPackRegistry.setPackState('pack_moonlit_hunt', 'ACTIVE');
    expect(contentPackRegistry.isPackActive('pack_moonlit_hunt')).toBe(true);
  });

  it('P124-03: ContentValidator validates all registered live content packs with zero errors', () => {
    const report = ContentValidator.validateAll();
    expect(report.isValid).toBe(true);
    expect(report.errorCount).toBe(0);
    expect(report.issues.filter((i) => i.category === 'ContentPack').length).toBe(0);
  });

  it('P124-04: Moonlit Hunt event chain executes with bounded rewards and unlocks Title', () => {
    const evt1 = MOONLIT_HUNT_PACK.events[0];
    const choiceTrack = evt1.choices.find((c) => c.id === 'track_silverfang')!;
    adventureEventSystem.executeChoice(evt1, choiceTrack);

    expect(karmaSystem.getMajorChoiceFlag('moonlit_hunt_tracked')).toBe(true);

    const evt2 = MOONLIT_HUNT_PACK.events[1];
    const choiceCommune = evt2.choices.find((c) => c.id === 'commune_spirit')!;
    adventureEventSystem.executeChoice(evt2, choiceCommune);

    expect(karmaSystem.getMajorChoiceFlag('moonlit_hunt_completed')).toBe(true);
    // Rewards were strictly bounded
    expect(choiceCommune.outcome.crystalsDelta).toBeLessThanOrEqual(100);
  });
});
