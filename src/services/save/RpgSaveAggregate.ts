import { GameStateData } from '../../core/GameState';
import { settlementSystem } from '../../systems/SettlementSystem';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { marketSystem } from '../../systems/MarketSystem';
import { mercenarySystem } from '../../systems/MercenarySystem';
import { titleSystem } from '../../systems/TitleSystem';
import { settlementDefenseSystem } from '../../systems/SettlementDefenseSystem';
import { settlementStorySystem } from '../../systems/SettlementStorySystem';
import { legacyEndingSystem } from '../../systems/LegacyEndingSystem';
import { partyTeamSystem } from '../../systems/PartyTeamSystem';
import { petSystem } from '../../systems/PetSystem';
import { karmaSystem } from '../../systems/KarmaSystem';
import { adventureEventSystem } from '../../systems/AdventureEventSystem';
import { worldStateManager } from '../../systems/WorldStateManager';

/**
 * Single orchestration point for mutable RPG state that lives outside GameStore.
 * GameStore owns the persisted snapshot, while the subsystem singletons own the
 * live runtime objects and derived modifiers.
 */
export class RpgSaveAggregate {
  public static captureInto(draft: GameStateData): void {
    draft.settlement = settlementSystem.serialize();
    draft.crafting = craftingEquipmentSystem.serialize();
    draft.market = marketSystem.serialize();
    draft.mercenaries = mercenarySystem.serialize();
    draft.titles = titleSystem.serialize();
    draft.settlementDefense = settlementDefenseSystem.serialize();
    draft.settlementStory = settlementStorySystem.serialize();
    draft.legacyEndings = legacyEndingSystem.serialize();
    draft.partyTeam = partyTeamSystem.serialize();
    draft.pets = petSystem.serialize();
    draft.karma = karmaSystem.serialize();
    draft.adventureEvents = adventureEventSystem.serialize();
    draft.worldState = worldStateManager.serialize();
  }

  public static hydrate(state: Readonly<GameStateData>): void {
    if (state.settlement) settlementSystem.deserialize(state.settlement);
    if (state.crafting) craftingEquipmentSystem.deserialize(state.crafting);
    if (state.market) marketSystem.deserialize(state.market);
    if (state.mercenaries) mercenarySystem.deserialize(state.mercenaries);
    if (state.titles) titleSystem.deserialize(state.titles);
    if (state.settlementDefense) settlementDefenseSystem.deserialize(state.settlementDefense);
    if (state.settlementStory) settlementStorySystem.deserialize(state.settlementStory);
    if (state.legacyEndings) legacyEndingSystem.deserialize(state.legacyEndings);

    // Party/class state must hydrate before pet synergy, and Karma before World
    // consumers so every derived modifier sees the final authoritative state.
    if (state.partyTeam) partyTeamSystem.deserialize(state.partyTeam);
    if (state.karma) karmaSystem.deserialize(state.karma);
    if (state.pets) petSystem.deserialize(state.pets);
    if (state.adventureEvents) adventureEventSystem.deserialize(state.adventureEvents);
    if (state.worldState) worldStateManager.deserialize(state.worldState);
  }

  public static resetAll(): void {
    settlementSystem.resetAll();
    craftingEquipmentSystem.resetAll();
    marketSystem.resetAll();
    mercenarySystem.resetAll();
    titleSystem.resetAll();
    settlementDefenseSystem.resetAll();
    settlementStorySystem.resetAll();
    legacyEndingSystem.resetAll();
    partyTeamSystem.resetAll();
    petSystem.resetAll();
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
    worldStateManager.resetAll();
  }
}
