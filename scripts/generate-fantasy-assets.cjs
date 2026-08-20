const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const UI_DIR = path.resolve(__dirname, '../public/assets/fantasy/ui');
const HERO_DIR = path.resolve(__dirname, '../public/assets/fantasy/hero');
const BG_DIR = path.resolve(__dirname, '../public/assets/fantasy/bg');

[UI_DIR, HERO_DIR, BG_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function generate() {
  console.log('[Assets] Launching Chromium to render high-res PNG assets...');
  const browser = await chromium.launch({ headless: true });

  // 1. Attack Button (640x152 PNG)
  {
    const page = await browser.newPage({ viewport: { width: 640, height: 152 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:640px; height:152px; background:transparent; display:flex; align-items:center; justify-content:center; }
          .btn {
            width: 624px;
            height: 136px;
            background: linear-gradient(180deg, #991b1b 0%, #7f1d1d 30%, #450a0a 100%);
            border: 6px solid #f59e0b;
            border-radius: 20px;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.8), inset 0 3px 0 rgba(255, 255, 255, 0.3), inset 0 -6px 12px rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            position: relative;
          }
          .corner {
            position: absolute;
            width: 18px;
            height: 18px;
            background: #fbbf24;
            border: 2px solid #78350f;
            border-radius: 50%;
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.6);
          }
          .tl { top: 8px; left: 8px; }
          .tr { top: 8px; right: 8px; }
          .bl { bottom: 8px; left: 8px; }
          .br { bottom: 8px; right: 8px; }
          .text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 900;
            font-size: 54px;
            letter-spacing: 4px;
            color: #ffffff;
            text-shadow: 0 4px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(245, 158, 11, 0.6);
            text-transform: uppercase;
          }
          .sword-icon {
            font-size: 48px;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));
          }
        </style>
      </head>
      <body>
        <div class="btn">
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
          <span class="sword-icon">⚔️</span>
          <span class="text">ATTACK</span>
          <span class="sword-icon">⚔️</span>
        </div>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(UI_DIR, 'btn_attack.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Generated: btn_attack.png (640x152)');
    await page.close();
  }

  // 2. Enemy HP Frame (720x80 PNG)
  {
    const page = await browser.newPage({ viewport: { width: 720, height: 80 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:720px; height:80px; background:transparent; display:flex; align-items:center; justify-content:center; }
          .frame {
            width: 704px;
            height: 64px;
            background: #0f172a;
            border: 4px solid #b45309;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9), inset 0 2px 6px rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            padding: 6px 14px;
            position: relative;
          }
          .insignia {
            font-size: 32px;
            margin-right: 12px;
            filter: drop-shadow(0 2px 6px rgba(220, 38, 38, 0.6));
          }
          .bar-track {
            flex: 1;
            height: 32px;
            background: #18181b;
            border: 2px solid #52525b;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 3px 8px rgba(0,0,0,0.9);
          }
          .bar-fill {
            width: 85%;
            height: 100%;
            background: linear-gradient(90deg, #dc2626 0%, #ef4444 60%, #f87171 100%);
            border-radius: 6px;
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.8);
          }
          .gem {
            position: absolute;
            right: -8px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background: #fbbf24;
            border: 2px solid #78350f;
            transform: translateY(-50%) rotate(45deg);
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
          }
        </style>
      </head>
      <body>
        <div class="frame">
          <span class="insignia">👹</span>
          <div class="bar-track">
            <div class="bar-fill"></div>
          </div>
          <div class="gem"></div>
        </div>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(UI_DIR, 'frame_enemy_hp.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Generated: frame_enemy_hp.png (720x80)');
    await page.close();
  }

  // 3. Navigation Tab (360x128 PNG - Blank Ornate Frame)
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 128 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:360px; height:128px; background:transparent; display:flex; align-items:center; justify-content:center; }
          .tab {
            width: 344px;
            height: 116px;
            background: linear-gradient(180deg, #27272a 0%, #18181b 100%);
            border: 4px solid #f59e0b;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.2);
            position: relative;
          }
          .corner-gold {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #fbbf24;
            border-radius: 50%;
          }
          .ctl { top: 6px; left: 6px; }
          .ctr { top: 6px; right: 6px; }
          .cbl { bottom: 6px; left: 6px; }
          .cbr { bottom: 6px; right: 6px; }
        </style>
      </head>
      <body>
        <div class="tab">
          <div class="corner-gold ctl"></div>
          <div class="corner-gold ctr"></div>
          <div class="corner-gold cbl"></div>
          <div class="corner-gold cbr"></div>
        </div>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(UI_DIR, 'nav_tab.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Generated: nav_tab.png (360x128)');
    await page.close();
  }

  // 4. Gear Slot (168x168 PNG - Blank Ornate Frame)
  {
    const page = await browser.newPage({ viewport: { width: 168, height: 168 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:168px; height:168px; background:transparent; display:flex; align-items:center; justify-content:center; }
          .slot {
            width: 156px;
            height: 156px;
            background: #0f172a;
            border: 4px solid #b45309;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8), inset 0 4px 12px rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .inner-border {
            width: 136px;
            height: 136px;
            border: 2px dashed #f59e0b;
            border-radius: 10px;
          }
          .corner-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #fbbf24;
            border-radius: 50%;
          }
          .ctl { top: 6px; left: 6px; }
          .ctr { top: 6px; right: 6px; }
          .cbl { bottom: 6px; left: 6px; }
          .cbr { bottom: 6px; right: 6px; }
        </style>
      </head>
      <body>
        <div class="slot">
          <div class="corner-dot ctl"></div>
          <div class="corner-dot ctr"></div>
          <div class="corner-dot cbl"></div>
          <div class="corner-dot cbr"></div>
          <div class="inner-border"></div>
        </div>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(UI_DIR, 'gear_slot.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Generated: gear_slot.png (168x168)');
    await page.close();
  }

  // 5. Hero Sprite (480x560 PNG for 240x280 display area)
  {
    const page = await browser.newPage({ viewport: { width: 480, height: 560 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:480px; height:560px; background:transparent; display:flex; align-items:center; justify-content:center; }
          svg { width:440px; height:520px; filter: drop-shadow(0 16px 24px rgba(0,0,0,0.8)); }
        </style>
      </head>
      <body>
        <svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg">
          <!-- Flowing Royal Blue Cape -->
          <path d="M 70 80 Q 30 160 50 240 L 110 240 Q 95 160 100 80 Z" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="3"/>
          <path d="M 60 120 Q 35 180 55 235" stroke="#3b82f6" stroke-width="4" fill="none"/>

          <!-- Greaves / Legs -->
          <rect x="85" y="190" width="22" height="60" rx="4" fill="#3f3f46" stroke="#27272a" stroke-width="3"/>
          <rect x="125" y="190" width="22" height="60" rx="4" fill="#52525b" stroke="#27272a" stroke-width="3"/>
          <!-- Sabatons / Feet -->
          <path d="M 75 245 L 110 245 L 110 260 L 70 260 Z" fill="#18181b"/>
          <path d="M 125 245 L 160 245 L 160 260 L 120 260 Z" fill="#27272a"/>

          <!-- Torso / Breastplate (Silver & Gold Inlay) -->
          <rect x="80" y="90" width="75" height="105" rx="10" fill="#e4e4e7" stroke="#71717a" stroke-width="4"/>
          <!-- Golden Cross Inlay -->
          <rect x="110" y="100" width="15" height="85" fill="#f59e0b"/>
          <rect x="90" y="125" width="55" height="15" fill="#f59e0b"/>
          <!-- Pauldrons (Shoulder Guards) -->
          <circle cx="75" cy="95" r="22" fill="#d4d4d8" stroke="#f59e0b" stroke-width="4"/>
          <circle cx="160" cy="95" r="22" fill="#e4e4e7" stroke="#f59e0b" stroke-width="4"/>

          <!-- Tower Shield (Left Hand) -->
          <path d="M 40 100 L 80 100 L 80 180 L 60 210 L 40 180 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="5"/>
          <!-- Golden Shield Crest -->
          <polygon points="60,120 72,145 60,170 48,145" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>

          <!-- Great Helmet -->
          <rect x="90" y="30" width="55" height="60" rx="8" fill="#d4d4d8" stroke="#52525b" stroke-width="4"/>
          <!-- T-Visor Slit -->
          <path d="M 98 55 L 138 55 L 138 62 L 122 62 L 122 80 L 114 80 L 114 62 L 98 62 Z" fill="#09090b"/>
          <!-- Golden Royal Plume -->
          <path d="M 110 30 Q 118 0 145 10 Q 125 22 125 30 Z" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>

          <!-- Glowing Runic Broadsword (Right Hand) -->
          <g transform="translate(165, 80) rotate(25)">
            <!-- Blade -->
            <rect x="0" y="-120" width="16" height="130" rx="3" fill="#f8fafc" stroke="#93c5fd" stroke-width="3"/>
            <!-- Arcane Rune Glow -->
            <line x1="8" y1="-110" x2="8" y2="-10" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
            <!-- Crossguard -->
            <rect x="-16" y="10" width="48" height="12" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
            <!-- Grip & Pommel -->
            <rect x="2" y="22" width="12" height="26" fill="#78350f"/>
            <circle cx="8" cy="52" r="8" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          </g>
        </svg>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(HERO_DIR, 'hero_knight.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Generated: hero_knight.png (480x560)');
    await page.close();
  }

  // 6. Greenvale BG Far (1920x768 PNG, Seamless Parallax Background)
  {
    const page = await browser.newPage({ viewport: { width: 1920, height: 768 } });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { width:1920px; height:768px; overflow:hidden; }
          svg { width:1920px; height:768px; }
        </style>
      </head>
      <body>
        <svg viewBox="0 0 1920 768" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <!-- Sky Gradient -->
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1e3a8a"/>
              <stop offset="50%" stop-color="#2563eb"/>
              <stop offset="85%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#93c5fd"/>
            </linearGradient>
            <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="hillsMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#059669"/>
              <stop offset="100%" stop-color="#065f46"/>
            </linearGradient>
            <linearGradient id="hillsNear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#047857"/>
            </linearGradient>
          </defs>

          <rect width="1920" height="768" fill="url(#skyGrad)"/>

          <!-- Sun Rays -->
          <circle cx="1600" cy="180" r="90" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 40px #fbbf24)"/>

          <!-- Distant Majestic Mountains (Seamless at 0 and 1920) -->
          <path d="M 0 480 Q 240 320 480 440 Q 720 300 960 460 Q 1200 310 1440 450 Q 1680 330 1920 480 L 1920 768 L 0 768 Z" fill="url(#mountainFar)" opacity="0.75"/>

          <!-- Castle Ruins on Peak -->
          <rect x="440" y="380" width="40" height="60" fill="#1e40af"/>
          <rect x="430" y="370" width="60" height="15" fill="#1e40af"/>
          <polygon points="450,340 460,370 440,370" fill="#1e3a8a"/>

          <rect x="1400" y="390" width="45" height="55" fill="#1e40af"/>
          <rect x="1390" y="380" width="65" height="15" fill="#1e40af"/>

          <!-- Rolling Green Forest Hills (Seamless at 0 and 1920) -->
          <path d="M 0 540 Q 300 460 600 520 Q 900 440 1200 530 Q 1500 450 1920 540 L 1920 768 L 0 768 Z" fill="url(#hillsMid)"/>

          <!-- Near Forest & Ancient Tower (Seamless at 0 and 1920) -->
          <path d="M 0 600 Q 320 540 640 590 Q 960 520 1280 600 Q 1600 530 1920 600 L 1920 768 L 0 768 Z" fill="url(#hillsNear)"/>

          <!-- Road / Cobblestone Path Ground -->
          <rect x="0" y="660" width="1920" height="108" fill="#78350f"/>
          <rect x="0" y="650" width="1920" height="10" fill="#065f46"/>
        </svg>
      </body>
      </html>
    `;
    await page.setContent(html);
    const outPath = path.join(BG_DIR, 'greenvale_bg_far.png');
    await page.screenshot({ path: outPath });
    console.log('Generated: greenvale_bg_far.png (1920x768, seamless)');
    await page.close();
  }

  await browser.close();
  console.log('[Assets] All 6 production PNG assets successfully rendered and saved!');
}

generate().catch((err) => {
  console.error('[Assets] Error:', err);
  process.exit(1);
});
