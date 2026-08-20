/**
 * 60-Minute & Progression Balance Simulator for Fantasy Idle Clicker RPG Beta 0.1
 */

const WORLDS = {
  1: { id: 1, name: 'Greenvale', maxStages: 10, enemiesPerStage: 5, baseHp: 40, hpGrowth: 1.35, baseGold: 5, goldGrowth: 1.28 },
  2: { id: 2, name: 'Whisperwood', maxStages: 10, enemiesPerStage: 5, baseHp: 1800, hpGrowth: 1.40, baseGold: 220, goldGrowth: 1.32 },
  3: { id: 3, name: 'Broken Highlands', maxStages: 10, enemiesPerStage: 5, baseHp: 85000, hpGrowth: 1.45, baseGold: 9500, goldGrowth: 1.36 },
};

const HERO_UPGRADES = {
  damage: { baseCost: 10, costGrowth: 1.15, baseValue: 10, valuePerLevel: 3, milestones: [10, 25, 50, 100, 250] },
  click_damage: { baseCost: 15, costGrowth: 1.14, baseValue: 6, valuePerLevel: 2.5, milestones: [10, 25, 50, 100, 250] },
  attack_speed: { baseCost: 50, costGrowth: 1.25, baseValue: 1.0, valuePerLevel: 0.02, maxLevel: 100, milestones: [10, 25, 50, 100] },
  crit_chance: { baseCost: 100, costGrowth: 1.28, baseValue: 0.05, valuePerLevel: 0.01, maxLevel: 50, milestones: [10, 25, 50] },
  gold_find: { baseCost: 75, costGrowth: 1.20, baseValue: 1.0, valuePerLevel: 0.05, milestones: [10, 25, 50, 100, 250] },
};

function calculateMilestoneMultiplier(level, milestones) {
  let mult = 1.0;
  for (const m of milestones) {
    if (level >= m) mult *= 2.0;
  }
  return mult;
}

function calculateLegacyPointsYield(lifetimeGold, highestWorld, highestStage) {
  if (lifetimeGold < 1000 && highestWorld <= 1 && highestStage <= 2) return 0;
  const goldPart = Math.floor(Math.pow(lifetimeGold / 25000, 0.5));
  const worldPart = Math.max(0, (highestWorld - 1) * 20);
  const stagePart = Math.max(0, highestStage * 2);
  return Math.max(1, goldPart + worldPart + stagePart);
}

function calculateCombatStats(state) {
  const dmgDef = HERO_UPGRADES.damage;
  const dmgLvl = state.upgrades.damage;
  const dmgMilestone = calculateMilestoneMultiplier(dmgLvl, dmgDef.milestones);
  let baseDmg = (dmgDef.baseValue + dmgLvl * dmgDef.valuePerLevel) * dmgMilestone;

  const clickDef = HERO_UPGRADES.click_damage;
  const clickLvl = state.upgrades.click_damage;
  const clickMilestone = calculateMilestoneMultiplier(clickLvl, clickDef.milestones);
  let baseClick = (clickDef.baseValue + clickLvl * clickDef.valuePerLevel) * clickMilestone;

  const spdDef = HERO_UPGRADES.attack_speed;
  const spdLvl = state.upgrades.attack_speed;
  let baseSpeed = spdDef.baseValue + spdLvl * spdDef.valuePerLevel;

  const critDef = HERO_UPGRADES.crit_chance;
  const critLvl = state.upgrades.crit_chance;
  let baseCrit = Math.min(0.75, critDef.baseValue + critLvl * critDef.valuePerLevel);

  const goldDef = HERO_UPGRADES.gold_find;
  const goldLvl = state.upgrades.gold_find;
  let baseGold = goldDef.baseValue + goldLvl * goldDef.valuePerLevel;

  const vetBonus = (state.legacy.upgrades.veteran || 0) * 0.10;
  baseDmg *= 1 + vetBonus;
  baseClick *= 1 + vetBonus;

  const critMultiplier = 2.5;
  const effectiveDamagePerHit = baseDmg * (1 - baseCrit) + (baseDmg * critMultiplier) * baseCrit;
  const dps = Math.round(effectiveDamagePerHit * baseSpeed);
  const totalPower = Math.round(dps + baseClick * 2 + baseGold * 50);

  return {
    heroDamage: Math.max(1, Math.round(baseDmg)),
    clickDamage: Math.max(1, Math.round(baseClick)),
    attacksPerSecond: Number(baseSpeed.toFixed(2)),
    dps: Math.max(1, dps),
    critChance: baseCrit,
    critMultiplier,
    goldFindMultiplier: baseGold,
    totalPower,
  };
}

function calculateUpgradeCost(id, currentLevel) {
  const def = HERO_UPGRADES[id];
  return Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel));
}

function runSimulation(activeClickRate = 3.0) { // 3 clicks/sec for active player
  const state = {
    hero: { level: 1, xp: 0, xpToNext: 20 },
    currencies: { gold: 0, lifetimeGold: 0, lifetimeKills: 0, lifetimeBossKills: 0, legacyPoints: 0 },
    world: { currentWorldId: 1, currentStageNumber: 1, waveProgress: 0, highestWorld: 1, highestStage: 1 },
    upgrades: { damage: 1, click_damage: 1, attack_speed: 1, crit_chance: 0, gold_find: 0 },
    gear: { equipped: { weapon: null, armor: null, ring: null }, inventory: [] },
    legacy: { legacyCount: 0, upgrades: { veteran: 0, treasure_hunter: 0, swift_strikes: 0, idle_mastery: 0 } },
  };

  let simTime = 0; // in seconds
  const maxTime = 3600; // 60 minutes
  const milestonesReached = {
    firstBossTime: null,
    world2Time: null,
    world3Time: null,
    firstLegacyTime: null,
  };

  let activeEnemy = null;
  let travelTimer = 0.8;
  let autoAttackTimer = 0;
  let clickTimer = 0;

  while (simTime < maxTime) {
    const dt = 0.05; // 50ms ticks
    simTime += dt;

    const stats = calculateCombatStats(state);

    // AI upgrades priority
    const upgKeys = ['damage', 'click_damage', 'gold_find', 'attack_speed', 'crit_chance'];
    for (const key of upgKeys) {
      const cost = calculateUpgradeCost(key, state.upgrades[key]);
      if (state.currencies.gold >= cost) {
        state.currencies.gold -= cost;
        state.upgrades[key] += 1;
        break;
      }
    }

    // Check potential legacy
    const potLP = calculateLegacyPointsYield(state.currencies.lifetimeGold, state.world.highestWorld, state.world.highestStage);
    if (potLP >= 10 && !milestonesReached.firstLegacyTime) {
      milestonesReached.firstLegacyTime = Math.round(simTime);
    }

    if (!activeEnemy) {
      travelTimer -= dt;
      if (travelTimer <= 0) {
        // Spawn
        const wDef = WORLDS[state.world.currentWorldId];
        const isBoss = state.world.currentStageNumber === wDef.maxStages;
        const stageMult = Math.pow(wDef.hpGrowth, state.world.currentStageNumber - 1);
        const hp = Math.max(10, Math.floor(wDef.baseHp * stageMult * (isBoss ? 5.5 : 1.0)));
        const gold = Math.max(1, Math.floor(wDef.baseGold * Math.pow(wDef.goldGrowth, state.world.currentStageNumber - 1) * (isBoss ? 6.0 : 1.0) * stats.goldFindMultiplier));

        activeEnemy = { hp, maxHp: hp, gold, isBoss };
        if (isBoss && !milestonesReached.firstBossTime && state.world.currentWorldId === 1) {
          milestonesReached.firstBossTime = Math.round(simTime);
        }
      }
    } else {
      // Fighting
      autoAttackTimer += dt;
      if (autoAttackTimer >= 1 / stats.attacksPerSecond) {
        autoAttackTimer = 0;
        const isCrit = Math.random() < stats.critChance;
        const dmg = isCrit ? stats.heroDamage * stats.critMultiplier : stats.heroDamage;
        activeEnemy.hp -= dmg;
      }

      // Active Clicks
      clickTimer += dt;
      if (clickTimer >= 1 / activeClickRate) {
        clickTimer = 0;
        const isCrit = Math.random() < stats.critChance;
        const dmg = isCrit ? stats.clickDamage * stats.critMultiplier : stats.clickDamage;
        activeEnemy.hp -= dmg;
      }

      if (activeEnemy.hp <= 0) {
        // Defeated
        state.currencies.gold += activeEnemy.gold;
        state.currencies.lifetimeGold += activeEnemy.gold;
        state.currencies.lifetimeKills += 1;
        if (activeEnemy.isBoss) state.currencies.lifetimeBossKills += 1;

        if (activeEnemy.isBoss) {
          if (state.world.currentWorldId === 1 && !milestonesReached.world2Time) {
            milestonesReached.world2Time = Math.round(simTime);
          } else if (state.world.currentWorldId === 2 && !milestonesReached.world3Time) {
            milestonesReached.world3Time = Math.round(simTime);
          }

          if (state.world.currentWorldId < 3) {
            state.world.currentWorldId += 1;
            state.world.currentStageNumber = 1;
          }
        } else {
          state.world.waveProgress += 1;
          if (state.world.waveProgress >= 5) {
            state.world.waveProgress = 0;
            state.world.currentStageNumber += 1;
          }
        }

        state.world.highestWorld = Math.max(state.world.highestWorld, state.world.currentWorldId);
        state.world.highestStage = Math.max(state.world.highestStage, state.world.currentStageNumber);

        activeEnemy = null;
        travelTimer = 0.8;
      }
    }
  }

  const finalStats = calculateCombatStats(state);
  return {
    milestonesReached,
    finalState: {
      world: state.world.currentWorldId,
      stage: state.world.currentStageNumber,
      lifetimeGold: state.currencies.lifetimeGold,
      kills: state.currencies.lifetimeKills,
      dps: finalStats.dps,
      power: finalStats.totalPower,
    },
  };
}

console.log('--- FANTASY IDLE RPG 60-MINUTE PROGRESSION SIMULATION ---');
const res = runSimulation(3.0);
console.log('Results:');
console.log(`- Time to First Boss (W1 Stage 10): ${res.milestonesReached.firstBossTime ? `${Math.floor(res.milestonesReached.firstBossTime / 60)}m ${res.milestonesReached.firstBossTime % 60}s` : 'Not reached'}`);
console.log(`- Time to World 2 (Whisperwood): ${res.milestonesReached.world2Time ? `${Math.floor(res.milestonesReached.world2Time / 60)}m ${res.milestonesReached.world2Time % 60}s` : 'Not reached'}`);
console.log(`- Time to World 3 (Broken Highlands): ${res.milestonesReached.world3Time ? `${Math.floor(res.milestonesReached.world3Time / 60)}m ${res.milestonesReached.world3Time % 60}s` : 'Not reached'}`);
console.log(`- Time to First Meaningful Legacy: ${res.milestonesReached.firstLegacyTime ? `${Math.floor(res.milestonesReached.firstLegacyTime / 60)}m ${res.milestonesReached.firstLegacyTime % 60}s` : 'Not reached'}`);
console.log(`- Final 60m Power: ${res.finalState.power}, DPS: ${res.finalState.dps}, Kills: ${res.finalState.kills}, Gold: ${res.finalState.lifetimeGold}`);
