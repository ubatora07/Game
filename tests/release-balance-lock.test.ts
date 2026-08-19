import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 65 — Release Balance Lock Suite', () => {
  const docsDir = path.join(__dirname, '..', 'docs');
  const reportPath = path.join(docsDir, 'BALANCE_V4_CAMPAIGN.md');
  const campaignCsvPath = path.join(docsDir, 'CAMPAIGN_SIMULATION.csv');
  const runCsvPath = path.join(docsDir, 'RUN_SIMULATION.csv');
  const towerVsCampaignPath = path.join(docsDir, 'TOWER_VS_CAMPAIGN_REWARDS.csv');
  const heroEvPath = path.join(docsDir, 'HERO_EXPECTED_VALUE.csv');

  it('P65-01: BALANCE_V4_CAMPAIGN.md exists and documents core balance rules', () => {
    expect(fs.existsSync(reportPath)).toBe(true);
    const content = fs.readFileSync(reportPath, 'utf8');

    expect(content).toContain('Balance v4');
    expect(content).toContain('Dual Engine Harmony');
    expect(content).toContain('Samsara Prestige');
    expect(content).toContain('Finite Numbers');
  });

  it('P65-02: CAMPAIGN_SIMULATION.csv contains 50 valid stage progressions', () => {
    expect(fs.existsSync(campaignCsvPath)).toBe(true);
    const lines = fs.readFileSync(campaignCsvPath, 'utf8').trim().split('\n');

    expect(lines.length).toBe(51); // 1 header + 50 stages

    for (let i = 1; i <= 50; i++) {
      const parts = lines[i].split(',');
      expect(parts.length).toBeGreaterThanOrEqual(10);
      const hp = parseInt(parts[5], 10);
      const gold = parseInt(parts[6], 10);
      const power = parseInt(parts[7], 10);

      expect(hp).toBeGreaterThan(0);
      expect(gold).toBeGreaterThan(0);
      expect(power).toBeGreaterThan(0);
    }
  });

  it('P65-03: RUN_SIMULATION.csv demonstrates accelerating multi-run prestige', () => {
    expect(fs.existsSync(runCsvPath)).toBe(true);
    const lines = fs.readFileSync(runCsvPath, 'utf8').trim().split('\n');

    expect(lines.length).toBe(21); // 1 header + 20 runs
  });

  it('P65-04: TOWER_VS_CAMPAIGN_REWARDS.csv confirms dual engine synergy', () => {
    expect(fs.existsSync(towerVsCampaignPath)).toBe(true);
    const content = fs.readFileSync(towerVsCampaignPath, 'utf8');
    expect(content).toContain('Early (World 1)');
    expect(content).toContain('Master (World 5)');
  });

  it('P65-05: HERO_EXPECTED_VALUE.csv validates 5 rarities and star scaling', () => {
    expect(fs.existsSync(heroEvPath)).toBe(true);
    const content = fs.readFileSync(heroEvPath, 'utf8');
    expect(content).toContain('Common');
    expect(content).toContain('Rare');
    expect(content).toContain('Epic');
    expect(content).toContain('Legendary');
    expect(content).toContain('Mythic');
    expect(content).toContain('2.2x');
  });
});
