import { GameStateData } from '../../core/GameState';

/**
 * Chooses the freshest already-sanitized save. Local wins ties so a cloud
 * payload must be strictly newer before it replaces a known-good local state.
 */
export function selectMostRecentSave(
  localSave: GameStateData | null,
  cloudSave: GameStateData | null,
): GameStateData | null {
  if (!localSave) return cloudSave;
  if (!cloudSave) return localSave;
  return cloudSave.lastSeenAt > localSave.lastSeenAt ? cloudSave : localSave;
}
