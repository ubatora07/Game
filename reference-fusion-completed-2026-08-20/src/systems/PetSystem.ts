import {
  PetId,
  PetInstance,
  PetSaveState,
  PetEvolutionStage,
} from '../core/pets/PetTypes';
import {
  getPetDefinition,
  getXpRequiredForLevel,
} from '../content/petsCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { classSystem } from './ClassSystem';
import { partyTeamSystem } from './PartyTeamSystem';
import { t } from '../services/i18n/I18nService';

export class PetSystem {
  private static instance: PetSystem;

  private ownedPets: Record<PetId, PetInstance> = {};
  private activePetId: PetId | null = null;
  private actionCooldownTimerMs: number = 0;

  private constructor() {
    this.reapplyActivePetModifiers();

    // Reapply synergy buffs whenever player or party changes class
    events.on('class:selected' as any, () => this.reapplyActivePetModifiers());
    events.on('class:respec' as any, () => this.reapplyActivePetModifiers());
    events.on('party:character_class_selected' as any, () => this.reapplyActivePetModifiers());
    events.on('party:second_character_unlocked' as any, () => this.reapplyActivePetModifiers());
  }

  public static getInstance(): PetSystem {
    if (!PetSystem.instance) {
      PetSystem.instance = new PetSystem();
    }
    return PetSystem.instance;
  }

  public getOwnedPets(): PetInstance[] {
    return Object.values(this.ownedPets);
  }

  public getPetInstance(petId: PetId): PetInstance | undefined {
    return this.ownedPets[petId];
  }

  public getActivePetId(): PetId | null {
    return this.activePetId;
  }

  public getActivePet(): PetInstance | null {
    if (!this.activePetId) return null;
    return this.ownedPets[this.activePetId] ?? null;
  }

  public acquirePet(petId: PetId): boolean {
    if (this.ownedPets[petId]) {
      return false; // Already owned
    }

    const def = getPetDefinition(petId);
    if (!def) {
      console.warn(`[PetSystem] Unknown pet ID: ${petId}`);
      return false;
    }

    const instance: PetInstance = {
      id: petId,
      name: def.defaultName,
      level: 1,
      xp: 0,
      xpToNextLevel: getXpRequiredForLevel(1),
      evolutionStage: 1,
      affection: 10,
      unlockedAt: Date.now(),
    };

    this.ownedPets[petId] = instance;

    // Auto-equip if no active pet
    if (!this.activePetId) {
      this.setActivePet(petId);
    }

    events.emit('toast:show', {
      message: t('toast.pet.acquired', { name: t(def.nameKey) }),
      type: 'epic',
    });

    events.emit('pet:acquired', { petId });
    analytics.trackEvent('pet_acquired', { petId, element: def.element });

    return true;
  }

  public setActivePet(petId: PetId | null): boolean {
    if (petId !== null && !this.ownedPets[petId]) {
      return false;
    }

    this.activePetId = petId;
    this.actionCooldownTimerMs = 0;
    this.reapplyActivePetModifiers();

    events.emit('pet:active_changed', { activePetId: petId });

    if (petId) {
      const pet = this.ownedPets[petId];
      events.emit('toast:show', {
        message: t('toast.pet.active', { name: t(getPetDefinition(petId)?.evolutions[pet.evolutionStage]?.nameKey || getPetDefinition(petId)?.nameKey || pet.name) }),
        type: 'info',
      });
    }

    return true;
  }

  public addPetXp(petId: PetId, amount: number): { leveledUp: boolean; newLevel: number } {
    const pet = this.ownedPets[petId];
    if (!pet || amount <= 0) {
      return { leveledUp: false, newLevel: pet?.level ?? 1 };
    }

    pet.xp += amount;
    let leveledUp = false;

    while (pet.xp >= pet.xpToNextLevel && pet.level < 100) {
      pet.xp -= pet.xpToNextLevel;
      pet.level += 1;
      pet.xpToNextLevel = getXpRequiredForLevel(pet.level);
      leveledUp = true;
    }

    if (leveledUp) {
      events.emit('toast:show', {
        message: t('toast.pet.level_up', { name: t(getPetDefinition(petId)?.evolutions[pet.evolutionStage]?.nameKey || getPetDefinition(petId)?.nameKey || pet.name), level: pet.level }),
        type: 'epic',
      });

      events.emit('pet:leveled' as any, { petId, level: pet.level });
      analytics.trackEvent('pet_leveled_up', { petId, level: pet.level });

      if (this.activePetId === petId) {
        this.reapplyActivePetModifiers();
      }
    }

    return { leveledUp, newLevel: pet.level };
  }

  public canEvolvePet(petId: PetId): { eligible: boolean; reason?: string; nextStage?: PetEvolutionStage } {
    const pet = this.ownedPets[petId];
    if (!pet) return { eligible: false, reason: 'Pet not owned.' };

    if (pet.evolutionStage >= 3) {
      return { eligible: false, reason: 'Pet already at Apex Evolution stage.' };
    }

    const nextStage = (pet.evolutionStage + 1) as PetEvolutionStage;
    const def = getPetDefinition(petId);
    if (!def) return { eligible: false, reason: 'Pet definition not found.' };

    const evoReq = def.evolutions[nextStage];
    if (!evoReq) return { eligible: false, reason: 'Evolution stage not found.' };

    if (pet.level < evoReq.minLevel) {
      return {
        eligible: false,
        reason: `Requires Pet Level ${evoReq.minLevel} (Current: ${pet.level}).`,
      };
    }

    const state = store.get();
    if (state.gold < evoReq.goldCost) {
      return { eligible: false, reason: `Requires ${evoReq.goldCost} Gold.` };
    }

    if (state.souls < evoReq.soulCost) {
      return { eligible: false, reason: `Requires ${evoReq.soulCost} Souls.` };
    }

    return { eligible: true, nextStage };
  }

  public evolvePet(petId: PetId): boolean {
    const check = this.canEvolvePet(petId);
    if (!check.eligible || !check.nextStage) {
      console.warn(`[PetSystem] Evolution blocked: ${check.reason}`);
      return false;
    }

    const pet = this.ownedPets[petId];
    const def = getPetDefinition(petId)!;
    const nextStage = check.nextStage;
    const evoDef = def.evolutions[nextStage];

    // Deduct resources
    store.set((draft) => {
      draft.gold -= evoDef.goldCost;
      draft.souls -= evoDef.soulCost;
    });

    pet.evolutionStage = nextStage;
    pet.name = evoDef.defaultName;

    if (this.activePetId === petId) {
      this.reapplyActivePetModifiers();
    }

    events.emit('toast:show', {
      message: t('toast.pet.evolved', { name: t(evoDef.nameKey), stage: nextStage }),
      type: 'epic',
    });

    events.emit('pet:evolved', { petId, stage: nextStage });
    analytics.trackEvent('pet_evolved', { petId, stage: nextStage });

    return true;
  }

  public reapplyActivePetModifiers(): void {
    modifierResolver.clearBySourceType('pet');

    if (!this.activePetId) return;
    const pet = this.ownedPets[this.activePetId];
    if (!pet) return;

    const def = getPetDefinition(pet.id);
    if (!def) return;

    const evoDef = def.evolutions[pet.evolutionStage];
    if (!evoDef) return;

    // Scale modifiers slightly by pet level (e.g. +1.5% per pet level)
    const levelScaling = 1 + (pet.level - 1) * 0.015;

    for (const mod of evoDef.modifiers) {
      modifierResolver.registerModifier({
        id: `pet_${mod.id}`,
        target: mod.target,
        type: mod.type,
        value: mod.value * levelScaling,
        source: `Pet: ${pet.name}`,
        sourceType: 'pet',
      });
    }

    // Apply Class Synergy Modifiers if active
    const synergy = this.getSynergyStatus(this.activePetId);
    if (synergy.hasSynergy && def.synergyModifiers) {
      for (const synMod of def.synergyModifiers) {
        modifierResolver.registerModifier({
          id: `pet_synergy_${synMod.id}`,
          target: synMod.target,
          type: synMod.type,
          value: synMod.value,
          source: `Pet Synergy: ${def.defaultName} + ${synergy.matchingClass}`,
          sourceType: 'pet',
        });
      }
    }
  }

  public getSynergyStatus(petId: PetId): {
    hasSynergy: boolean;
    matchingClass: string | null;
    synergyDesc: string;
    synergyTags: string[];
  } {
    const def = getPetDefinition(petId);
    if (!def || !def.preferredClass) {
      return { hasSynergy: false, matchingClass: null, synergyDesc: '', synergyTags: [] };
    }

    // Check main protagonist class
    const selectedClass = classSystem.getSelectedClassId();
    let isMatch = selectedClass === def.preferredClass;
    let matchingClass = isMatch ? selectedClass : null;

    // Check party characters
    if (!isMatch) {
      const partyChars = partyTeamSystem.getAllCharacters();
      for (const char of partyChars) {
        if (char.isUnlocked && char.classId === def.preferredClass) {
          isMatch = true;
          matchingClass = char.classId;
          break;
        }
      }
    }

    return {
      hasSynergy: isMatch,
      matchingClass,
      synergyDesc: def.defaultSynergyDesc || '',
      synergyTags: def.synergyTags || [],
    };
  }

  public tickCombat(deltaMs: number): { triggered: boolean; action?: any; damage?: number } {
    if (!this.activePetId) return { triggered: false };
    const pet = this.ownedPets[this.activePetId];
    if (!pet) return { triggered: false };

    const def = getPetDefinition(pet.id);
    if (!def) return { triggered: false };

    const evoDef = def.evolutions[pet.evolutionStage];
    if (!evoDef) return { triggered: false };

    const action = evoDef.combatAction;
    this.actionCooldownTimerMs += deltaMs;

    if (this.actionCooldownTimerMs >= action.intervalSeconds * 1000) {
      this.actionCooldownTimerMs = 0;
      const baseDamage = 100 * (1 + (pet.level - 1) * 0.05);
      const damage = baseDamage * action.damageMultiplier;

      return {
        triggered: true,
        action,
        damage: Math.round(damage),
      };
    }

    return { triggered: false };
  }

  public serialize(): PetSaveState {
    return {
      ownedPets: { ...this.ownedPets },
      activePetId: this.activePetId,
    };
  }

  public deserialize(state?: Partial<PetSaveState>): void {
    this.ownedPets = state?.ownedPets ? { ...state.ownedPets } : {};
    this.activePetId = state?.activePetId ?? null;
    this.reapplyActivePetModifiers();
  }

  public resetAll(): void {
    this.ownedPets = {};
    this.activePetId = null;
    this.actionCooldownTimerMs = 0;
    this.reapplyActivePetModifiers();
  }
}

export const petSystem = PetSystem.getInstance();
