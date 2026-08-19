const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });

  await page.route('**//yandex.ru/**', (r) => r.abort());
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('#headerGold', { timeout: 30000 });
  console.log('boot ok');

  for (let i = 0; i < 10; i++) {
    await page.click('#trainActionBtn');
  }
  console.log('clicks done, power =', await page.textContent('#stagePowerNumber'));

  await page.click('#navBtn_quests');
  await page.waitForTimeout(1500);
  const questContent = await page.evaluate(() => {
    const list = document.getElementById('questsContentList');
    return list ? list.innerHTML.slice(0, 500) : 'NO LIST';
  });
  console.log('questsContentList:', questContent);
  const navHtml = await page.evaluate(() => document.querySelector('.app-bottom-nav')?.innerHTML.slice(0, 800));
  console.log('nav html:', navHtml);

  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });