import { CharacterClassId } from '../../content/classes';
import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';

export type SpecializationBranchId =
  // Swordsman
  | 'spec_paladin'
  | 'spec_dark_guard'
  // Mage
  | 'spec_summoner'
  | 'spec_elementalist'
  // Archer
  | 'spec_crossbowman'
  | 'spec_trapper'
  // Assassin
  | 'spec_shadow_stalker'
  | 'spec_reaper';

export interface SpecializationNodeDefinition {
  id: string;
  branchId: SpecializationBranchId;
  baseClassId: CharacterClassId;
  tier: number; // 1..3
  nameKey: string;
  defaultName: string;
  iconSvg: string;
  description: string;
  modifiers: Array<{
    target: ModifierTarget;
    type: ModifierType;
    value: number;
    label: string;
  }>;
  prerequisiteNodeId?: string;
  requiredSkillPoints: number;
}

export interface SpecializationBranchDefinition {
  id: SpecializationBranchId;
  baseClassId: CharacterClassId;
  nameKey: string;
  defaultName: string;
  description: string;
  themeColor: string;
  nodes: SpecializationNodeDefinition[];
}
