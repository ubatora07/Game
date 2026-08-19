import { SkillNodeDefinition } from '../content/skillTrees';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export interface SkillTreeSaveState {
  unlockedNodeIds: string[];
  availablePoints: number;
}

export class SkillTreeSystem {
  private static instance: SkillTreeSystem;
  private unlockedNodes: Set<string> = new Set();
  private availablePoints: number = 4; // 4 skill points to complete 1 path across 4 tiers

  private constructor() {}

  public static getInstance(): SkillTreeSystem {
    if (!SkillTreeSystem.instance) {
      SkillTreeSystem.instance = new SkillTreeSystem();
    }
    return SkillTreeSystem.instance;
  }

  public getAvailablePoints(): number {
    return this.availablePoints;
  }

  public addPoints(amount: number): void {
    if (amount > 0) {
      this.availablePoints += amount;
    }
  }

  public getUnlockedNodeIds(): string[] {
    return Array.from(this.unlockedNodes);
  }

  public isNodeUnlocked(nodeId: string): boolean {
    return this.unlockedNodes.has(nodeId);
  }

  /**
   * Checks if a node is eligible to be unlocked.
   */
  public canUnlockNode(
    node: SkillNodeDefinition,
    allClassNodes: SkillNodeDefinition[]
  ): { eligible: boolean; reason?: string } {
    if (this.unlockedNodes.has(node.id)) {
      return { eligible: false, reason: 'Node already unlocked.' };
    }

    if (this.availablePoints < node.costPoints) {
      return { eligible: false, reason: 'Not enough skill points.' };
    }

    // Tier 1 has no parent
    if (node.tier === 1) {
      // If another Tier 1 node is somehow unlocked, block
      const existingTier1 = allClassNodes.find((n) => n.tier === 1 && this.unlockedNodes.has(n.id));
      if (existingTier1) {
        return { eligible: false, reason: 'Root origin already selected.' };
      }
      return { eligible: true };
    }

    // Tier 2, 3, 4 require exact parent to be unlocked
    if (!node.parentId || !this.unlockedNodes.has(node.parentId)) {
      return { eligible: false, reason: 'Prerequisite parent node is not unlocked.' };
    }

    // Exclusive branch check: cannot have another node unlocked at the same tier
    const conflictingNode = allClassNodes.find(
      (n) => n.tier === node.tier && this.unlockedNodes.has(n.id)
    );
    if (conflictingNode) {
      return {
        eligible: false,
        reason: `Exclusive branch already chosen at Tier ${node.tier}: ${conflictingNode.defaultName}. Respec to change.`,
      };
    }

    return { eligible: true };
  }

  /**
   * Unlocks a skill node, deducts points, and registers modifiers.
   */
  public unlockNode(
    node: SkillNodeDefinition,
    allClassNodes: SkillNodeDefinition[]
  ): boolean {
    const check = this.canUnlockNode(node, allClassNodes);
    if (!check.eligible) {
      console.warn(`[SkillTreeSystem] Cannot unlock ${node.id}: ${check.reason}`);
      return false;
    }

    this.unlockedNodes.add(node.id);
    this.availablePoints -= node.costPoints;

    // Register all node modifiers into ModifierResolver
    for (const mod of node.modifiers) {
      modifierResolver.registerModifier({
        ...mod,
        source: `Skill: ${node.defaultName}`,
        sourceType: 'skill_node',
        classTag: node.classId,
      });
    }

    events.emit('toast:show', {
      message: `Node Mastered: ${node.defaultName}!`,
      type: 'epic',
    });

    analytics.trackEvent('skill_node_unlocked', {
      nodeId: node.id,
      nodeName: node.defaultName,
      tier: node.tier,
      classId: node.classId,
    });

    return true;
  }

  /**
   * Respecs the entire tree, refunds points, and unregisters modifiers.
   */
  public respecTree(nodes: SkillNodeDefinition[]): void {
    let refundedPoints = 0;
    for (const nodeId of this.unlockedNodes) {
      const def = nodes.find((n) => n.id === nodeId);
      if (def) {
        refundedPoints += def.costPoints;
      }
    }

    this.unlockedNodes.clear();
    this.availablePoints += refundedPoints;
    modifierResolver.clearBySourceType('skill_node');

    events.emit('toast:show', {
      message: `Skill Tree reset. Refunded ${refundedPoints} points.`,
      type: 'info',
    });
  }

  public serialize(): SkillTreeSaveState {
    return {
      unlockedNodeIds: Array.from(this.unlockedNodes),
      availablePoints: this.availablePoints,
    };
  }

  public deserialize(state?: Partial<SkillTreeSaveState>): void {
    this.unlockedNodes.clear();
    this.availablePoints = state?.availablePoints ?? 4;
    if (state?.unlockedNodeIds) {
      for (const id of state.unlockedNodeIds) {
        this.unlockedNodes.add(id);
      }
    }
  }
}

export const skillTreeSystem = SkillTreeSystem.getInstance();
