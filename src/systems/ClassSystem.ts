import { CharacterClassId, CharacterClassDefinition, getClassById } from '../content/classes';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { partyTeamSystem } from './PartyTeamSystem';

export class ClassSystem {
  private static instance: ClassSystem;

  private constructor() {
    // Class identity persists through reincarnation unless product rules change.
    events.on('reincarnate:complete', () => {
      this.applyClassModifiers();
    });
  }

  public static getInstance(): ClassSystem {
    if (!ClassSystem.instance) {
      ClassSystem.instance = new ClassSystem();
    }
    return ClassSystem.instance;
  }

  public getSelectedClass(): CharacterClassDefinition | null {
    const selectedClassId = this.getSelectedClassId();
    if (!selectedClassId) return null;
    return getClassById(selectedClassId) || null;
  }

  public getSelectedClassId(): CharacterClassId | null {
    return partyTeamSystem.getCharacter('char_1').classId;
  }

  public selectClass(classId: CharacterClassId, force: boolean = false): boolean {
    const selectedClassId = this.getSelectedClassId();
    if (selectedClassId && !force) {
      console.warn(`[ClassSystem] Class already chosen: ${selectedClassId}. Respec required.`);
      return false;
    }

    const def = getClassById(classId);
    if (!def) return false;

    if (!partyTeamSystem.setCharacterClass('char_1', classId, false)) {
      return false;
    }

    events.emit('class:selected', { classId });
    events.emit('toast:show', {
      message: `Path Chosen: ${def.defaultName}!`,
      type: 'epic',
    });

    analytics.trackEvent('class_selected', {
      classId,
      className: def.defaultName,
    });

    return true;
  }

  public applyClassModifiers(): void {
    partyTeamSystem.reapplyAllModifiers();
  }

  public respec(_force: boolean = false): boolean {
    const changed = partyTeamSystem.clearCharacterClass('char_1');
    if (changed) {
      events.emit('class:respec', {});
    }
    return changed;
  }
}

export const classSystem = ClassSystem.getInstance();
