import { CharacterClassId } from '../../content/classes';

export type MainCharacterSlotId = 'char_1' | 'char_2';

export interface MainCharacterState {
  slotId: MainCharacterSlotId;
  name: string;
  isUnlocked: boolean;
  classId: CharacterClassId | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  unlockedSkillNodeIds: string[];
}

export interface DualTeamSaveState {
  characters: {
    char_1: MainCharacterState;
    char_2: MainCharacterState;
  };
  activeFocusCharId: MainCharacterSlotId;
}
