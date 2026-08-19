const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'docs', 'marketing');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Icon 512x512
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#312e81" />
      <stop offset="60%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="url(#goldGrad)" stroke-width="8" opacity="0.8" />
  
  <!-- Solar Halo / Aura -->
  <circle cx="256" cy="220" r="140" fill="none" stroke="#f59e0b" stroke-width="6" opacity="0.4" stroke-dasharray="12 8" />
  <circle cx="256" cy="220" r="110" fill="rgba(245, 158, 11, 0.15)" filter="url(#glow)" />
  
  <!-- Crossed Celestial Blades -->
  <g transform="translate(256,220)">
    <!-- Blade 1 -->
    <path d="M-10,90 L0,-120 L10,90 L0,110 Z" fill="url(#goldGrad)" transform="rotate(-35)" filter="url(#glow)" />
    <!-- Blade 2 -->
    <path d="M-10,90 L0,-120 L10,90 L0,110 Z" fill="#38bdf8" transform="rotate(35)" filter="url(#glow)" opacity="0.9" />
  </g>

  <!-- Central Anime Star / Emblem -->
  <polygon points="256,150 270,200 320,214 270,228 256,278 242,228 192,214 242,200" fill="#ffffff" filter="url(#glow)" />
  
  <!-- Title Badge Banner -->
  <rect x="56" y="380" width="400" height="72" rx="18" fill="rgba(15, 23, 42, 0.95)" stroke="url(#goldGrad)" stroke-width="4" />
  <text x="256" y="426" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="30" fill="#fde047" letter-spacing="2">
    ASCENSION
  </text>
</svg>`;

// 2. Cover Banner 800x450
const coverSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="coverBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#450a0a" />
    </linearGradient>
    <linearGradient id="bannerGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#coverBg)" />
  
  <!-- World Silhouette Grid -->
  <rect x="0" y="340" width="800" height="110" fill="#020617" />
  <line x1="0" y1="340" x2="800" y2="340" stroke="#f59e0b" stroke-width="3" opacity="0.6" />
  
  <!-- Hero Aura Left -->
  <circle cx="220" cy="240" r="90" fill="rgba(56, 189, 248, 0.25)" />
  <text x="220" y="270" font-size="90" text-anchor="middle">🗡️</text>
  <text x="130" y="280" font-size="50" text-anchor="middle">🌸</text>
  <text x="310" y="280" font-size="50" text-anchor="middle">⚡</text>

  <!-- Boss Aura Right -->
  <circle cx="600" cy="220" r="110" fill="rgba(239, 68, 68, 0.3)" />
  <text x="600" y="260" font-size="110" text-anchor="middle">👹</text>
  
  <!-- VS Spark -->
  <text x="410" y="250" font-size="44" font-weight="900" fill="#fde047" text-anchor="middle">VS</text>

  <!-- Game Title -->
  <rect x="120" y="30" width="560" height="80" rx="16" fill="rgba(15, 23, 42, 0.9)" stroke="url(#bannerGold)" stroke-width="3" />
  <text x="400" y="70" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="32" fill="#ffffff">
    ANIME: INFINITE ASCENSION
  </text>
  <text x="400" y="96" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#fde047">
    БЕСКОНЕЧНОЕ ВОЗНЕСЕНИЕ • IDLE RPG
  </text>
</svg>`;

// Write assets
fs.writeFileSync(path.join(outDir, 'icon_512.svg'), iconSvg, 'utf8');
fs.writeFileSync(path.join(outDir, 'cover_800x450.svg'), coverSvg, 'utf8');

console.log('[Marketing Assets Generator] Successfully created icon_512.svg & cover_800x450.svg');
