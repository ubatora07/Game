const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 1. Generate CAMPAIGN_SIMULATION.csv (50 stages)
const campaignRows = [
  'WorldId,StageId,StageNumber,GlobalIndex,IsBoss,BaseHp,NormalGoldReward,NormalPowerReward,BossCrystals,BossEssence,BossSouls,ExpectedClearSeconds'
];

for (let w = 1; w <= 5; w++) {
  for (let s = 1; s <= 10; s++) {
    const globalIdx = (w - 1) * 10 + s;
    const isBoss = s === 5 || s === 10;
    const isMajorBoss = s === 10;
    const baseHp = Math.floor(40 * Math.pow(1.26, globalIdx - 1) * (isMajorBoss ? 4.5 : isBoss ? 2.5 : 1.0));
    const gold = Math.floor(15 * Math.pow(1.22, globalIdx - 1));
    const power = Math.floor(25 * Math.pow(1.24, globalIdx - 1));
    const crystals = isMajorBoss ? 50 * w : isBoss ? 25 * w : 0;
    const essence = isMajorBoss ? 15 * w : isBoss ? 5 * w : 0;
    const souls = isMajorBoss ? 5 * w : 0;
    const clearSec = isMajorBoss ? 25 : isBoss ? 18 : 8;

    campaignRows.push(
      `${w},${w}-${s},${s},${globalIdx},${isBoss ? 'YES' : 'NO'},${baseHp},${gold},${power},${crystals},${essence},${souls},${clearSec}`
    );
  }
}
fs.writeFileSync(path.join(docsDir, 'CAMPAIGN_SIMULATION.csv'), campaignRows.join('\n'), 'utf8');

// 2. Generate RUN_SIMULATION.csv (Runs 1 to 20)
const runRows = [
  'RunIndex,DurationMinutes,LifetimePower,SoulsEarned,TotalSouls,HighestStage,HighestRank,SpeedupFactor'
];

let totalSouls = 0;
for (let r = 1; r <= 20; r++) {
  const durationMin = 30;
  const power = Math.floor(1e6 * Math.pow(2.2, r - 1));
  const soulsEarned = Math.floor(10 * Math.pow(1.8, r - 1));
  totalSouls += soulsEarned;
  const highestStageWorld = Math.min(5, Math.floor(1 + r * 0.3));
  const highestStageNum = Math.min(10, (r * 2) % 10 + 1);
  const highestRank = r === 1 ? 'Rank D' : r <= 3 ? 'Rank C' : r <= 6 ? 'Rank B' : r <= 10 ? 'Rank A' : r <= 15 ? 'Rank S' : 'Rank Awakened';
  const speedup = (1 + (r - 1) * 0.45).toFixed(2);

  runRows.push(
    `${r},${durationMin},${power},${soulsEarned},${totalSouls},${highestStageWorld}-${highestStageNum},${highestRank},${speedup}x`
  );
}
fs.writeFileSync(path.join(docsDir, 'RUN_SIMULATION.csv'), runRows.join('\n'), 'utf8');

// 3. Generate TOWER_VS_CAMPAIGN_REWARDS.csv
const towerVsCampaignRows = [
  'MilestoneTier,TowerFloor,TowerRewardType,TowerRewardValue,CampaignStage,CampaignGoldPerMinute,CampaignPowerPerMinute,SynergyAssessment'
];

const tiers = [
  { tier: 'Early (World 1)', floor: 5, tRew: '50 Gems + 10 Essence', cStage: '1-5', cGold: '240/min', cPow: '450/min', syn: 'Balanced — Tower gives gacha gems, Campaign gives steady gold' },
  { tier: 'Mid (World 2)', floor: 15, tRew: '150 Gems + 25 Essence', cStage: '2-5', cGold: '1.8k/min', cPow: '3.2k/min', syn: 'Tower accelerates hero star promotion, Campaign funds Sect dojos' },
  { tier: 'Late (World 3)', floor: 30, tRew: '350 Gems + 60 Essence', cStage: '3-5', cGold: '24k/min', cPow: '48k/min', syn: 'Complementary — Hero upgrades directly boost Campaign wave clear' },
  { tier: 'Endgame (World 4)', floor: 50, tRew: '750 Gems + 150 Essence', cStage: '4-5', cGold: '380k/min', cPow: '820k/min', syn: 'High synergy with Samsara rush buffs' },
  { tier: 'Master (World 5)', floor: 75, tRew: '1500 Gems + 300 Essence', cStage: '5-10', cGold: '6.5M/min', cPow: '14M/min', syn: 'Infinite scaling endpoint — neither obsoletes the other' },
];

tiers.forEach(t => {
  towerVsCampaignRows.push(
    `"${t.tier}",${t.floor},"${t.tRew}",${t.floor * 100},${t.cStage},${t.cGold},${t.cPow},"${t.syn}"`
  );
});
fs.writeFileSync(path.join(docsDir, 'TOWER_VS_CAMPAIGN_REWARDS.csv'), towerVsCampaignRows.join('\n'), 'utf8');

// 4. Generate HERO_EXPECTED_VALUE.csv
const heroRows = [
  'Rarity,PullRatePct,ExpectedCostDiamonds,DuplicateEssence,Star1Multiplier,Star2Multiplier,Star3Multiplier,Star4Multiplier,Star5Multiplier,Star5TotalCostEssence'
];

const heroConfig = [
  { rarity: 'Common', rate: 55, cost: 182, dup: 10, s1: '1.0x', s2: '1.3x', s3: '1.6x', s4: '1.9x', s5: '2.2x', totEss: 150 },
  { rarity: 'Rare', rate: 28, cost: 357, dup: 25, s1: '1.0x', s2: '1.3x', s3: '1.6x', s4: '1.9x', s5: '2.2x', totEss: 375 },
  { rarity: 'Epic', rate: 12, cost: 833, dup: 75, s1: '1.0x', s2: '1.3x', s3: '1.6x', s4: '1.9x', s5: '2.2x', totEss: 1125 },
  { rarity: 'Legendary', rate: 4, cost: 2500, dup: 250, s1: '1.0x', s2: '1.3x', s3: '1.6x', s4: '1.9x', s5: '2.2x', totEss: 3750 },
  { rarity: 'Mythic', rate: 1, cost: 10000, dup: 1000, s1: '1.0x', s2: '1.3x', s3: '1.6x', s4: '1.9x', s5: '2.2x', totEss: 15000 },
];

heroConfig.forEach(h => {
  heroRows.push(
    `${h.rarity},${h.rate}%,${h.cost},${h.dup},${h.s1},${h.s2},${h.s3},${h.s4},${h.s5},${h.totEss}`
  );
});
fs.writeFileSync(path.join(docsDir, 'HERO_EXPECTED_VALUE.csv'), heroRows.join('\n'), 'utf8');

console.log('[Balance v4 Lock] Successfully generated all 4 CSV reports into docs/');
