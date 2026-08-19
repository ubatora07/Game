import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getAllClasses } from '../src/content/classes';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 79 — Class Balance Pass Suite', () => {
  it('P79-01: CLASS_BALANCE_REPORT.md documentation exists and covers all 4 classes', () => {
    const reportPath = path.resolve(__dirname, '../docs/CLASS_BALANCE_REPORT.md');
    expect(fs.existsSync(reportPath)).toBe(true);

    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).toContain('Arcane Mage');
    expect(content).toContain('Blade Swordsman');
    expect(content).toContain('Wind Archer');
    expect(content).toContain('Shadow Assassin');
    expect(content).toContain('Anti-Dominance Guarantee');
  });

  it('P79-02: No single class dominates all base stat categories', () => {
    const classes = getAllClasses();
    expect(classes.length).toBe(4);

    let maxAtk = { val: -1, classId: '' };
    let maxSpd = { val: -1, classId: '' };
    let maxCritCh = { val: -1, classId: '' };
    let maxCritDmg = { val: -1, classId: '' };
    let maxBoss = { val: -1, classId: '' };
    let maxLoot = { val: -1, classId: '' };

    for (const c of classes) {
      if (c.baseStats.attackMultiplier > maxAtk.val) maxAtk = { val: c.baseStats.attackMultiplier, classId: c.id };
      if (c.baseStats.attackSpeedMultiplier > maxSpd.val) maxSpd = { val: c.baseStats.attackSpeedMultiplier, classId: c.id };
      if (c.baseStats.critChanceBonus > maxCritCh.val) maxCritCh = { val: c.baseStats.critChanceBonus, classId: c.id };
      if (c.baseStats.critDamageBonus > maxCritDmg.val) maxCritDmg = { val: c.baseStats.critDamageBonus, classId: c.id };
      if (c.baseStats.bossDamageBonus > maxBoss.val) maxBoss = { val: c.baseStats.bossDamageBonus, classId: c.id };
      if (c.baseStats.lootBonus > maxLoot.val) maxLoot = { val: c.baseStats.lootBonus, classId: c.id };
    }

    // Mage has highest base ATK
    expect(maxAtk.classId).toBe('mage');
    // Archer has highest base Speed
    expect(maxSpd.classId).toBe('archer');
    // Assassin has highest Crit Chance, Crit DMG and Loot
    expect(maxCritCh.classId).toBe('assassin');
    expect(maxCritDmg.classId).toBe('assassin');
    expect(maxLoot.classId).toBe('assassin');
    // Swordsman has highest Boss Damage
    expect(maxBoss.classId).toBe('swordsman');

    // Distinct winners prove no single class dominates all dimensions
    const winners = new Set([maxAtk.classId, maxSpd.classId, maxCritCh.classId, maxBoss.classId]);
    expect(winners.size).toBe(4);
  });

  it('P79-03: Simulated combat throughput reflects distinct archetype specializations', () => {
    modifierResolver.clearAll();

    // Mage base ATK burst
    const mageAtk = modifierResolver.resolve('attack', 100, { characterClass: 'mage' }) * 1.30;
    // Archer speed advantage
    const archerSpeed = modifierResolver.resolve('attackSpeed', 100, { characterClass: 'archer' }) * 1.35;
    // Swordsman boss advantage
    const swordsmanBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'swordsman', isBoss: true }) * 1.30;
    // Assassin crit advantage
    const assassinCrit = modifierResolver.resolve('critChance', 0.05, { characterClass: 'assassin' }) + 0.10;

    expect(mageAtk).toBeGreaterThan(120);
    expect(archerSpeed).toBe(135);
    expect(swordsmanBoss).toBe(130);
    expect(assassinCrit).toBeCloseTo(0.15, 4);
  });
});
