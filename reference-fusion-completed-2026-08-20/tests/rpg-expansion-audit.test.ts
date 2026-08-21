import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 71 — Current State Audit for RPG Expansion Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const auditDocPath = path.join(rootDir, 'docs', 'RPG_EXPANSION_AUDIT.md');
  const depMapDocPath = path.join(rootDir, 'docs', 'RPG_SYSTEM_DEPENDENCY_MAP.md');

  it('P71-01: RPG_EXPANSION_AUDIT.md exists and covers all required system audits', () => {
    expect(fs.existsSync(auditDocPath)).toBe(true);
    const content = fs.readFileSync(auditDocPath, 'utf8');

    expect(content).toContain('Hero & Party Architecture');
    expect(content).toContain('Manual Attack & Combo System');
    expect(content).toContain('Critical Hit Formula');
    expect(content).toContain('Quest & Event Hooks');
    expect(content).toContain('Save Schema Extensibility');
    expect(content).toContain('Simulator Support');
    expect(content).toContain('Systems That Must NOT Be Duplicated');
  });

  it('P71-02: RPG_SYSTEM_DEPENDENCY_MAP.md exists and maps all phase dependencies', () => {
    expect(fs.existsSync(depMapDocPath)).toBe(true);
    const content = fs.readFileSync(depMapDocPath, 'utf8');

    expect(content).toContain('Global System Dependency Architecture');
    expect(content).toContain('Universal Modifier Framework');
    expect(content).toContain('Dual-Character Team');
    expect(content).toContain('Rhythm Attack');
    expect(content).toContain('Adventure Events');
    expect(content).toContain('Crafting & Forge');
    expect(content).toContain('Settlement');
  });

  it('P71-03: Core codebase files are present and ready for RPG expansion', () => {
    expect(fs.existsSync(path.join(rootDir, 'src', 'systems', 'HeroSystem.ts'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'src', 'systems', 'CampaignCombatService.ts'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'src', 'services', 'save', 'SaveMigrations.ts'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'src', 'economy', 'EconomySimulator.ts'))).toBe(true);
  });
});
