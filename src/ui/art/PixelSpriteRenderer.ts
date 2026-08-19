/**
 * PixelSpriteRenderer — Core Production Pixel Art Engine
 * Conforms strictly to DESIGN.md and ART_BIBLE.md contracts.
 * Renders high-fidelity, resolution-independent pixel fantasy sprites with full animation state machines.
 */

export type CharacterAnimationState = 'idle' | 'attack' | 'crit' | 'hurt' | 'victory';
export type GoblinTier = 'minion' | 'elite' | 'boss';
export type PetGrowthStage = 1 | 2 | 3;

export class PixelSpriteRenderer {
  /**
   * Generates the Swordsman Main Character SVG sprite with 5 animation states.
   * Canvas base: 64x64 px (standard protagonist contract).
   */
  public static getSwordsmanSprite(state: CharacterAnimationState = 'idle', rankColor: string = '#d97706'): string {
    const isAttack = state === 'attack';
    const isCrit = state === 'crit';
    const isHurt = state === 'hurt';
    const isVictory = state === 'victory';

    // Dynamic animation parameters based on state
    const bodyClass = isHurt ? 'animate-hurt' : isAttack ? 'animate-slash' : isCrit ? 'animate-crit-cleave' : isVictory ? 'animate-victory-cheer' : 'animate-pixel-idle';
    const swordRotation = isCrit ? 'rotate(45 38 32)' : isAttack ? 'rotate(35 36 34)' : isVictory ? 'rotate(-60 38 28)' : 'rotate(0 34 38)';
    const slashTrail = isCrit
      ? `<path d="M12 18 Q 38 6 56 34" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" opacity="0.9" filter="drop-shadow(0 0 6px #ef4444)" class="animate-slash-arc" />`
      : isAttack
      ? `<path d="M16 24 Q 38 14 52 36" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" opacity="0.8" class="animate-slash-arc" />`
      : '';

    return `
      <svg class="pixel-sprite swordsman-sprite ${bodyClass}" viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; overflow:visible;">
        <defs>
          <radialGradient id="swordGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${rankColor}" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="${rankColor}" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="50%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="armorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>

        <!-- Shadow -->
        <ellipse cx="30" cy="58" rx="14" ry="4" fill="rgba(0,0,0,0.5)"/>

        <!-- Aura/Glow if high rank or crit -->
        ${isCrit || isVictory ? `<circle cx="30" cy="34" r="24" fill="url(#swordGlow)" class="animate-pulse"/>` : ''}

        <!-- Cape (back) -->
        <path d="M22 30 L16 52 L26 50 L28 32 Z" fill="#991b1b" stroke="#450a0a" stroke-width="1"/>

        <!-- Legs & Boots -->
        <rect x="22" y="44" width="6" height="12" fill="#1e293b" rx="1"/>
        <rect x="30" y="44" width="6" height="12" fill="#1e293b" rx="1"/>
        <rect x="20" y="52" width="8" height="6" fill="#451a03" stroke="#1c0a00" stroke-width="1"/>
        <rect x="30" y="52" width="8" height="6" fill="#451a03" stroke="#1c0a00" stroke-width="1"/>

        <!-- Torso & Bronze/Steel Chestplate -->
        <rect x="20" y="28" width="18" height="18" rx="2" fill="url(#armorGrad)" stroke="#0f172a" stroke-width="1"/>
        <path d="M22 30 L29 42 L36 30 Z" fill="url(#goldTrim)"/>
        <rect x="21" y="40" width="16" height="4" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <circle cx="29" cy="42" r="2" fill="#f59e0b"/>

        <!-- Head, Hair & Anime Headband -->
        <circle cx="29" cy="20" r="9" fill="#fed7aa"/>
        <!-- Eyes -->
        <rect x="27" y="19" width="3" height="4" fill="#0f172a"/>
        <rect x="33" y="19" width="3" height="4" fill="#0f172a"/>
        <rect x="28" y="19" width="1" height="2" fill="#ffffff"/>
        <rect x="34" y="19" width="1" height="2" fill="#ffffff"/>
        <!-- Spiky Hero Hair -->
        <path d="M19 18 C19 11 25 9 31 10 C36 10 40 13 39 20 C37 15 33 13 29 13 C25 13 21 16 19 18 Z" fill="#1e1b4b"/>
        <polygon points="20,14 17,9 24,12" fill="#1e1b4b"/>
        <polygon points="25,11 27,6 31,11" fill="#1e1b4b"/>
        <polygon points="32,11 36,7 37,13" fill="#1e1b4b"/>
        <!-- Bronze Hero Circlet / Headband -->
        <rect x="20" y="16" width="18" height="3" fill="#d97706" rx="1"/>
        <circle cx="29" cy="17.5" r="1.5" fill="#fef08a"/>

        <!-- Left Arm & Pauldron -->
        <rect x="16" y="28" width="6" height="6" fill="#d97706" rx="1"/>
        <rect x="15" y="32" width="5" height="10" fill="#334155"/>

        <!-- Right Arm & Forged Greatsword -->
        <g transform="${swordRotation}">
          <rect x="34" y="28" width="6" height="6" fill="#d97706" rx="1"/>
          <rect x="36" y="32" width="5" height="10" fill="#334155"/>
          <!-- Greatsword Handle & Pommel -->
          <rect x="38" y="36" width="3" height="8" fill="#78350f"/>
          <circle cx="39.5" cy="45" r="2" fill="#f59e0b"/>
          <!-- Crossguard with Ruby Gem -->
          <rect x="33" y="34" width="13" height="3" fill="#d97706" rx="1"/>
          <circle cx="39.5" cy="35.5" r="1.5" fill="#ef4444"/>
          <!-- Heavy Runic Blade -->
          <polygon points="38,34 38,4 41,1 44,4 44,34" fill="url(#bladeGrad)" stroke="#1e293b" stroke-width="1"/>
          <line x1="41" y1="5" x2="41" y2="33" stroke="${rankColor}" stroke-width="1"/>
        </g>

        <!-- Dynamic Slash VFX Arc -->
        ${slashTrail}
      </svg>
    `;
  }

  /**
   * Generates the Production Pet (Ignis the Ember Drake) across 3 distinct evolution growth stages.
   */
  public static getPetSprite(stage: PetGrowthStage = 1): string {
    if (stage === 1) {
      // Stage 1: Ember Hatchling (48x48) — cute baby dragon with flame tail
      return `
        <svg class="pixel-sprite pet-sprite pet-stage-1 animate-float-slow" viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
          <!-- Shadow -->
          <ellipse cx="24" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.4)"/>
          <!-- Tail with flame -->
          <path d="M14 36 Q 8 38 6 32 Q 5 28 8 26" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <circle cx="8" cy="26" r="4" fill="#f59e0b" class="animate-pulse"/>
          <!-- Chubby Body -->
          <ellipse cx="22" cy="32" rx="10" ry="9" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
          <ellipse cx="20" cy="33" rx="7" ry="6" fill="#f87171"/>
          <!-- Feet -->
          <ellipse cx="17" cy="40" rx="3" ry="2" fill="#7f1d1d"/>
          <ellipse cx="27" cy="40" rx="3" ry="2" fill="#7f1d1d"/>
          <!-- Baby Wings -->
          <path d="M16 27 Q 10 18 16 16 Q 19 22 18 28 Z" fill="#fca5a5" stroke="#dc2626" stroke-width="1"/>
          <!-- Head -->
          <circle cx="28" cy="20" r="9" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
          <!-- Big Cute Eyes -->
          <ellipse cx="28" cy="19" rx="3" ry="4" fill="#0f172a"/>
          <circle cx="27" cy="18" r="1.5" fill="#ffffff"/>
          <ellipse cx="34" cy="19" rx="2.5" ry="3.5" fill="#0f172a"/>
          <circle cx="33.5" cy="18" r="1.2" fill="#ffffff"/>
          <!-- Cute Flame Horns -->
          <polygon points="24,13 22,6 27,11" fill="#f59e0b"/>
          <polygon points="31,12 32,5 34,11" fill="#f59e0b"/>
          <!-- Snout & Smile -->
          <path d="M32 23 Q 36 23 37 25" fill="none" stroke="#7f1d1d" stroke-width="1.5"/>
        </svg>
      `;
    }

    if (stage === 2) {
      // Stage 2: Flame Wyvern (64x64) — horned battle wyvern with large bat wings
      return `
        <svg class="pixel-sprite pet-sprite pet-stage-2 animate-float-medium" viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
          <!-- Shadow -->
          <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.5)"/>
          <!-- Rear Wing (Left) -->
          <path d="M22 28 Q 6 10 2 18 Q 12 24 20 34 Z" fill="#b91c1c" stroke="#450a0a" stroke-width="1"/>
          <!-- Dragon Tail with Barbed Flame Spear -->
          <path d="M18 42 Q 6 46 4 36 Q 3 26 10 22" fill="none" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
          <polygon points="10,22 4,18 8,28" fill="#f59e0b"/>
          <!-- Muscular Torso -->
          <ellipse cx="32" cy="40" rx="14" ry="11" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5"/>
          <path d="M26 34 Q 32 46 38 34 Q 38 48 32 50 Q 26 48 26 34 Z" fill="#fbbf24"/>
          <!-- Front Legs with Dragon Talons -->
          <rect x="22" y="48" width="5" height="9" fill="#991b1b"/>
          <rect x="36" y="48" width="5" height="9" fill="#991b1b"/>
          <polygon points="20,57 24,57 22,59" fill="#f59e0b"/>
          <polygon points="34,57 38,57 36,59" fill="#f59e0b"/>
          <!-- Front Wing (Right) -->
          <path d="M34 26 Q 54 8 58 18 Q 46 26 36 36 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
          <path d="M36 24 L 54 12" stroke="#fbbf24" stroke-width="1.5"/>
          <!-- Fierce Dragon Head & Horns -->
          <ellipse cx="44" cy="24" rx="11" ry="8" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
          <polygon points="40,16 42,4 47,16" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/>
          <polygon points="48,17 54,6 52,18" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/>
          <!-- Glowing Amber Eyes & Snout Flame -->
          <polygon points="46,22 50,21 48,24" fill="#fef08a"/>
          <polygon points="50,26 56,26 53,29" fill="#7f1d1d"/>
          <circle cx="56" cy="26" r="2" fill="#f59e0b" class="animate-pulse"/>
        </svg>
      `;
    }

    // Stage 3: Infernal Solar Sovereign (80x80) — apex dragon king with solar crown and blazing wings
    return `
      <svg class="pixel-sprite pet-sprite pet-stage-3 animate-sovereign-float" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;">
        <defs>
          <radialGradient id="solarAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
            <stop offset="70%" stop-color="#ef4444" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Solar God Aura -->
        <circle cx="40" cy="40" r="36" fill="url(#solarAura)" class="animate-pulse"/>
        <!-- Back Colossal Wing -->
        <path d="M28 32 Q 4 4 2 24 Q 14 36 28 44 Z" fill="#7f1d1d" stroke="#f59e0b" stroke-width="1.5"/>
        <!-- Armored Dragon Tail with Solar Core -->
        <path d="M24 50 Q 8 58 4 44 Q 2 30 12 24" fill="none" stroke="#991b1b" stroke-width="5" stroke-linecap="round"/>
        <circle cx="12" cy="24" r="5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" class="animate-ping"/>
        <!-- Obsidian Armored Dragon Body -->
        <ellipse cx="40" cy="48" rx="18" ry="15" fill="#1c1917" stroke="#ea580c" stroke-width="2"/>
        <path d="M34 40 L46 40 L43 58 L37 58 Z" fill="#ea580c"/>
        <circle cx="40" cy="48" r="4" fill="#fef08a"/>
        <!-- Front Colossal Flaming Wing -->
        <path d="M42 34 Q 74 6 78 28 Q 60 40 46 50 Z" fill="#b91c1c" stroke="#f59e0b" stroke-width="2"/>
        <path d="M44 32 L 72 12" stroke="#fde047" stroke-width="2"/>
        <path d="M48 38 L 74 24" stroke="#fde047" stroke-width="1.5"/>
        <!-- Royal Armored Dragon Head -->
        <ellipse cx="56" cy="28" rx="14" ry="10" fill="#1c1917" stroke="#f59e0b" stroke-width="2"/>
        <!-- Solar Crown of Fire Horns -->
        <polygon points="50,20 50,4 55,18" fill="#f59e0b"/>
        <polygon points="56,18 62,2 62,18" fill="#fbbf24"/>
        <polygon points="63,20 70,6 66,21" fill="#f59e0b"/>
        <!-- Blazing Dragon God Eye -->
        <polygon points="58,26 64,24 62,28" fill="#fef08a" filter="drop-shadow(0 0 4px #ffffff)"/>
        <!-- Fire Breath Emitter -->
        <circle cx="68" cy="30" r="3" fill="#f59e0b" class="animate-pulse"/>
      </svg>
    `;
  }

  /**
   * Generates the Goblin Family (Minion, Elite, Boss) conforming to 64x64, 96x96, 128x128 contracts.
   */
  public static getGoblinSprite(tier: GoblinTier = 'minion', isHurt: boolean = false): string {
    const hurtFilter = isHurt ? 'filter: brightness(2.0) drop-shadow(0 0 8px #ef4444);' : '';

    if (tier === 'minion') {
      // Goblin Grunt (64x64)
      return `
        <svg class="pixel-sprite goblin-minion" viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; ${hurtFilter}">
          <ellipse cx="32" cy="56" rx="12" ry="4" fill="rgba(0,0,0,0.4)"/>
          <!-- Legs -->
          <rect x="24" y="44" width="5" height="10" fill="#65a30d"/>
          <rect x="34" y="44" width="5" height="10" fill="#65a30d"/>
          <!-- Body & Ragged Tunic -->
          <rect x="22" y="30" width="18" height="16" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1"/>
          <!-- Big Pointy Goblin Ears -->
          <polygon points="18,22 6,18 18,26" fill="#4d7c0f"/>
          <polygon points="44,22 56,18 44,26" fill="#4d7c0f"/>
          <!-- Goblin Head -->
          <circle cx="31" cy="22" r="10" fill="#65a30d"/>
          <!-- Beady Red Eyes & Crooked Teeth -->
          <circle cx="28" cy="20" r="2" fill="#dc2626"/>
          <circle cx="35" cy="20" r="2" fill="#dc2626"/>
          <circle cx="28" cy="20" r="0.8" fill="#fef08a"/>
          <circle cx="35" cy="20" r="0.8" fill="#fef08a"/>
          <!-- Nose & Smile -->
          <polygon points="31,21 29,25 33,25" fill="#3f6212"/>
          <path d="M26 27 Q 31 30 36 27" stroke="#1c1917" stroke-width="1.5" fill="none"/>
          <polygon points="28,27 29,25 30,27" fill="#ffffff"/>
          <polygon points="33,27 34,25 35,27" fill="#ffffff"/>
          <!-- Horned Skull Cap -->
          <path d="M22 18 C22 12 40 12 40 18 Z" fill="#57534e" stroke="#292524" stroke-width="1"/>
          <polygon points="24,14 20,8 26,13" fill="#e7e5e4"/>
          <!-- Spiked Wooden Club -->
          <g transform="rotate(-20 44 38)">
            <rect x="42" y="28" width="5" height="18" rx="1" fill="#78350f" stroke="#292524" stroke-width="1"/>
            <circle cx="44" cy="30" r="1.5" fill="#a8a29e"/>
            <circle cx="45" cy="36" r="1.5" fill="#a8a29e"/>
          </g>
        </svg>
      `;
    }

    if (tier === 'elite') {
      // Goblin Shaman / Warlock (96x96) — skull staff, mystic violet aura
      return `
        <svg class="pixel-sprite goblin-elite" viewBox="0 0 96 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; ${hurtFilter}">
          <defs>
            <radialGradient id="shamanAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#3b0764" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="48" cy="50" r="38" fill="url(#shamanAura)" class="animate-pulse"/>
          <ellipse cx="48" cy="84" rx="20" ry="6" fill="rgba(0,0,0,0.5)"/>
          <!-- Shaman Robes -->
          <path d="M34 46 L24 80 L72 80 L62 46 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="2"/>
          <path d="M42 46 L48 76 L54 46 Z" fill="#9333ea"/>
          <!-- Large Pointy Ears with Gold Earrings -->
          <polygon points="30,34 10,26 30,40" fill="#3f6212"/>
          <circle cx="14" cy="30" r="3" fill="#f59e0b"/>
          <polygon points="66,34 86,26 66,40" fill="#3f6212"/>
          <circle cx="82" cy="30" r="3" fill="#f59e0b"/>
          <!-- Shaman Head with Warpaint -->
          <circle cx="48" cy="34" r="15" fill="#65a30d"/>
          <!-- Purple War Paint Stripes -->
          <path d="M38 30 L44 38 M58 30 L52 38" stroke="#c084fc" stroke-width="2.5"/>
          <!-- Glowing Eyes -->
          <circle cx="42" cy="32" r="3" fill="#f3e8ff"/>
          <circle cx="42" cy="32" r="1.5" fill="#9333ea"/>
          <circle cx="54" cy="32" r="3" fill="#f3e8ff"/>
          <circle cx="54" cy="32" r="1.5" fill="#9333ea"/>
          <!-- Antler Headdress -->
          <path d="M38 22 Q 28 6 34 2" fill="none" stroke="#78350f" stroke-width="3"/>
          <path d="M58 22 Q 68 6 62 2" fill="none" stroke="#78350f" stroke-width="3"/>
          <!-- Mystic Skull Staff -->
          <g>
            <rect x="70" y="24" width="5" height="60" fill="#451a03" rx="1"/>
            <!-- Crystal Skull Orb -->
            <circle cx="72.5" cy="20" r="8" fill="#e9d5ff" stroke="#9333ea" stroke-width="2"/>
            <circle cx="72.5" cy="20" r="4" fill="#a855f7" class="animate-ping"/>
          </g>
        </svg>
      `;
    }

    // Goblin King Malgok (Boss 128x128) — iron crown, royal red cape, notched battleaxe
    return `
      <svg class="pixel-sprite goblin-boss" viewBox="0 0 128 128" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; ${hurtFilter}">
        <defs>
          <radialGradient id="bossRageAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.7"/>
            <stop offset="70%" stop-color="#b91c1c" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#450a0a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Boss Rage Glow -->
        <circle cx="64" cy="64" r="58" fill="url(#bossRageAura)" class="animate-pulse"/>
        <ellipse cx="64" cy="116" rx="32" ry="8" fill="rgba(0,0,0,0.6)"/>
        <!-- Royal Red Velvet Cape with Fur Trim -->
        <path d="M36 50 L18 112 L110 112 L92 50 Z" fill="#991b1b" stroke="#450a0a" stroke-width="2"/>
        <rect x="34" y="46" width="60" height="10" rx="3" fill="#e7e5e4" stroke="#78716c" stroke-width="1.5"/>
        <!-- Massive Armored Goblin Torso -->
        <rect x="38" y="52" width="52" height="42" rx="4" fill="#3f6212" stroke="#14532d" stroke-width="2"/>
        <!-- Iron Plate Harness with Skull Emblem -->
        <rect x="42" y="54" width="44" height="28" rx="2" fill="#44403c" stroke="#1c1917" stroke-width="2"/>
        <circle cx="64" cy="68" r="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
        <!-- Pointy Warlord Ears -->
        <polygon points="40,38 12,26 40,48" fill="#365314" stroke="#14532d" stroke-width="2"/>
        <polygon points="88,38 116,26 88,48" fill="#365314" stroke="#14532d" stroke-width="2"/>
        <!-- King Head -->
        <circle cx="64" cy="40" r="22" fill="#4d7c0f" stroke="#14532d" stroke-width="2"/>
        <!-- Fierce Yellow Eyes & Sharp Tusks -->
        <ellipse cx="54" cy="38" rx="4" ry="5" fill="#fef08a"/>
        <circle cx="54" cy="38" r="2" fill="#dc2626"/>
        <ellipse cx="74" cy="38" rx="4" ry="5" fill="#fef08a"/>
        <circle cx="74" cy="38" r="2" fill="#dc2626"/>
        <!-- Snarl & Huge Tusks -->
        <path d="M50 48 Q 64 54 78 48" stroke="#14532d" stroke-width="3" fill="none"/>
        <polygon points="52,48 54,40 56,48" fill="#f8fafc"/>
        <polygon points="72,48 74,40 76,48" fill="#f8fafc"/>
        <!-- Spiked Iron Crown with Blood Rubies -->
        <polygon points="44,26 42,10 52,20 64,6 76,20 86,10 84,26" fill="#78350f" stroke="#1c1917" stroke-width="2"/>
        <circle cx="64" cy="18" r="3" fill="#dc2626"/>
        <circle cx="52" cy="22" r="2" fill="#dc2626"/>
        <circle cx="76" cy="22" r="2" fill="#dc2626"/>
        <!-- Colossal Notched Battleaxe -->
        <g transform="rotate(15 96 64)">
          <rect x="94" y="20" width="8" height="96" fill="#78350f" stroke="#1c1917" stroke-width="2"/>
          <path d="M96 22 C116 12 126 32 116 48 L96 42 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2"/>
          <path d="M96 22 C76 12 66 32 76 48 L96 42 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2"/>
        </g>
      </svg>
    `;
  }

  /**
   * Generates the Forest of Spirits multi-layered pixel fantasy background.
   */
  public static getForestBackground(): string {
    return `
      <div class="forest-parallax-container" style="position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0;">
        <!-- Layer 0: Deep Starry Twilight Sky & Moon -->
        <div style="position:absolute; inset:0; background:radial-gradient(ellipse at 50% 10%, #1e1b4b 0%, #0f172a 60%, #050814 100%);"></div>
        <div style="position:absolute; top:8%; right:14%; width:56px; height:56px; border-radius:50%; background:radial-gradient(circle, #fef08a 0%, #fde047 50%, rgba(253,224,71,0) 80%); filter:drop-shadow(0 0 16px #fde047);"></div>

        <!-- Layer 1: Distant Ancient Tree Silhouettes -->
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="position:absolute; bottom:25%; left:0; width:100%; height:65%; opacity:0.45; image-rendering:pixelated;">
          <polygon points="0,300 0,160 50,110 80,150 140,80 200,160 260,100 320,170 380,90 450,160 520,110 600,180 680,95 760,170 840,105 920,160 1000,120 1000,300" fill="#0f172a"/>
        </svg>

        <!-- Layer 2: Middle-Ground Misty Canopy & Giant Bioluminescent Mushrooms -->
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="position:absolute; bottom:12%; left:0; width:100%; height:55%; opacity:0.75; image-rendering:pixelated;">
          <path d="M0 300 L0 180 Q 80 130 160 190 Q 240 120 340 185 Q 480 110 600 195 Q 750 125 860 190 Q 940 140 1000 175 L1000 300 Z" fill="#064e3b"/>
          <!-- Glowing Spirit Spores -->
          <circle cx="120" cy="160" r="4" fill="#34d399" opacity="0.8" class="animate-ping"/>
          <circle cx="380" cy="140" r="3.5" fill="#38bdf8" opacity="0.8" class="animate-ping"/>
          <circle cx="640" cy="170" r="4" fill="#a7f3d0" opacity="0.9" class="animate-ping"/>
          <circle cx="880" cy="150" r="3" fill="#fde047" opacity="0.8" class="animate-ping"/>
        </svg>

        <!-- Layer 3: Foreground Wooden Battle Bridge & Carved Runic Stones -->
        <div style="position:absolute; bottom:0; left:0; width:100%; height:26%; background:linear-gradient(180deg, #1c1917 0%, #0c0a09 100%); border-top:2px solid #d97706; box-shadow:var(--shadow-ground-glow);">
          <!-- Wood Planks and Runic Stone Accents -->
          <div style="width:100%; height:100%; background:repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.4) 40px, rgba(0,0,0,0.4) 42px);"></div>
        </div>
      </div>
    `;
  }
}
