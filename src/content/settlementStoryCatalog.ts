import { StoryChapterDefinition } from '../core/settlement/SettlementStoryTypes';

export const SETTLEMENT_CHAPTERS: StoryChapterDefinition[] = [
  {
    id: 'chap_1_haven_reclaimed',
    chapterNumber: 1,
    titleKey: 'story.chap1.title',
    defaultTitle: 'Chapter I: A Haven Reclaimed',
    summary: 'Clear the ancient overgrown ruins of Mountain Haven and lay the foundations for agricultural and lumber production.',
    loreIntro: 'Elder Aldric leans heavily upon his weathered oak staff, gazing upon the crumbled stones of Mountain Haven. "A thousand years ago, travelers found sanctuary here beneath the mist-veiled peaks. We can make it flourish once again."',
    loreOutro: 'Smoke rises peacefully from newly constructed hearths. Farmers sow fertile mountain soil, and children play near the central well. Mountain Haven breathes anew.',
    npcSpeaker: 'Elder Aldric',
    objectives: [
      { id: 'obj_settlement_lv1', desc: 'Unlock Mountain Haven (Settlement Level 1)', type: 'settlement_level', targetValue: 1 },
      { id: 'obj_build_3_structures', desc: 'Construct at least 2 settlement buildings', type: 'buildings_count', targetValue: 2 },
    ],
    rewards: {
      gold: 2000,
      crystals: 50,
      settlementWood: 100,
      settlementStone: 50,
      titleId: 'title_pioneer_lord',
    },
  },

  {
    id: 'chap_2_iron_vanguard',
    chapterNumber: 2,
    titleKey: 'story.chap2.title',
    defaultTitle: 'Chapter II: The Iron Vanguard',
    summary: 'Establish the Settlement Blacksmith Forge, equip our defenders, and withstand the goblin raider vanguard.',
    loreIntro: 'Master Goran wipes sweat from his brow before the roaring stone furnace. "The mountain hides iron and starlight ores, but raiders circle our borders like wolves. Give me coal and steel, and I will forge you armor that breaks giant axes!"',
    loreOutro: 'The raider warband breaks upon the Haven palisades. Polished steel breastplates shine under the sun. Mountain Haven is no longer an easy target.',
    npcSpeaker: 'Master Goran',
    objectives: [
      { id: 'obj_repel_raid_1', desc: 'Successfully repel 1 settlement raid', type: 'raids_defeated', targetValue: 1 },
      { id: 'obj_craft_1_gear', desc: 'Forge or craft 1 piece of equipment', type: 'craft_equipment', targetValue: 1 },
    ],
    rewards: {
      gold: 4500,
      crystals: 100,
      settlementIron: 50,
      titleId: 'title_goblin_slayer',
    },
  },

  {
    id: 'chap_3_crossroads_commerce',
    chapterNumber: 3,
    titleKey: 'story.chap3.title',
    defaultTitle: 'Chapter III: Crossroads of Commerce',
    summary: 'Upgrade Mountain Haven to Level 2, establish the grand bazaar, and recruit mercenary vanguard defenders.',
    loreIntro: 'Lyanna the Botanist arranges fragrant herbs and crystal tinctures. "Word travels across the passes. Merchants and mercenaries from all corners are seeking shelter under our banner. We must welcome them with open markets."',
    loreOutro: 'The Haven Bazaar is bustling with merchants, sellswords, and alchemists. Coin flows into the treasury, and trade caravans line the cobblestone road.',
    npcSpeaker: 'Lyanna the Herbalist',
    objectives: [
      { id: 'obj_settlement_lv2', desc: 'Upgrade Mountain Haven to Level 2', type: 'settlement_level', targetValue: 2 },
      { id: 'obj_hire_merc', desc: 'Contract 1 mercenary from the Tavern Guild', type: 'hire_mercenary', targetValue: 1 },
    ],
    rewards: {
      gold: 10000,
      crystals: 200,
      settlementWood: 250,
      settlementStone: 250,
      titleId: 'title_baron_of_commerce',
    },
  },

  {
    id: 'chap_4_mountain_citadel',
    chapterNumber: 4,
    titleKey: 'story.chap4.title',
    defaultTitle: 'Chapter IV: Sovereign Mountain Citadel',
    summary: 'Raise the Great Mountain Citadel, achieve Level 3 settlement, and repel the great siege.',
    loreIntro: 'Aldric and Goran stand together atop the stone ramparts. "The high wyrms and bandit lords have gathered their armies for a final assault. Hold the walls today, and Mountain Haven shall stand eternal!"',
    loreOutro: 'The battlefield falls silent. The enemy flags lie broken in the snow. Mountain Haven stands as the sovereign capital of the realm, blessed by destiny.',
    npcSpeaker: 'Elder Aldric & Goran',
    objectives: [
      { id: 'obj_settlement_lv3', desc: 'Achieve Settlement Level 3 Citadel', type: 'settlement_level', targetValue: 3 },
      { id: 'obj_repel_3_raids', desc: 'Repel 3 settlement raids in total', type: 'raids_defeated', targetValue: 3 },
    ],
    rewards: {
      gold: 30000,
      crystals: 500,
      titleId: 'title_grand_architect',
    },
  },
];

export function getChapterDefinition(id: string): StoryChapterDefinition | undefined {
  return SETTLEMENT_CHAPTERS.find((c) => c.id === id);
}

export function getAllChapters(): StoryChapterDefinition[] {
  return SETTLEMENT_CHAPTERS;
}
