import { SettlementBuildingId, SettlementBuildingState, SettlementNPCId } from '../../core/settlement/SettlementTypes';
import { SETTLEMENT_NPCS } from '../../content/settlementNPCs';
import { t } from '../../services/i18n/I18nService';
import { WorldFlagId } from '../../core/world/WorldStateTypes';

export class SettlementVisualRenderer {
  /**
   * Generates a multi-layer pixel fantasy settlement panoramic landscape
   */
  public static getSettlementPanoramaSvg(
    _buildings?: Record<SettlementBuildingId, SettlementBuildingState>,
    _settlementLevel?: number
  ): string {
    return `
      <svg class="settlement-panoramic-svg" viewBox="0 0 800 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; shape-rendering:crispEdges;">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="60%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#312e81"/>
          </linearGradient>

          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#090d16"/>
          </linearGradient>

          <radialGradient id="sunMoonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
            <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Layer 0: Sky & Mountain Peaks -->
        <rect width="800" height="420" fill="url(#skyGrad)"/>
        <circle cx="680" cy="80" r="40" fill="url(#sunMoonGlow)"/>
        <circle cx="680" cy="80" r="18" fill="#fef08a"/>

        <!-- Distant Mountain Peaks -->
        <polygon points="0,220 90,140 180,240 310,110 460,250 580,120 720,230 800,160 800,420 0,420" fill="url(#mountainGrad)"/>

        <!-- Pine Forest Silhouettes -->
        <polygon points="20,260 40,210 60,260 55,260 70,220 85,260" fill="#064e3b" opacity="0.6"/>
        <polygon points="120,270 145,215 170,270" fill="#064e3b" opacity="0.5"/>
        <polygon points="620,260 645,200 670,260 690,220 710,260" fill="#064e3b" opacity="0.6"/>

        <!-- Layer 1: Green Valley & Terraced Land -->
        <path d="M0,260 Q200,230 400,250 T800,240 L800,420 L0,420 Z" fill="#064e3b"/>
        <path d="M0,290 Q300,270 550,295 T800,280 L800,420 L0,420 Z" fill="#022c22"/>

        <!-- Stone Roads & Paths -->
        <path d="M50,420 Q220,340 400,320 T750,330 L800,420 Z" fill="#292524" opacity="0.8"/>
        <path d="M80,420 Q240,350 400,330 T720,340" stroke="#78350f" stroke-width="4" fill="none" stroke-dasharray="6,4"/>

        <!-- River & Wooden Bridge -->
        <path d="M220,280 Q250,340 280,420" stroke="#0284c7" stroke-width="26" fill="none" opacity="0.8"/>
        <rect x="235" y="340" width="45" height="14" fill="#78350f" rx="2"/>
        <rect x="238" y="342" width="39" height="10" fill="#b45309"/>
      </svg>
    `;
  }

  /**
   * Generates a physical pixel structure SVG for a settlement building based on its type and level
   */
  public static getBuildingStructureSvg(buildingId: SettlementBuildingId, level: number): string {
    if (level === 0) {
      // Empty Construction Plot with Wooden Stakes
      return `
        <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
          <ellipse cx="32" cy="46" rx="24" ry="12" fill="#1c1917" opacity="0.6"/>
          <!-- Wooden Stakes -->
          <rect x="14" y="34" width="4" height="18" fill="#78350f"/>
          <rect x="46" y="34" width="4" height="18" fill="#78350f"/>
          <rect x="22" y="44" width="4" height="14" fill="#78350f"/>
          <rect x="38" y="44" width="4" height="14" fill="#78350f"/>
          <!-- Ropes & Blueprint Chalk -->
          <line x1="16" y1="36" x2="48" y2="36" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2"/>
          <text x="32" y="30" font-size="8" fill="#f59e0b" font-weight="bold" text-anchor="middle" font-family="monospace">${t('settlement.plot')}</text>
        </svg>
      `;
    }

    switch (buildingId) {
      case 'throne_hall':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <!-- Shadow -->
            <ellipse cx="32" cy="54" rx="26" ry="8" fill="#000000" opacity="0.6"/>
            <!-- Stone Foundation -->
            <rect x="10" y="28" width="44" height="26" fill="#334155"/>
            <rect x="14" y="32" width="36" height="22" fill="#475569"/>
            <!-- Roof / Towers -->
            <polygon points="32,8 6,28 58,28" fill="#991b1b"/>
            <polygon points="32,12 12,28 52,28" fill="#b91c1c"/>
            <!-- Crest Banner -->
            <rect x="28" y="24" width="8" height="16" fill="#f59e0b"/>
            <!-- Arched Door -->
            <rect x="26" y="40" width="12" height="14" fill="#1e293b" rx="4"/>
            <!-- Glowing Windows -->
            <rect x="16" y="34" width="6" height="8" fill="#fef08a"/>
            <rect x="42" y="34" width="6" height="8" fill="#fef08a"/>
            ${level >= 2 ? '<circle cx="32" cy="18" r="3" fill="#fde047"/>' : ''}
          </svg>
        `;

      case 'forge':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <!-- Stone Smithy Body -->
            <rect x="12" y="30" width="40" height="22" fill="#292524"/>
            <polygon points="32,16 8,30 56,30" fill="#78350f"/>
            <!-- Chimney & Fire Glow -->
            <rect x="40" y="10" width="8" height="18" fill="#44403c"/>
            <circle cx="44" cy="8" r="4" fill="#f97316" opacity="0.8"/>
            <circle cx="46" cy="4" r="3" fill="#ef4444" opacity="0.6"/>
            <!-- Anvil & Furnace Door -->
            <rect x="22" y="38" width="14" height="14" fill="#f97316"/>
            <rect x="25" y="42" width="8" height="10" fill="#fef08a"/>
            <!-- Small Anvil Outside -->
            <rect x="42" y="46" width="10" height="6" fill="#71717a"/>
          </svg>
        `;

      case 'market':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <!-- Wooden Pillars -->
            <rect x="12" y="26" width="6" height="26" fill="#78350f"/>
            <rect x="46" y="26" width="6" height="26" fill="#78350f"/>
            <rect x="14" y="42" width="36" height="10" fill="#b45309"/>
            <!-- Striped Canvas Canopy -->
            <polygon points="32,14 6,26 58,26" fill="#047857"/>
            <polygon points="18,26 24,18 30,26" fill="#fef08a"/>
            <polygon points="34,26 40,18 46,26" fill="#fef08a"/>
            <!-- Goods & Crates -->
            <rect x="18" y="38" width="8" height="8" fill="#d97706"/>
            <circle cx="36" cy="44" r="3" fill="#ef4444"/>
            <circle cx="42" cy="44" r="3" fill="#3b82f6"/>
          </svg>
        `;

      case 'tavern':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <rect x="12" y="28" width="40" height="24" fill="#451a03"/>
            <polygon points="32,12 8,28 56,28" fill="#1e1b4b"/>
            <!-- Timber Framing -->
            <line x1="12" y1="28" x2="52" y2="52" stroke="#78350f" stroke-width="2"/>
            <line x1="52" y1="28" x2="12" y2="52" stroke="#78350f" stroke-width="2"/>
            <!-- Door & Lantern -->
            <rect x="24" y="38" width="12" height="14" fill="#292524"/>
            <circle cx="42" cy="36" r="3" fill="#fde047" stroke="#b45309"/>
          </svg>
        `;

      case 'barracks':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <rect x="10" y="26" width="44" height="26" fill="#334155"/>
            <!-- Battlements -->
            <rect x="10" y="20" width="8" height="8" fill="#475569"/>
            <rect x="22" y="20" width="8" height="8" fill="#475569"/>
            <rect x="34" y="20" width="8" height="8" fill="#475569"/>
            <rect x="46" y="20" width="8" height="8" fill="#475569"/>
            <!-- Iron Portcullis -->
            <rect x="24" y="38" width="16" height="14" fill="#0f172a"/>
            <line x1="28" y1="38" x2="28" y2="52" stroke="#94a3b8" stroke-width="2"/>
            <line x1="36" y1="38" x2="36" y2="52" stroke="#94a3b8" stroke-width="2"/>
          </svg>
        `;

      case 'farm':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <!-- Windmill Base -->
            <polygon points="24,52 28,26 36,26 40,52" fill="#78350f"/>
            <!-- Windmill Rotor Blades -->
            <circle cx="32" cy="26" r="4" fill="#f59e0b"/>
            <line x1="32" y1="12" x2="32" y2="40" stroke="#fef08a" stroke-width="3"/>
            <line x1="18" y1="26" x2="46" y2="26" stroke="#fef08a" stroke-width="3"/>
            <!-- Wheat Field Patches -->
            <rect x="8" y="44" width="12" height="6" fill="#ca8a04"/>
            <rect x="44" y="44" width="12" height="6" fill="#ca8a04"/>
          </svg>
        `;

      case 'alchemy':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <rect x="14" y="28" width="36" height="24" fill="#1e1b4b"/>
            <!-- Conical Mystic Roof -->
            <polygon points="32,10 8,28 56,28" fill="#581c87"/>
            <circle cx="32" cy="10" r="3" fill="#c084fc"/>
            <!-- Glowing Alembic Window -->
            <circle cx="32" cy="38" r="6" fill="#a855f7" opacity="0.8"/>
            <rect x="22" y="42" width="6" height="10" fill="#3b82f6"/>
          </svg>
        `;

      case 'pet_house':
        return `
          <svg viewBox="0 0 64 64" width="64" height="64" style="image-rendering:pixelated;">
            <ellipse cx="32" cy="52" rx="24" ry="8" fill="#000000" opacity="0.6"/>
            <rect x="12" y="32" width="40" height="20" fill="#7c2d12"/>
            <polygon points="32,18 10,32 54,32" fill="#ea580c"/>
            <!-- Cozy Archway & Nest -->
            <rect x="24" y="38" width="16" height="14" fill="#431407" rx="6"/>
            <circle cx="28" cy="46" r="3" fill="#fde047"/>
            <circle cx="36" cy="46" r="3" fill="#f97316"/>
          </svg>
        `;
    }
  }

  /**
   * Renders decorative settlement consequences driven by persistent WorldState flags.
   * The overlay is intentionally text-free so narrative copy remains owned by i18n UI.
   */
  public static getWorldConsequenceOverlaySvg(flagIds: WorldFlagId[]): string {
    if (flagIds.length === 0) return '';

    const active = new Set(flagIds);
    const fragments: string[] = [];

    if (active.has('village_saved') || active.has('refugees_accepted')) {
      fragments.push(`
        <g data-consequence="prosperity">
          <rect x="92" y="302" width="4" height="24" fill="#92400e"/>
          <rect x="96" y="302" width="18" height="10" fill="#f59e0b"/>
          <rect x="112" y="306" width="4" height="6" fill="#fef08a"/>
          <rect x="626" y="296" width="4" height="26" fill="#92400e"/>
          <rect x="630" y="296" width="18" height="10" fill="#4ade80"/>
        </g>
      `);
    }

    if (active.has('village_ruined')) {
      fragments.push(`
        <g data-consequence="ruined" opacity="0.88">
          <rect x="130" y="350" width="12" height="4" fill="#7f1d1d"/>
          <rect x="142" y="342" width="5" height="12" fill="#ef4444"/>
          <rect x="658" y="348" width="10" height="4" fill="#7f1d1d"/>
          <rect x="665" y="338" width="4" height="10" fill="#f97316"/>
        </g>
      `);
    }

    if (active.has('smuggler_alliance')) {
      fragments.push(`
        <g data-consequence="shadow-alley">
          <rect x="710" y="330" width="5" height="22" fill="#3b0764"/>
          <rect x="704" y="328" width="17" height="7" fill="#7e22ce"/>
          <rect x="709" y="330" width="7" height="4" fill="#d8b4fe"/>
        </g>
      `);
    }

    if (active.has('kingdom_trusted')) {
      fragments.push(`
        <g data-consequence="royal-trust">
          <rect x="388" y="228" width="5" height="48" fill="#78350f"/>
          <path d="M393 230 H424 V250 L408 244 L393 250 Z" fill="#d97706"/>
          <rect x="401" y="236" width="8" height="8" fill="#fde047"/>
        </g>
      `);
    }

    if (active.has('dark_reputation')) {
      fragments.push(`
        <g data-consequence="dark-reputation">
          <rect x="388" y="228" width="5" height="48" fill="#450a0a"/>
          <path d="M393 230 H424 V250 L408 244 L393 250 Z" fill="#991b1b"/>
          <rect x="402" y="236" width="6" height="8" fill="#f87171"/>
        </g>
      `);
    }

    if (active.has('sovereign_citadel_erected')) {
      fragments.push(`
        <g data-consequence="legacy-citadel">
          <rect x="365" y="162" width="70" height="66" fill="#292524" stroke="#b45309" stroke-width="3"/>
          <rect x="374" y="148" width="14" height="24" fill="#44403c" stroke="#b45309" stroke-width="2"/>
          <rect x="412" y="148" width="14" height="24" fill="#44403c" stroke="#b45309" stroke-width="2"/>
          <rect x="395" y="183" width="10" height="45" fill="#78350f"/>
          <rect x="398" y="157" width="4" height="20" fill="#f59e0b"/>
        </g>
      `);
    }

    return `
      <svg class="settlement-world-consequence-overlay" data-world-flags="${flagIds.join(',')}" viewBox="0 0 800 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position:absolute; inset:0; pointer-events:none; image-rendering:pixelated; shape-rendering:crispEdges; z-index:1;">
        ${fragments.join('')}
      </svg>
    `;
  }

  /**
   * Generates an interactive pixel NPC avatar
   */
  public static getNPCAvatarSvg(npcId: SettlementNPCId): string {
    const def = SETTLEMENT_NPCS[npcId];
    if (!def) return '';

    return `
      <div class="settlement-npc-sprite" data-npc-id="${npcId}" style="position:relative; width:48px; height:48px; cursor:pointer; display:flex; flex-direction:column; align-items:center; transition:transform 0.15s ease;">
        <div style="width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,0.6); border:1.5px solid #f59e0b; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(245,158,11,0.5);">
          ${def.avatarSvg}
        </div>
        <div style="font-size:9px; font-weight:bold; color:#fef08a; font-family:var(--font-display); white-space:nowrap; background:rgba(0,0,0,0.7); padding:1px 4px; border-radius:3px; margin-top:2px;">
          ${def.defaultName.split(' ')[0]}
        </div>
      </div>
    `;
  }
}
