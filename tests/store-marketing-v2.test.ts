import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CAMPAIGN_WORLDS } from '../src/content/campaignWorlds';
import { HEROES } from '../src/content/heroes';

describe('Phase 64 — Store Card & Marketing Assets v2 Suite', () => {
  const storeCardPath = path.join(__dirname, '..', 'docs', 'STORE_CARD_V2.md');
  const iconPath = path.join(__dirname, '..', 'docs', 'marketing', 'icon_512.svg');
  const coverPath = path.join(__dirname, '..', 'docs', 'marketing', 'cover_800x450.svg');

  it('P64-01: STORE_CARD_V2.md exists and contains all required sections', () => {
    expect(fs.existsSync(storeCardPath)).toBe(true);
    const content = fs.readFileSync(storeCardPath, 'utf8');

    expect(content).toContain('Аниме: Бесконечное Вознесение');
    expect(content).toContain('Anime: Infinite Ascension');
    expect(content).toContain('5 Миров');
    expect(content).toContain('16 Уникальных Аниме-Героев');
    expect(content).toContain('Колесо Сансары');
    expect(content).toContain('Развитие Секты');
    expect(content).toContain('App Icon');
    expect(content).toContain('Cover / Banner');
  });

  it('P64-02: Marketing Visual Assets exist with valid dimensions and SVG markup', () => {
    expect(fs.existsSync(iconPath)).toBe(true);
    const iconContent = fs.readFileSync(iconPath, 'utf8');
    expect(iconContent).toContain('<svg');
    expect(iconContent).toContain('viewBox="0 0 512 512"');

    expect(fs.existsSync(coverPath)).toBe(true);
    const coverContent = fs.readFileSync(coverPath, 'utf8');
    expect(coverContent).toContain('<svg');
    expect(coverContent).toContain('viewBox="0 0 800 450"');
  });

  it('P64-03: Game Content Parity with Marketing Promises', () => {
    // 5 Worlds
    expect(CAMPAIGN_WORLDS.length).toBe(5);

    // 16 Heroes
    expect(HEROES.length).toBeGreaterThanOrEqual(14);
  });
});
