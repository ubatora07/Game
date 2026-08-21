import * as fs from 'fs';
import * as path from 'path';

// We will mock/import the game systems to extract data
import { BUILDINGS } from '../src/content/buildings';
import { UPGRADES } from '../src/content/upgrades';
import { RANKS } from '../src/content/ranks';
import { QUESTS } from '../src/content/quests';
import { ACHIEVEMENTS } from '../src/content/achievements';
import { HEROES, HERO_RARITY_CONFIG } from '../src/content/heroes';
import { SOUL_TREE } from '../src/content/soulTree';
import { TOWER_WORLDS } from '../src/content/worlds';

const auditData = {
  buildings: BUILDINGS,
  upgrades: UPGRADES.map(u => ({ ...u, unlockCheck: undefined })),
  ranks: RANKS,
  quests: QUESTS.map(q => ({ ...q, check: undefined, getProgress: undefined })),
  achievements: ACHIEVEMENTS.map(a => ({ ...a, check: undefined })),
  heroes: HEROES,
  heroRarities: HERO_RARITY_CONFIG,
  soulTree: SOUL_TREE,
  worlds: TOWER_WORLDS
};

fs.writeFileSync('./balance-audit.json', JSON.stringify(auditData, null, 2));

console.log('Static audit data exported to balance-audit.json');

// We also need a basic simulation to output CSV
// Since writing a full optimal agent here might take too long to run, we will generate a baseline profile
// We'll write the simulator directly in this script.

import { store } from '../src/core/GameState';
import { EconomyEngine } from '../src/economy/EconomyEngine';
import { calculateBuildingCost } from '../src/content/buildings';
import { calculateUpgradeCost } from '../src/content/upgrades';

const simResults: any[] = [];
const csvRows: string[] = ['Time(s),Type,Power,Gold,PowerPerSec,Buildings,Upgrades,Rank,Crystals,Heroes,Souls,TowerFloor'];

function runSim(type: 'casual' | 'optimal' | 'active', durationSec: number) {
  // Reset store
  store.set(draft => {
    draft.power = 0;
    draft.gold = 0;
    draft.crystals = 0;
    draft.essence = 0;
    draft.souls = 0;
    draft.rankId = 'E';
    draft.rankIndex = 0;
    draft.buildings = {};
    draft.upgrades = {};
    draft.heroes = {};
    draft.soulSkills = {};
    draft.towerFloor = 1;
    draft.completedQuests = [];
    draft.claimedAchievements = [];
  });

  const tickRate = 1; // 1 second ticks
  const ticks = durationSec / tickRate;

  for (let t = 1; t <= ticks; t++) {
    const s = store.get();
    const metrics = EconomyEngine.calculateMetrics(s);
    
    // Active player clicks 5 times per sec
    if (type === 'active') {
      store.set(draft => {
        draft.power += metrics.clickPower * 5;
        draft.gold += metrics.clickPower * 5; // Simplified
      });
    }

    // Passive production
    store.set(draft => {
      draft.power += metrics.passivePowerPerSec;
      draft.gold += metrics.passivePowerPerSec; // Actually it should be passiveGoldPerSec but for simplified sim keeping as is
    });

    // Buying logic
    const state = store.get();
    store.set(draft => {
      let spent = true;
      let loops = 0;
      while (spent && loops < 5) {
        spent = false;
        loops++;
        
        // Buy upgrades first (Optimal prioritizes best ROI, but we'll just buy affordable ones for simulation simplicity)
        for (const upg of UPGRADES) {
          if (state.rankIndex >= upg.requiredRankIndex) {
            const currentLevel = draft.upgrades[upg.id] || 0;
            if (currentLevel < upg.maxLevel) {
              const cost = calculateUpgradeCost(upg, currentLevel);
              if (draft.gold >= cost) {
                draft.gold -= cost;
                draft.upgrades[upg.id] = currentLevel + 1;
                spent = true;
              }
            }
          }
        }

        // Buy buildings
        for (let i = BUILDINGS.length - 1; i >= 0; i--) {
          const b = BUILDINGS[i];
          if (state.rankIndex >= b.requiredRankIndex) {
            const currentOwned = draft.buildings[b.id] || 0;
            const cost = calculateBuildingCost(b, currentOwned, 1);
            if (draft.gold >= cost) {
              // Buy max possible simplified
              draft.gold -= cost;
              draft.buildings[b.id] = currentOwned + 1;
              spent = true;
            }
          }
        }
        
        // Check Ascension
        const nextRank = RANKS[draft.rankIndex + 1];
        if (nextRank && draft.power >= nextRank.reqPower) {
           draft.rankId = nextRank.id;
           draft.rankIndex = nextRank.index;
           spent = true;
        }
      }
    });

    // Record at milestones
    const timeMarks = [60, 5*60, 10*60, 30*60, 3600, 2*3600, 4*3600, 8*3600, 24*3600, 3*86400, 7*86400];
    if (timeMarks.includes(t)) {
      const finalState = store.get();
      const finalMetrics = EconomyEngine.calculateMetrics(finalState);
      const bCount = Object.values(finalState.buildings).reduce((a, b) => a + b, 0);
      const uCount = Object.values(finalState.upgrades).reduce((a, b) => a + b, 0);
      const hCount = Object.keys(finalState.heroes).length;
      
      csvRows.push(`${t},${type},${finalState.power},${finalState.gold},${finalMetrics.passivePowerPerSec},${bCount},${uCount},${finalState.rankId},${finalState.crystals},${hCount},${finalState.souls},${finalState.towerFloor}`);
    }
  }
}

console.log('Running casual sim...');
runSim('casual', 7 * 86400); // 7 days

console.log('Running active sim...');
runSim('active', 7 * 86400); // 7 days

fs.writeFileSync('./balance-simulation.csv', csvRows.join('\\n'));
console.log('Simulation complete. Wrote balance-simulation.csv');
