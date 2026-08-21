import { expect, type Page } from '@playwright/test';

export const SAVE_KEY = 'ANIME_ASCENSION_SAVE_V6';

export interface QaResult {
  errors: string[];
}

/**
 * Track runtime errors (pageerror + console.error) for the whole test.
 */
export function trackErrors(page: Page): QaResult {
  const qa: QaResult = { errors: [] };
  page.on('pageerror', (err) => qa.errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Expected: resource load failures caused by intentionally blocked external
    // resources (Yandex SDK) or favicon.
    if (msg.text().startsWith('Failed to load resource')) return;
    qa.errors.push(`console.error: ${msg.text()}`);
  });
  return qa;
}

export function expectNoErrors(errors: string[]): void {
  expect(errors, 'Runtime errors (pageerror / console.error)').toEqual([]);
}

/**
 * Boot the game fresh (blocking the real Yandex SDK so the Mock platform is used).
 */
export async function boot(page: Page): Promise<void> {
  await page.route(/(yandex\.ru|games\/sdk)/, (route) => route.abort());
  await page.goto('/');
  await page.waitForSelector('#headerGold', { state: 'visible', timeout: 30_000 });
}

/**
 * Seed a partial save into localStorage and reload the game.
 * sanitizeGameState fills all missing fields with defaults.
 */
export async function seedSave(page: Page, partial: Record<string, unknown>): Promise<void> {
  await page.evaluate(
    ({ key, data }) => {
      (window as any).__DISABLE_SAVE__ = true;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: SAVE_KEY, data: partial }
  );
  await page.reload();
  await page.waitForSelector('#headerGold', { state: 'visible', timeout: 30_000 });
}

/**
 * Perform an action with the dev cheats panel open (closes it afterwards).
 */
export async function withDevPanel(page: Page, fn: (page: Page) => Promise<void>): Promise<void> {
  await page.click('#devToggleBtn');
  await page.waitForSelector('#devPanel', { state: 'visible' });
  await fn(page);
  await page.click('#devToggleBtn');
}

export async function devClick(page: Page, buttonId: string): Promise<void> {
  await withDevPanel(page, async (p) => {
    await p.click(`#${buttonId}`);
  });
}

export async function textOf(page: Page, selector: string): Promise<string> {
  const el = await page.$(selector);
  if (!el) return '';
  return (await el.textContent())?.trim() ?? '';
}

/**
 * Parse BigNumber.format output ("1.25M", "500", "2.5e6") into a number.
 */
export function parseFormatted(s: string): number {
  const cleaned = s.replace(/[^\d.eE+\-A-Za-z]/g, '');
  const m = cleaned.match(/^([+-]?[\d.]+(?:e[+-]?\d+)?)([A-Za-z]*)$/i);
  if (!m) return NaN;
  const num = parseFloat(m[1]);
  const suffix = m[2];
  const mult: Record<string, number> = {
    '': 1,
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
    Qa: 1e15,
    Qi: 1e18,
    Sx: 1e21,
    Sp: 1e24,
  };
  return num * (mult[suffix] ?? 1);
}

export async function headerGold(page: Page): Promise<number> {
  return parseFormatted(await textOf(page, '#headerGold'));
}

export async function headerCrystals(page: Page): Promise<number> {
  return parseFormatted(await textOf(page, '#headerCrystals'));
}

export async function headerPower(page: Page): Promise<number> {
  return parseFormatted(await textOf(page, '#headerPowerDisplay'));
}

export async function modalOpen(page: Page, selector: string): Promise<boolean> {
  return page.isVisible(`#modalLayer:visible ${selector}`);
}

export async function closeModalIfOpen(page: Page): Promise<void> {
  const visible = await page.isVisible('#modalLayer');
  if (visible) {
    await page.evaluate(() => {
      const layer = document.getElementById('modalLayer');
      if (layer) layer.style.display = 'none';
    });
  }
}
