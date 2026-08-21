import { GameStateData, createInitialState } from '../../core/GameState';
import { PreviewStatePreset } from '../EditorTypes';

export function createMockStatePreset(preset: PreviewStatePreset, realSnapshot?: GameStateData): GameStateData {
  const base = JSON.parse(JSON.stringify(realSnapshot || createInitialState())) as GameStateData;

  switch (preset) {
    case 'real_snapshot':
      return base;

    case 'mock_empty':
      return {
        ...base,
        power: 0,
        gold: 0,
        crystals: 150,
        souls: 0,
        rankId: 'E',
        rankIndex: 0,
        campaign: {
          currentWorldId: 1,
          currentStageId: '1-1',
          currentEncounter: 0,
          highestWorldReached: 1,
          highestStageReached: '1-1',
          firstClears: [],
          campaignMode: 'progress',
          autoAdvance: true,
          farmStageId: '1-1',
          bossRetryState: null,
        },
        heroes: {},
        buildings: {},
        upgrades: {},
      };

    case 'mock_normal':
      return {
        ...base,
        power: 850000,
        gold: 145000,
        crystals: 420,
        souls: 18,
        rankId: 'B',
        rankIndex: 3,
        campaign: {
          currentWorldId: 1,
          currentStageId: '1-8',
          currentEncounter: 3,
          highestWorldReached: 1,
          highestStageReached: '1-8',
          firstClears: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7'],
          campaignMode: 'progress',
          autoAdvance: true,
          farmStageId: '1-7',
          bossRetryState: null,
        },
        buildings: {
          dojo: 35,
          meditation: 20,
          shrine: 12,
          academy: 5,
        },
        heroes: {
          hero_hiro: { stars: 2, duplicates: 14 },
          hero_mei: { stars: 1, duplicates: 8 },
        },
      };

    case 'mock_rich':
      return {
        ...base,
        power: 2800000000,
        gold: 450000000,
        crystals: 12500,
        souls: 650,
        rankId: 'S',
        rankIndex: 5,
        campaign: {
          currentWorldId: 3,
          currentStageId: '3-5',
          currentEncounter: 4,
          highestWorldReached: 3,
          highestStageReached: '3-5',
          firstClears: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-8', '2-9', '2-10'],
          campaignMode: 'progress',
          autoAdvance: true,
          farmStageId: '3-4',
          bossRetryState: null,
        },
        buildings: {
          dojo: 150,
          meditation: 120,
          shrine: 90,
          academy: 75,
          forge: 50,
          reactor: 30,
          temple: 15,
        },
        heroes: {
          hero_hiro: { stars: 4, duplicates: 40 },
          hero_sora: { stars: 3, duplicates: 22 },
          hero_kuro: { stars: 2, duplicates: 15 },
        },
      };

    case 'mock_boss':
      return {
        ...base,
        power: 45000000,
        gold: 8900000,
        crystals: 850,
        souls: 45,
        rankId: 'A',
        rankIndex: 4,
        campaign: {
          currentWorldId: 1,
          currentStageId: '1-10',
          currentEncounter: 0,
          highestWorldReached: 1,
          highestStageReached: '1-10',
          firstClears: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9'],
          campaignMode: 'progress',
          autoAdvance: false,
          farmStageId: '1-9',
          bossRetryState: null,
        },
        buildings: {
          dojo: 80,
          meditation: 60,
          shrine: 45,
          academy: 30,
          forge: 15,
        },
        heroes: {
          hero_hiro: { stars: 3, duplicates: 18 },
          hero_ren: { stars: 2, duplicates: 10 },
        },
      };

    case 'mock_maxed':
      return {
        ...base,
        power: 500000000000000,
        gold: 85000000000000,
        crystals: 99999,
        souls: 85000,
        rankId: 'IMMORTAL',
        rankIndex: 8,
        reincarnationCount: 25,
        campaign: {
          currentWorldId: 5,
          currentStageId: '5-10',
          currentEncounter: 0,
          highestWorldReached: 5,
          highestStageReached: '5-10',
          firstClears: ['1-10', '2-10', '3-10', '4-10'],
          campaignMode: 'progress',
          autoAdvance: true,
          farmStageId: '5-9',
          bossRetryState: null,
        },
        buildings: {
          dojo: 500,
          meditation: 450,
          shrine: 400,
          academy: 350,
          forge: 300,
          reactor: 250,
          temple: 200,
          gate: 150,
          star_fortress: 100,
          infinite_core: 50,
        },
        heroes: {
          hero_hiro: { stars: 5, duplicates: 100 },
          hero_kuro: { stars: 5, duplicates: 100 },
          hero_tsukiko: { stars: 5, duplicates: 100 },
        },
      };
  }
}
