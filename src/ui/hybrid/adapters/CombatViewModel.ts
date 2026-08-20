import { store } from '../../../core/GameState';
import { campaignCombatService } from '../../../systems/CampaignCombatService';
import { CampaignProgressionSystem } from '../../../systems/CampaignProgressionSystem';
import { CAMPAIGN_WORLDS } from '../../../content/campaignWorlds';
import { BigNumber } from '../../../core/BigNumber';

export interface CombatViewModelData {
  worldId: number;
  worldName: string;
  stageId: string;
  stageNumber: number;
  maxStages: number;
  isBossStage: boolean;
  isBossEncounter: boolean;
  bossName?: string;
  bossHp: number;
  bossMaxHp: number;
  bossTimerSeconds: number;
  bossTimerRemaining: number;
  autoAdvance: boolean;
  playerPower: number;
  playerFormattedPower: string;
  goldMultiplier: number;
  enemiesDefeatedInStage: number;
  totalEnemiesInStage: number;
  isBossFailed: boolean;
}

export class CombatViewModel {
  public static getData(): CombatViewModelData {
    const state = store.get();
    const campaign = state.campaign;
    const combatState = campaignCombatService.getCombatState();
    const worldDef = CAMPAIGN_WORLDS.find((w) => w.id === campaign.currentWorldId) || CAMPAIGN_WORLDS[0];

    const activeEnemy = combatState.activeEnemy;
    const isBoss = Boolean(activeEnemy?.isBoss);
    const stageParts = campaign.currentStageId.split('-');
    const stageNum = parseInt(stageParts[1] || '1', 10);

    return {
      worldId: campaign.currentWorldId,
      worldName: worldDef.defaultName,
      stageId: campaign.currentStageId,
      stageNumber: stageNum,
      maxStages: worldDef.stageCount,
      isBossStage: isBoss,
      isBossEncounter: isBoss,
      bossName: activeEnemy?.isBoss ? activeEnemy.defaultName : undefined,
      bossHp: activeEnemy?.isBoss ? Math.max(0, activeEnemy.currentHp) : 0,
      bossMaxHp: activeEnemy?.isBoss ? activeEnemy.maxHp : 1,
      bossTimerSeconds: combatState.maxEncounterTimer,
      bossTimerRemaining: Math.max(0, combatState.encounterTimer),
      autoAdvance: campaign.autoAdvance,
      playerPower: state.power,
      playerFormattedPower: BigNumber.format(state.power),
      goldMultiplier: 1.0,
      enemiesDefeatedInStage: campaign.currentEncounter || 1,
      totalEnemiesInStage: combatState.totalEncounters || 5,
      isBossFailed: Boolean(campaign.bossRetryState?.failedAt),
    };
  }

  public static manualAttack(x?: number, y?: number): { damage: number; isCrit: boolean } {
    const result = campaignCombatService.attack(x, y);
    return { damage: result.damage, isCrit: result.isCrit };
  }

  public static toggleAutoAdvance(): boolean {
    let result = false;
    store.set((draft) => {
      result = CampaignProgressionSystem.toggleAutoAdvance(draft);
    });
    return result;
  }

  public static retryBoss(): void {
    store.set((draft) => {
      CampaignProgressionSystem.retryBoss(draft);
    });
  }
}
