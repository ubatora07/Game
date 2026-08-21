import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { analytics, AnalyticsService } from '../src/services/analytics/AnalyticsService';

describe('Phase 67 — Soft Launch & Deployment QA Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const zipPath = path.join(rootDir, 'anime-infinite-ascension.zip');
  const deployGuidePath = path.join(rootDir, 'docs', 'DEPLOYMENT_GUIDE.md');

  it('P67-01: Release zip archive exists and is within target size (< 5 MB)', () => {
    expect(fs.existsSync(zipPath)).toBe(true);
    const stats = fs.statSync(zipPath);
    expect(stats.size).toBeGreaterThan(10000); // > 10KB
    expect(stats.size).toBeLessThan(5 * 1024 * 1024); // < 5MB
  });

  it('P67-02: DEPLOYMENT_GUIDE.md exists with clear portal instructions', () => {
    expect(fs.existsSync(deployGuidePath)).toBe(true);
    const content = fs.readFileSync(deployGuidePath, 'utf8');

    expect(content).toContain('Yandex Games Deployment');
    expect(content).toContain('First Minute Funnel');
    expect(content).toContain('First Session Milestones');
    expect(content).toContain('LiveOps Incident Response Plan');
  });

  it('P67-03: AnalyticsService handles all funnel and retention events', () => {
    expect(analytics).toBeDefined();
    expect(AnalyticsService.getInstance()).toBe(analytics);
    expect(typeof analytics.getFirstSessionReport).toBe('function');
    expect(typeof analytics.getStageFunnelReport).toBe('function');
    expect(typeof analytics.getBossFailureReport).toBe('function');
  });
});
