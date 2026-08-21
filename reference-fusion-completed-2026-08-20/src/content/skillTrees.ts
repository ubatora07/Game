import { CharacterClassId } from './classes';
import { GameModifier } from '../core/modifiers/ModifierTypes';

export type SkillTreeTier = 1 | 2 | 3 | 4;

export interface SkillNodeDefinition {
  id: string;
  classId: CharacterClassId;
  tier: SkillTreeTier;
  parentId: string | null;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  iconSvg?: string;
  modifiers: Omit<GameModifier, 'source' | 'sourceType'>[];
  costPoints: number;
}

export interface ClassSkillTree {
  classId: CharacterClassId;
  nodes: Record<string, SkillNodeDefinition>;
}

/**
 * Builds a valid 1 -> 2 -> 4 -> 8 tree structure (15 nodes total)
 */
export function validateTreeStructure(nodes: SkillNodeDefinition[]): { valid: boolean; error?: string } {
  if (nodes.length !== 15) {
    return { valid: false, error: `Expected 15 nodes in tree, found ${nodes.length}` };
  }

  const tier1 = nodes.filter((n) => n.tier === 1);
  const tier2 = nodes.filter((n) => n.tier === 2);
  const tier3 = nodes.filter((n) => n.tier === 3);
  const tier4 = nodes.filter((n) => n.tier === 4);

  if (tier1.length !== 1) return { valid: false, error: `Tier 1 must have 1 node, got ${tier1.length}` };
  if (tier2.length !== 2) return { valid: false, error: `Tier 2 must have 2 nodes, got ${tier2.length}` };
  if (tier3.length !== 4) return { valid: false, error: `Tier 3 must have 4 nodes, got ${tier3.length}` };
  if (tier4.length !== 8) return { valid: false, error: `Tier 4 must have 8 nodes, got ${tier4.length}` };

  // Check parent connections
  const root = tier1[0];
  if (root.parentId !== null) return { valid: false, error: 'Tier 1 root node must have parentId null' };

  for (const n of tier2) {
    if (n.parentId !== root.id) return { valid: false, error: `Tier 2 node ${n.id} must have root as parent` };
  }

  for (const n of tier3) {
    if (!tier2.some((p) => p.id === n.parentId)) {
      return { valid: false, error: `Tier 3 node ${n.id} has invalid parent ${n.parentId}` };
    }
  }

  for (const n of tier4) {
    if (!tier3.some((p) => p.id === n.parentId)) {
      return { valid: false, error: `Tier 4 node ${n.id} has invalid parent ${n.parentId}` };
    }
  }

  return { valid: true };
}
