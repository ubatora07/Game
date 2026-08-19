import { describe, expect, it } from 'vitest';
import {
  shouldShowExpeditions,
  shouldShowLegacyCodex,
  shouldShowRelics,
  shouldShowSoulTree,
  shouldShowTower,
} from '../src/ui/navigation/SecondaryDisclosure';

describe('Secondary navigation progressive disclosure', () => {
  it('keeps empty/late systems out of the fresh Rank E discovery surface', () => {
    expect(shouldShowTower('E')).toBe(false);
    expect(shouldShowExpeditions(0)).toBe(false);
    expect(shouldShowRelics(0)).toBe(false);
    expect(shouldShowSoulTree('E', 0)).toBe(false);
    expect(shouldShowLegacyCodex(0, 0)).toBe(false);
  });

  it('reveals systems exactly when their existing state becomes relevant', () => {
    expect(shouldShowTower('C')).toBe(true);
    expect(shouldShowExpeditions(1)).toBe(true);
    expect(shouldShowRelics(1)).toBe(true);
    expect(shouldShowSoulTree('E', 1)).toBe(true);
    expect(shouldShowSoulTree('S', 0)).toBe(true);
    expect(shouldShowLegacyCodex(1, 0)).toBe(true);
    expect(shouldShowLegacyCodex(0, 1)).toBe(true);
  });
});
