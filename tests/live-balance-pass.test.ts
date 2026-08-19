import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { QUESTS } from '../src/content/quests';
import { getCampaignStageById } from '../src/content/campaignStages';
import { getCampaignBossById } from '../src/content/campaignBosses';

describe('Phase 68 — First Live Balance Pass Suite', () => {
  const reportPath = path.join(__dirname, '..', 'docs', 'LIVE_BALANCE_PASS_V1.md');

  it('P68-01: LIVE_BALANCE_PASS_V1.md exists and contains telemetry analysis', () => {
    expect(fs.existsSync(reportPath)).toBe(true);
    const content = fs.readFileSync(reportPath, 'utf8');

    expect(content).toContain('First Live Balance Pass');
    expect(content).toContain('Stage 1-5 Mini-Boss');
    expect(content).toContain('Stage 1-10 World Boss');
    expect(content).toContain('Root Cause Analysis');
    expect(content).toContain('Regression Verification');
  });

  it('P68-02: Early quests grant sufficient starting gold for Dojo Lv1-5', () => {
    const q1 = QUESTS.find((q) => q.id === 'quest_train_10');
    const q2 = QUESTS.find((q) => q.id === 'quest_campaign_kill_5');
    const q3 = QUESTS.find((q) => q.id === 'quest_build_1');

    expect(q1).toBeDefined();
    expect(q2).toBeDefined();
    expect(q3).toBeDefined();

    const totalEarlyGold = (q1?.reward.gold || 0) + (q2?.reward.gold || 0) + (q3?.reward.gold || 0);
    expect(totalEarlyGold).toBeGreaterThanOrEqual(50); // Sufficient for 5+ Dojo levels
  });

  it('P68-03: Stage 1-5 and 1-10 boss parameters are balanced and beatable', () => {
    const stage1_5 = getCampaignStageById('1-5');
    const stage1_10 = getCampaignStageById('1-10');

    expect(stage1_5).toBeDefined();
    expect(stage1_10).toBeDefined();

    expect(stage1_5?.isBoss).toBe(true);
    expect(stage1_10?.isBoss).toBe(true);

    const boss1_5 = getCampaignBossById(stage1_5!.bossId!);
    const boss1_10 = getCampaignBossById(stage1_10!.bossId!);

    expect(boss1_5).toBeDefined();
    expect(boss1_10).toBeDefined();
    expect(boss1_5?.baseHpMultiplier).toBeLessThanOrEqual(3.5);
    expect(boss1_10?.baseHpMultiplier).toBeLessThanOrEqual(5.0);
  });
});
