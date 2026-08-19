import { SettlementNPCDefinition, SettlementNPCId } from '../core/settlement/SettlementTypes';

export const SETTLEMENT_NPCS: Record<SettlementNPCId, SettlementNPCDefinition> = {
  npc_elder_aldric: {
    id: 'npc_elder_aldric',
    nameKey: 'settlement.npc.aldric.name',
    defaultName: 'Elder Aldric',
    titleKey: 'settlement.npc.aldric.title',
    defaultTitle: 'Domain Warden & Sage',
    role: 'Settlement Governance',
    linkedBuildingId: 'throne_hall',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="M12 13v4M10 15h4"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'Blessings upon your path, noble Sovereign. Your righteousness brings peace and harvest to our lands.',
      infamous: 'I know the dread your blade commands, Sovereign... We will do as you bid without question.',
      neutral: 'Greetings, Sovereign. The settlement awaits your guiding word. How shall we expand today?',
    },
    dialogues: [
      {
        id: 'aldric_1',
        text: 'Our Stronghold stands firm. Expanding our borders will draw craftsmen and warriors from afar.',
        textRu: 'Наша крепость нерушима. Расширение границ привлечет ремесленников и воинов со всего света.',
      },
      {
        id: 'aldric_2',
        text: 'Keep our garrison reinforced. The Whispering Forest hides ancient evils that covet our wealth.',
        textRu: 'Укрепляйте гарнизон. Шепчущий лес таит древнее зло, жаждущее наших богатств.',
      },
    ],
  },

  npc_blacksmith_goran: {
    id: 'npc_blacksmith_goran',
    nameKey: 'settlement.npc.goran.name',
    defaultName: 'Master Goran',
    titleKey: 'settlement.npc.goran.title',
    defaultTitle: 'Runeforge Grandmaster',
    role: 'Weapons & Armor Forging',
    linkedBuildingId: 'forge',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'A warrior of honor deserves the sharpest steel! My anvil rings in your name, Hero!',
      infamous: 'Cold steel cares not for morality, only strength. Bring me iron, and I will forge terror.',
      neutral: 'The bellows are hot and the iron is ready. What weapon shall we hammer out today?',
    },
    dialogues: [
      {
        id: 'goran_1',
        text: 'Bring me ore from your campaigns. With enough meteorite iron, we can awaken runic equipment.',
        textRu: 'Приноси руду из походов. С метеоритным железом я смогу выковать руническое снаряжение.',
        serviceAction: 'open_forge',
      },
    ],
  },

  npc_merchant_lyanna: {
    id: 'npc_merchant_lyanna',
    nameKey: 'settlement.npc.lyanna.name',
    defaultName: 'Lyanna the Far-Trader',
    titleKey: 'settlement.npc.lyanna.title',
    defaultTitle: 'Silk & Relic Broker',
    role: 'Market & Exotic Trade',
    linkedBuildingId: 'market',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'Always a pleasure dealing with a righteous protector! I have reserved our finest wares for you.',
      infamous: 'I ask no questions about how you acquired those treasures... Gold is gold, my friend.',
      neutral: 'Welcome to the Bazaar! Rare stones, blueprints, treats for your companions — take a look!',
    },
    dialogues: [
      {
        id: 'lyanna_1',
        text: 'My trade caravans just arrived from the Eastern Sands with exotic crafting essences.',
        textRu: 'Мои караваны только что прибыли из Восточных Песков с редкими эссенциями для крафта.',
        serviceAction: 'open_market',
      },
    ],
  },

  npc_captain_valerius: {
    id: 'npc_captain_valerius',
    nameKey: 'settlement.npc.valerius.name',
    defaultName: 'Captain Valerius',
    titleKey: 'settlement.npc.valerius.title',
    defaultTitle: 'Fortress Vanguard Commander',
    role: 'Settlement Defense & Patrols',
    linkedBuildingId: 'barracks',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'The guards stand proud under your just banner. We will lay down our lives for the realm!',
      infamous: 'Discipline is ironclad. None dare whisper defiance in our ranks, Sovereign.',
      neutral: 'Perimeter patrols report goblin activity near the river. Our defense rating remains vigilant.',
    },
    dialogues: [
      {
        id: 'valerius_1',
        text: 'High defense ratings suppress monster raid frequency and grant combat damage reduction.',
        textRu: 'Высокий рейтинг защиты снижает частоту набегов и дает снижение получаемого урона.',
        serviceAction: 'claim_daily_bounty',
      },
    ],
  },

  npc_alchemist_zara: {
    id: 'npc_alchemist_zara',
    nameKey: 'settlement.npc.zara.name',
    defaultName: 'Apothecary Zara',
    titleKey: 'settlement.npc.zara.title',
    defaultTitle: 'Arcane Herbalist & Brewer',
    role: 'Potions & Combat Elixirs',
    linkedBuildingId: 'alchemy',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M10 2v7.31L4.62 17.5A2 2 0 0 0 6.38 20.5h11.24a2 2 0 0 0 1.76-3L14 9.31V2"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'Your pure soul resonates with celestial herbs. May these soothing elixirs heal your party.',
      infamous: 'Ah, a kindred spirit of forbidden brews... Nether venoms and corrosive draughts await.',
      neutral: 'Careful around the alembic! A drop of spirit moss can turn lead into liquid fire.',
    },
    dialogues: [
      {
        id: 'zara_1',
        text: 'Brewing combat draughts boosts critical strikes and reduces ability cooldowns.',
        textRu: 'Боевые эликсиры увеличивают шанс крита и ускоряют перезарядку способностей.',
        serviceAction: 'open_alchemy',
      },
    ],
  },

  npc_innkeeper_milo: {
    id: 'npc_innkeeper_milo',
    nameKey: 'settlement.npc.milo.name',
    defaultName: 'Milo the Stout',
    titleKey: 'settlement.npc.milo.title',
    defaultTitle: 'Gryphon Master of Hops',
    role: 'Tavernkeeper & Rumor Master',
    linkedBuildingId: 'tavern',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M17 11h1a3 3 0 0 1 0 6h-1M5 5h12v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5zM9 1v4M13 1v4"/></svg>`,
    karmaDialogueVariants: {
      virtuous: 'A round on the house for the realm’s savior! The bards sing of your triumphs tonight!',
      infamous: 'Keep the peace in here, Sovereign... The mercenaries are nervous around your dark aura.',
      neutral: 'Pull up a stool by the hearth! Hear the latest rumors or hire traveling sellswords.',
    },
    dialogues: [
      {
        id: 'milo_1',
        text: 'Wandering mercenaries rest here between contracts. Want to hire extra blades for your team?',
        textRu: 'Странствующие наемники отдыхают здесь между контрактами. Хотите нанять бойцов?',
        serviceAction: 'open_tavern',
      },
    ],
  },
};

export function getSettlementNPCDef(id: SettlementNPCId): SettlementNPCDefinition | undefined {
  return SETTLEMENT_NPCS[id];
}

export function getAllSettlementNPCDefs(): SettlementNPCDefinition[] {
  return Object.values(SETTLEMENT_NPCS);
}
