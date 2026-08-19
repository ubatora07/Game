import { AdventureEventDefinition } from '../core/events/AdventureEventTypes';

export const NARRATIVE_CHAIN_EVENTS: AdventureEventDefinition[] = [
  /* --------------------------------------------------------------------- */
  /* CHAIN 1: THE LOST HEIR OF ELDORIA (3 Steps)                           */
  /* --------------------------------------------------------------------- */
  {
    id: 'evt_chain_lost_heir_1',
    titleKey: 'event.chain.lost_heir_1.title',
    descKey: 'event.chain.lost_heir_1.desc',
    icon: '🛡️',
    category: 'story',
    weight: 25,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      onceOnly: true,
    },
    choices: [
      {
        id: 'help_knight',
        labelKey: 'Tend to the wounded knight and vow aid (+15 Karma)',
        outcome: {
          resultTextKey: 'You bandage the knight’s mortal wounds. He whispers of a royal conspiracy and hands you an engraved signet seal before passing into restful slumber.',
          goldDelta: 500,
          karmaDelta: 15,
          followUpEventId: 'evt_chain_lost_heir_2',
          flagId: 'lost_heir_helped',
          flagValue: true,
        },
      },
      {
        id: 'rob_knight',
        labelKey: 'Pillage the dying knight’s royal signet ring (-15 Karma)',
        outcome: {
          resultTextKey: 'You strip the dying knight of his royal jewelry and golden crest. The signet ring bears secrets worth a fortune on the black market.',
          goldDelta: 2500,
          karmaDelta: -15,
          followUpEventId: 'evt_chain_lost_heir_2',
          flagId: 'lost_heir_robbed',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_lost_heir_2',
    titleKey: 'event.chain.lost_heir_2.title',
    descKey: 'event.chain.lost_heir_2.desc',
    icon: '📜',
    category: 'story',
    weight: 35,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      requiredFlag: 'followup_evt_chain_lost_heir_2',
      onceOnly: true,
    },
    choices: [
      {
        id: 'reveal_to_court',
        labelKey: 'Deliver evidence to the Sovereign Court (+20 Karma)',
        outcome: {
          resultTextKey: 'The High Chancellor examines the royal seal in shock. The true heir’s lineage is validated, sparking hope throughout the realm.',
          goldDelta: 3000,
          crystalsDelta: 100,
          karmaDelta: 20,
          followUpEventId: 'evt_chain_lost_heir_3',
          flagId: 'lost_heir_court_allied',
          flagValue: true,
        },
      },
      {
        id: 'sell_to_shadows',
        labelKey: 'Blackmail the usurper through the Smuggler Network (-20 Karma)',
        outcome: {
          resultTextKey: 'You sell the evidence to the shadowy usurper’s agents in exchange for a heavy satchel of forbidden gold and ores.',
          goldDelta: 8000,
          crystalsDelta: 100,
          karmaDelta: -20,
          followUpEventId: 'evt_chain_lost_heir_3',
          flagId: 'lost_heir_shadow_allied',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_lost_heir_3',
    titleKey: 'event.chain.lost_heir_3.title',
    descKey: 'event.chain.lost_heir_3.desc',
    icon: '👑',
    category: 'story',
    weight: 50,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 2,
      requiredFlag: 'followup_evt_chain_lost_heir_3',
      onceOnly: true,
    },
    choices: [
      {
        id: 'crown_the_heir',
        labelKey: 'Lead the vanguard to crown the rightful sovereign (+25 Karma)',
        outcome: {
          resultTextKey: 'The usurper’s citadel falls! The rightful ruler ascends the throne, bestowing upon you the eternal gratitude and honors of the kingdom.',
          goldDelta: 15000,
          crystalsDelta: 100,
          karmaDelta: 25,
          materialId: 'material_rare_meteorite',
          materialCount: 15,
          unlockTitleId: 'title_virtuous_champion',
          flagId: 'lost_heir_saga_completed',
          flagValue: true,
        },
      },
      {
        id: 'claim_shadow_reign',
        labelKey: 'Assassinate both claimant and usurper to seize underworld rule (-25 Karma)',
        outcome: {
          resultTextKey: 'In a single bloody night, both factions fall. You rule the kingdom’s shadow network from the darkness, feared by all.',
          goldDelta: 20000,
          crystalsDelta: 100,
          karmaDelta: -25,
          materialId: 'material_rare_meteorite',
          materialCount: 20,
          unlockTitleId: 'title_dread_overlord',
          flagId: 'lost_heir_saga_completed',
          flagValue: true,
        },
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /* CHAIN 2: THE SUNKEN STAR ORE (3 Steps)                                */
  /* --------------------------------------------------------------------- */
  {
    id: 'evt_chain_star_ore_1',
    titleKey: 'event.chain.star_ore_1.title',
    descKey: 'event.chain.star_ore_1.desc',
    icon: '☄️',
    category: 'story',
    weight: 25,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      onceOnly: true,
    },
    choices: [
      {
        id: 'excavate_meteor',
        labelKey: 'Excavate the smoking cosmic crater',
        outcome: {
          resultTextKey: 'You unearth glowing celestial fragments that hum with cosmic energy. Traces lead toward a hidden subterranean mountain vault.',
          materialId: 'material_iron_ore',
          materialCount: 10,
          followUpEventId: 'evt_chain_star_ore_2',
          flagId: 'star_ore_excavated',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_star_ore_2',
    titleKey: 'event.chain.star_ore_2.title',
    descKey: 'event.chain.star_ore_2.desc',
    icon: '🚪',
    category: 'story',
    weight: 35,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      requiredFlag: 'followup_evt_chain_star_ore_2',
      onceOnly: true,
    },
    choices: [
      {
        id: 'unlock_vault',
        labelKey: 'Decipher the celestial door glyphs',
        outcome: {
          resultTextKey: 'The ancient titan door grinds open, revealing pristine veins of pure Meteorite Ore and arcane blueprints untouched for millenia.',
          materialId: 'material_rare_meteorite',
          materialCount: 8,
          crystalsDelta: 80,
          followUpEventId: 'evt_chain_star_ore_3',
          flagId: 'star_vault_unlocked',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_star_ore_3',
    titleKey: 'event.chain.star_ore_3.title',
    descKey: 'event.chain.star_ore_3.desc',
    icon: '🔨',
    category: 'story',
    weight: 45,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 2,
      requiredFlag: 'followup_evt_chain_star_ore_3',
      onceOnly: true,
    },
    choices: [
      {
        id: 'forge_celestial_alloy',
        labelKey: 'Deliver the star core to Master Goran’s Forge',
        outcome: {
          resultTextKey: 'Master Goran smites the celestial ore into glowing mythical ingots, enhancing the settlement’s forge capabilities permanently!',
          materialId: 'material_rare_meteorite',
          materialCount: 15,
          goldDelta: 5000,
          crystalsDelta: 100,
          flagId: 'star_ore_saga_completed',
          flagValue: true,
        },
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /* CHAIN 3: THE RUNIC BEAST STAMPEDE (3 Steps)                           */
  /* --------------------------------------------------------------------- */
  {
    id: 'evt_chain_runic_beast_1',
    titleKey: 'event.chain.runic_beast_1.title',
    descKey: 'event.chain.runic_beast_1.desc',
    icon: '🐾',
    category: 'story',
    weight: 25,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      onceOnly: true,
    },
    choices: [
      {
        id: 'track_with_pet',
        labelKey: 'Send your active Companion Pet to track the alpha beast',
        outcome: {
          resultTextKey: 'Your companion catches the scent of charged ozone and leads you past razor-sharp brambles straight toward the alpha’s lair.',
          powerDelta: 1000,
          followUpEventId: 'evt_chain_runic_beast_2',
          flagId: 'runic_beast_tracked',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_runic_beast_2',
    titleKey: 'event.chain.runic_beast_2.title',
    descKey: 'event.chain.runic_beast_2.desc',
    icon: '🏔️',
    category: 'story',
    weight: 35,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      requiredFlag: 'followup_evt_chain_runic_beast_2',
      onceOnly: true,
    },
    choices: [
      {
        id: 'confront_alpha',
        labelKey: 'Corner the Ancient Thunder Drake atop the storm ridge',
        outcome: {
          resultTextKey: 'Lightning crackles in the night air. The beast roars, testing your resolve and bond with your companions.',
          powerDelta: 2500,
          followUpEventId: 'evt_chain_runic_beast_3',
          flagId: 'runic_alpha_confronted',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_runic_beast_3',
    titleKey: 'event.chain.runic_beast_3.title',
    descKey: 'event.chain.runic_beast_3.desc',
    icon: '⚡',
    category: 'story',
    weight: 45,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 2,
      requiredFlag: 'followup_evt_chain_runic_beast_3',
      onceOnly: true,
    },
    choices: [
      {
        id: 'tame_storm_alpha',
        labelKey: 'Attune spiritual harmony and tame the storm herd',
        outcome: {
          resultTextKey: 'The Thunder Drake bows its majestic horned head, infusing your team with thunderous vigor and granting celestial essence!',
          powerDelta: 10000,
          crystalsDelta: 100,
          unlockPetId: 'pet_ignis_drake',
          flagId: 'runic_beast_saga_completed',
          flagValue: true,
        },
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /* CHAIN 4: REFUGEES OF MOUNTAIN HAVEN (2 Steps)                         */
  /* --------------------------------------------------------------------- */
  {
    id: 'evt_chain_refugees_1',
    titleKey: 'event.chain.refugees_1.title',
    descKey: 'event.chain.refugees_1.desc',
    icon: '🛖',
    category: 'story',
    weight: 30,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      onceOnly: true,
    },
    choices: [
      {
        id: 'shelter_refugees',
        labelKey: 'Open the settlement gates and provide food & medical shelter (+15 Karma)',
        outcome: {
          resultTextKey: 'The weary families weep with gratitude as they find warm hearths behind your fortified walls.',
          karmaDelta: 15,
          goldDelta: -500,
          followUpEventId: 'evt_chain_refugees_2',
          flagId: 'refugees_sheltered',
          flagValue: true,
        },
      },
      {
        id: 'turn_away_refugees',
        labelKey: 'Bar the gates to preserve Mountain Haven rations (-15 Karma)',
        outcome: {
          resultTextKey: 'You turn the cold travelers away into the harsh mountain winds, preserving your settlement’s immediate stockpiles.',
          karmaDelta: -15,
          goldDelta: 2000,
          flagId: 'refugees_turned_away',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_refugees_2',
    titleKey: 'event.chain.refugees_2.title',
    descKey: 'event.chain.refugees_2.desc',
    icon: '🤝',
    category: 'story',
    weight: 40,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      requiredFlag: 'followup_evt_chain_refugees_2',
      onceOnly: true,
    },
    choices: [
      {
        id: 'enlist_craftsmen',
        labelKey: 'Integrate the skilled artisans into the settlement workshops (+15 Karma)',
        outcome: {
          resultTextKey: 'The newly sheltered carpenters and stonemasons bolster production, presenting gifts of forged resources to your treasury!',
          karmaDelta: 15,
          goldDelta: 3500,
          crystalsDelta: 50,
          materialId: 'material_rare_meteorite',
          materialCount: 5,
          flagId: 'refugees_saga_completed',
          flagValue: true,
        },
      },
      {
        id: 'exploit_labor',
        labelKey: 'Demand exorbitant sanctuary taxes from the new arrivals (-15 Karma)',
        outcome: {
          resultTextKey: 'You squeeze heavy tribute from the vulnerable families, swelling your coffers while sowing bitter seeds of discontent.',
          karmaDelta: -15,
          goldDelta: 8000,
          crystalsDelta: 80,
          flagId: 'refugees_saga_completed',
          flagValue: true,
        },
      },
    ],
  },

  /* --------------------------------------------------------------------- */
  /* CHAIN 5: THE SMUGGLER'S DEBT (2 Steps)                                */
  /* --------------------------------------------------------------------- */
  {
    id: 'evt_chain_smugglers_debt_1',
    titleKey: 'event.chain.smugglers_debt_1.title',
    descKey: 'event.chain.smugglers_debt_1.desc',
    icon: '📜',
    category: 'story',
    weight: 30,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      onceOnly: true,
    },
    choices: [
      {
        id: 'expose_smuggler_ring',
        labelKey: 'Hand the incriminating ledgers over to Elder Aldric (+18 Karma)',
        outcome: {
          resultTextKey: 'Elder Aldric mobilizes town sentries to crack down on corruption, rewarding you handsomely from the recovery fund.',
          karmaDelta: 18,
          goldDelta: 4000,
          followUpEventId: 'evt_chain_smugglers_debt_2',
          flagId: 'smuggler_debt_lawful',
          flagValue: true,
        },
      },
      {
        id: 'extort_smuggler_ring',
        labelKey: 'Blackmail the shadow cartel for a cut of the contraband (-18 Karma)',
        outcome: {
          resultTextKey: 'The underground syndicate quakes in fear, quickly delivering a pouch of forbidden gold to keep your silence.',
          karmaDelta: -18,
          goldDelta: 7500,
          followUpEventId: 'evt_chain_smugglers_debt_2',
          flagId: 'smuggler_debt_shadow',
          flagValue: true,
        },
      },
    ],
  },

  {
    id: 'evt_chain_smugglers_debt_2',
    titleKey: 'event.chain.smugglers_debt_2.title',
    descKey: 'event.chain.smugglers_debt_2.desc',
    icon: '🗝️',
    category: 'story',
    weight: 40,
    cooldownSeconds: 60,
    requirements: {
      minWorldId: 1,
      requiredFlag: 'followup_evt_chain_smugglers_debt_2',
      onceOnly: true,
    },
    choices: [
      {
        id: 'seize_warehouse',
        labelKey: 'Raid the secret mountain warehouse and secure contraband for the people (+15 Karma)',
        outcome: {
          resultTextKey: 'Town guards storm the vault! The recovered celestial ores and gold are formally registered into Mountain Haven’s armory.',
          karmaDelta: 15,
          goldDelta: 8000,
          crystalsDelta: 60,
          materialId: 'material_rare_meteorite',
          materialCount: 10,
          flagId: 'smuggler_saga_completed',
          flagValue: true,
        },
      },
      {
        id: 'absorb_syndicate',
        labelKey: 'Assume total command of the smuggling routes as Underworld Kingpin (-20 Karma)',
        outcome: {
          resultTextKey: 'The shadow brokers bow before you. All illicit contraband in the eastern highlands now pays tithe to your dark reign.',
          karmaDelta: -20,
          goldDelta: 16000,
          crystalsDelta: 100,
          materialId: 'material_rare_meteorite',
          materialCount: 15,
          flagId: 'smuggler_saga_completed',
          flagValue: true,
        },
      },
    ],
  },
];
