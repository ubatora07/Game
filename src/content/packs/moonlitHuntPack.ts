import { ThemedLiveEventPack } from './ContentPackTypes';

export const MOONLIT_HUNT_PACK: ThemedLiveEventPack = {
  metadata: {
    packId: 'pack_moonlit_hunt',
    version: '1.0.0',
    category: 'themed_event',
    state: 'ACTIVE',
    titleKey: 'pack.moonlit_hunt.title',
    defaultTitle: 'The Moonlit Hunt',
    author: 'Ascension LiveOps Team',
    minGameVersion: '3.0.0',
    isActive: true,
  },

  events: [
    {
      id: 'evt_moonlit_hunt_1',
      titleKey: 'event.moonlit_hunt_1.title',
      descKey: 'event.moonlit_hunt_1.desc',
      icon: '🐺',
      category: 'story',
      weight: 40,
      cooldownSeconds: 60,
      requirements: {
        minWorldId: 1,
        onceOnly: true,
      },
      choices: [
        {
          id: 'track_silverfang',
          labelKey: 'event.moonlit_hunt_1.choice.track',
          outcome: {
            resultTextKey: 'event.moonlit_hunt_1.result.track',
            karmaDelta: 15,
            followUpEventId: 'evt_moonlit_hunt_2',
            flagId: 'moonlit_hunt_tracked',
            flagValue: true,
          },
        },
        {
          id: 'lay_traps',
          labelKey: 'event.moonlit_hunt_1.choice.traps',
          outcome: {
            resultTextKey: 'event.moonlit_hunt_1.result.traps',
            karmaDelta: -15,
            goldDelta: 3500,
            flagId: 'moonlit_hunt_trapped',
            flagValue: true,
          },
        },
      ],
    },
    {
      id: 'evt_moonlit_hunt_2',
      titleKey: 'event.moonlit_hunt_2.title',
      descKey: 'event.moonlit_hunt_2.desc',
      icon: '✨',
      category: 'story',
      weight: 50,
      cooldownSeconds: 60,
      requirements: {
        minWorldId: 1,
        onceOnly: true,
        requiredFlag: 'moonlit_hunt_tracked',
      },
      choices: [
        {
          id: 'commune_spirit',
          labelKey: 'event.moonlit_hunt_2.choice.commune',
          outcome: {
            resultTextKey: 'event.moonlit_hunt_2.result.commune',
            karmaDelta: 20,
            crystalsDelta: 50,
            flagId: 'moonlit_hunt_completed',
            flagValue: true,
          },
        },
        {
          id: 'claim_lunar_ore',
          labelKey: 'event.moonlit_hunt_2.choice.ore',
          outcome: {
            resultTextKey: 'event.moonlit_hunt_2.result.ore',
            goldDelta: 1200,
            flagId: 'moonlit_hunt_completed',
            flagValue: true,
          },
        },
      ],
    },
  ],

  raids: [
    {
      id: 'raid_moonlit_alpha_beast',
      nameKey: 'raid.moonlit_alpha.name',
      defaultName: 'Lunar Alpha Beast Incursion',
      threatLevel: 'severe',
      requiredDefense: 45,
      attackerFaction: 'Lunar Beast Pack',
      description: 'Empowered by the blood moon, a massive alpha pack assaults the Mountain Haven palisades!',
      bannerSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16.5l-6.5 4 2-7L2 9h7z"/></svg>`,
      rewardsOnWin: {
        gold: 6000,
        meteoriteOre: 3,
        karmaDelta: 10,
      },
      penaltyOnLoss: {
        woodCost: 20,
        stoneCost: 20,
        goldCost: 500,
      },
    },
  ],

  marketOffers: [
    {
      id: 'offer_moonlit_silver_essence',
      category: 'materials',
      nameKey: 'market.moonlit_essence.name',
      defaultName: 'Silver Moon Phial',
      descKey: 'market.moonlit_essence.desc',
      defaultDesc: 'Luminescent essence drawn under the full moon.',
      price: {
        gold: 1800,
      },
      stockMax: 2,
      isBlackMarket: false,
      reward: {
        type: 'material',
        materialId: 'material_rare_meteorite',
        count: 3,
      },
      rarity: 'rare',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M9 2v4M15 2v4M6 6h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6z"/></svg>`,
    },
  ],

  titles: [
    {
      id: 'title_moonlit_hunter',
      nameKey: 'title.moonlit_hunter.name',
      defaultName: 'Hunter of the Pale Moon',
      category: 'campaign',
      badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
      description: 'Awarded to those who walked the path of the sacred Silverfang beneath the blood moon.',
      unlockHint: 'Complete the Moonlit Hunt saga peacefully.',
      modifiers: [
        { target: 'critChance', type: 'flat', value: 0.05, label: '+5% Crit Chance' },
        { target: 'lootChance', type: 'percent_add', value: 0.08, label: '+8% Loot Chance' },
      ],
      unlockCondition: {
        type: 'default',
        description: 'Complete the Moonlit Hunt event chain.',
      },
    },
  ],
};
