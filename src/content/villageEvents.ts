import { AdventureEventDefinition } from '../core/events/AdventureEventTypes';

export const VILLAGE_CHOICE_EVENTS: AdventureEventDefinition[] = [
  // ==========================================
  // Village Dilemma 1: The Mountain Hamlet of Oakhaven
  // ==========================================
  {
    id: 'evt_village_oakhaven_dilemma',
    titleKey: 'event.village_oakhaven.title',
    descKey: 'event.village_oakhaven.desc',
    icon: '🏡',
    category: 'village',
    weight: 90,
    cooldownSeconds: 200,
    requirements: { minWorldId: 1, onceOnly: true },
    choices: [
      {
        id: 'oakhaven_defend',
        labelKey: 'event.village_oakhaven.opt_defend',
        descKey: 'event.village_oakhaven.desc_defend',
        outcome: {
          goldDelta: 1500,
          karmaDelta: 20,
          soulsDelta: 10,
          followUpEventId: 'evt_village_oakhaven_gratitude',
          resultTextKey: 'event.village_oakhaven.res_defend',
        },
      },
      {
        id: 'oakhaven_plunder',
        labelKey: 'event.village_oakhaven.opt_plunder',
        descKey: 'event.village_oakhaven.desc_plunder',
        outcome: {
          goldDelta: 9000,
          karmaDelta: -25,
          followUpEventId: 'evt_village_oakhaven_bounty',
          resultTextKey: 'event.village_oakhaven.res_plunder',
        },
      },
      {
        id: 'oakhaven_tax',
        labelKey: 'event.village_oakhaven.opt_tax',
        descKey: 'event.village_oakhaven.desc_tax',
        outcome: {
          goldDelta: 4000,
          karmaDelta: 0,
          resultTextKey: 'event.village_oakhaven.res_tax',
        },
      },
    ],
  },
  // Follow-up 1A: Goodwill Feast
  {
    id: 'evt_village_oakhaven_gratitude',
    titleKey: 'event.village_oakhaven_feast.title',
    descKey: 'event.village_oakhaven_feast.desc',
    icon: '🍖',
    category: 'story',
    weight: 80,
    cooldownSeconds: 300,
    requirements: { minWorldId: 1, minKarma: 15, onceOnly: true },
    choices: [
      {
        id: 'accept_festival_honor',
        labelKey: 'event.village_oakhaven_feast.opt_accept',
        outcome: {
          powerDelta: 5000,
          crystalsDelta: 30,
          karmaDelta: 5,
          resultTextKey: 'event.village_oakhaven_feast.res_accept',
        },
      },
    ],
  },
  // Follow-up 1B: Retaliation Bounty
  {
    id: 'evt_village_oakhaven_bounty',
    titleKey: 'event.village_oakhaven_retaliation.title',
    descKey: 'event.village_oakhaven_retaliation.desc',
    icon: '⚔️',
    category: 'ambush',
    weight: 80,
    cooldownSeconds: 300,
    requirements: { minWorldId: 1, maxKarma: -15, onceOnly: true },
    choices: [
      {
        id: 'slay_bounty_hunters',
        labelKey: 'event.village_oakhaven_retaliation.opt_slay',
        outcome: {
          powerDelta: 4000,
          goldDelta: 3000,
          karmaDelta: -5,
          resultTextKey: 'event.village_oakhaven_retaliation.res_slay',
        },
      },
      {
        id: 'bribe_hunters',
        labelKey: 'event.village_oakhaven_retaliation.opt_bribe',
        requiredGold: 3000,
        outcome: {
          goldDelta: -3000,
          karmaDelta: 2,
          resultTextKey: 'event.village_oakhaven_retaliation.res_bribe',
        },
      },
    ],
  },

  // ==========================================
  // Village Dilemma 2: The Sunken Shrine of Eldoria
  // ==========================================
  {
    id: 'evt_village_eldoria_crisis',
    titleKey: 'event.village_eldoria.title',
    descKey: 'event.village_eldoria.desc',
    icon: '🌊',
    category: 'village',
    weight: 85,
    cooldownSeconds: 240,
    requirements: { minWorldId: 2, onceOnly: true },
    choices: [
      {
        id: 'eldoria_restore_dam',
        labelKey: 'event.village_eldoria.opt_restore',
        descKey: 'event.village_eldoria.desc_restore',
        outcome: {
          crystalsDelta: 20,
          karmaDelta: 22,
          soulsDelta: 15,
          followUpEventId: 'evt_village_eldoria_blessing',
          resultTextKey: 'event.village_eldoria.res_restore',
        },
      },
      {
        id: 'eldoria_divert_waters',
        labelKey: 'event.village_eldoria.opt_divert',
        descKey: 'event.village_eldoria.desc_divert',
        outcome: {
          goldDelta: 12000,
          karmaDelta: -30,
          resultTextKey: 'event.village_eldoria.res_divert',
        },
      },
    ],
  },
  // Follow-up 2A: Aquatic Blessing
  {
    id: 'evt_village_eldoria_blessing',
    titleKey: 'event.village_eldoria_bless.title',
    descKey: 'event.village_eldoria_bless.desc',
    icon: '🔱',
    category: 'story',
    weight: 75,
    cooldownSeconds: 300,
    requirements: { minWorldId: 2, minKarma: 20, onceOnly: true },
    choices: [
      {
        id: 'receive_tidal_relic',
        labelKey: 'event.village_eldoria_bless.opt_receive',
        outcome: {
          powerDelta: 8000,
          soulsDelta: 30,
          crystalsDelta: 25,
          resultTextKey: 'event.village_eldoria_bless.res_receive',
        },
      },
    ],
  },
];
