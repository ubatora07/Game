import type { CharacterAnimationState, GoblinTier, PetGrowthStage } from '../PixelSpriteRenderer';
import { PixelSpriteRenderer } from '../PixelSpriteRenderer';
import type {
  EnemySpriteDefinition,
  PetSpriteDefinition,
  PlayerSpriteDefinition,
  WorldArtDefinition,
  WorldParallaxLayerDefinition,
} from './ArtAssetTypes';
import { resolveEnemySprite } from './EnemySpriteRegistry';
import { resolvePetSprite } from './PetSpriteRegistry';
import { resolvePlayerSprite } from './PlayerSpriteRegistry';
import { resolveWorldArt } from './WorldArtRegistry';
import type { CharacterClassId } from '../../../content/classes';

function animationClass(state: CharacterAnimationState): string {
  if (state === 'hurt') return 'animate-hurt';
  if (state === 'attack') return 'animate-slash';
  if (state === 'crit') return 'animate-crit-cleave';
  if (state === 'victory') return 'animate-victory-cheer';
  return 'animate-pixel-idle';
}

function layerBackground(layer: WorldParallaxLayerDefinition): string {
  const { pattern, primaryColor, secondaryColor, id } = layer;
  const size = '192px 100%';

  let image: string;
  switch (pattern) {
    case 'forest':
      image = id === 'sky'
        ? `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        : id === 'far'
          ? `linear-gradient(150deg, transparent 0 36%, ${primaryColor} 37% 62%, transparent 63%), linear-gradient(210deg, transparent 0 42%, ${secondaryColor} 43% 66%, transparent 67%)`
          : id === 'mid'
            ? `radial-gradient(ellipse at 18% 68%, ${primaryColor} 0 20%, transparent 21%), radial-gradient(ellipse at 64% 72%, ${secondaryColor} 0 24%, transparent 25%)`
            : `linear-gradient(165deg, transparent 0 46%, ${primaryColor} 47% 70%, ${secondaryColor} 71% 100%)`;
      break;
    case 'sakura':
      image = id === 'sky'
        ? `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        : id === 'far'
          ? `linear-gradient(155deg, transparent 0 40%, ${primaryColor} 41% 64%, transparent 65%), linear-gradient(205deg, transparent 0 45%, ${secondaryColor} 46% 68%, transparent 69%)`
          : id === 'mid'
            ? `radial-gradient(circle at 16% 48%, ${secondaryColor} 0 7%, transparent 8%), radial-gradient(circle at 58% 40%, ${primaryColor} 0 9%, transparent 10%), linear-gradient(90deg, transparent 0 20%, ${primaryColor} 21% 25%, transparent 26% 68%, ${secondaryColor} 69% 73%, transparent 74%)`
            : `linear-gradient(175deg, transparent 0 56%, ${primaryColor} 57% 76%, ${secondaryColor} 77% 100%)`;
      break;
    case 'abyss':
      image = id === 'sky'
        ? `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        : id === 'far'
          ? `linear-gradient(160deg, transparent 0 38%, ${primaryColor} 39% 66%, transparent 67%), linear-gradient(200deg, transparent 0 45%, ${secondaryColor} 46% 71%, transparent 72%)`
          : id === 'mid'
            ? `radial-gradient(circle at 20% 78%, ${secondaryColor} 0 7%, transparent 8%), radial-gradient(circle at 70% 82%, ${primaryColor} 0 10%, transparent 11%), linear-gradient(0deg, ${primaryColor} 0 8%, transparent 9%)`
            : `linear-gradient(170deg, transparent 0 52%, ${primaryColor} 53% 68%, ${secondaryColor} 69% 100%)`;
      break;
    case 'frozen':
      image = id === 'sky'
        ? `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        : id === 'far'
          ? `linear-gradient(150deg, transparent 0 38%, ${primaryColor} 39% 60%, transparent 61%), linear-gradient(210deg, transparent 0 44%, ${secondaryColor} 45% 66%, transparent 67%)`
          : id === 'mid'
            ? `linear-gradient(120deg, transparent 0 42%, ${secondaryColor} 43% 50%, transparent 51%), linear-gradient(240deg, transparent 0 49%, ${primaryColor} 50% 58%, transparent 59%)`
            : `linear-gradient(178deg, transparent 0 58%, ${primaryColor} 59% 74%, ${secondaryColor} 75% 100%)`;
      break;
    case 'void':
      image = id === 'sky'
        ? `radial-gradient(circle at 22% 24%, ${secondaryColor} 0 2px, transparent 3px), radial-gradient(circle at 72% 38%, ${primaryColor} 0 1px, transparent 2px), linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        : id === 'far'
          ? `radial-gradient(ellipse at 24% 64%, ${primaryColor} 0 11%, transparent 12%), radial-gradient(ellipse at 72% 58%, ${secondaryColor} 0 14%, transparent 15%)`
          : id === 'mid'
            ? `linear-gradient(145deg, transparent 0 44%, ${primaryColor} 45% 54%, transparent 55%), linear-gradient(220deg, transparent 0 51%, ${secondaryColor} 52% 61%, transparent 62%)`
            : `linear-gradient(176deg, transparent 0 62%, ${primaryColor} 63% 78%, ${secondaryColor} 79% 100%)`;
      break;
    default:
      image = `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
      break;
  }

  return `background-image:${image}; background-size:${size}; background-repeat:repeat-x;`;
}

function renderGenericPlayer(def: PlayerSpriteDefinition, state: CharacterAnimationState, rankColor: string): string {
  const anim = animationClass(state);
  const attackShift = state === 'attack' || state === 'crit' ? 3 : 0;
  const victoryLift = state === 'victory' ? -3 : 0;
  const accent = rankColor || def.accentColor;

  const weapon = def.silhouette === 'mage'
    ? `<g transform="translate(${attackShift} ${victoryLift})"><rect x="42" y="17" width="3" height="34" fill="#78350f"/><circle cx="43.5" cy="14" r="6" fill="${def.accentColor}" opacity="0.9"/><circle cx="43.5" cy="14" r="2" fill="#fff"/></g>`
    : def.silhouette === 'archer'
      ? `<g transform="translate(${attackShift} ${victoryLift})"><path d="M44 12 Q55 32 44 52" fill="none" stroke="#a16207" stroke-width="3"/><path d="M44 12 L44 52" stroke="#fef3c7" stroke-width="1"/><line x1="37" y1="32" x2="56" y2="32" stroke="${def.accentColor}" stroke-width="2"/><polygon points="56,32 51,29 51,35" fill="${def.accentColor}"/></g>`
      : `<g transform="translate(${attackShift} ${victoryLift})"><path d="M41 29 L54 13 L57 16 L45 34 Z" fill="#cbd5e1" stroke="#334155"/><path d="M43 36 L56 48 L53 51 L40 40 Z" fill="#94a3b8" stroke="#334155"/></g>`;

  const hood = def.silhouette === 'assassin'
    ? `<path d="M19 22 Q24 8 32 8 Q40 8 45 22 L39 27 H24 Z" fill="#09090b" stroke="${def.accentColor}" stroke-width="1.5"/>`
    : def.silhouette === 'mage'
      ? `<polygon points="20,17 32,3 45,18 39,21 25,21" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="1.5"/>`
      : `<path d="M22 17 Q26 9 33 10 Q40 10 43 18 Q38 14 32 14 Q26 14 22 17" fill="#1f2937"/>`;

  return `<svg class="pixel-sprite player-${def.classId} ${anim}" viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated; overflow:visible;">
    <ellipse cx="31" cy="58" rx="15" ry="4" fill="rgba(0,0,0,.45)"/>
    ${state === 'crit' || state === 'victory' ? `<circle cx="31" cy="31" r="25" fill="${accent}" opacity=".13"/>` : ''}
    <g transform="translate(0 ${victoryLift})">
      <rect x="23" y="44" width="7" height="12" fill="#18181b"/><rect x="34" y="44" width="7" height="12" fill="#18181b"/>
      <path d="M20 29 L44 29 L41 47 L23 47 Z" fill="${def.bodyColor}" stroke="#09090b" stroke-width="1.5"/>
      <path d="M24 31 L32 42 L40 31" fill="none" stroke="${def.accentColor}" stroke-width="2"/>
      <circle cx="32" cy="20" r="9" fill="#fed7aa"/>
      ${hood}
      <rect x="28" y="19" width="3" height="3" fill="#111827"/><rect x="35" y="19" width="3" height="3" fill="#111827"/>
      <rect x="18" y="30" width="6" height="14" fill="${def.bodyColor}"/><rect x="41" y="30" width="6" height="14" fill="${def.bodyColor}"/>
    </g>
    ${weapon}
  </svg>`;
}

function renderGenericPet(def: PetSpriteDefinition, stage: PetGrowthStage): string {
  const scale = stage === 1 ? 0.78 : stage === 2 ? 0.94 : 1.08;
  const aura = stage === 3 ? `<circle cx="32" cy="30" r="25" fill="${def.accentColor}" opacity=".12"/>` : '';
  let body: string;
  if (def.silhouette === 'wolf') {
    body = `<path d="M14 37 Q10 28 17 21 L21 12 L27 19 Q36 16 43 22 L50 14 L48 29 Q53 35 48 43 Q41 50 28 47 Q18 48 14 37Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="2"/><polygon points="20,19 15,9 27,16" fill="${def.bodyColor}"/><polygon points="42,20 50,10 49,27" fill="${def.bodyColor}"/><circle cx="39" cy="28" r="2" fill="#fff"/><path d="M14 38 Q5 36 7 28" fill="none" stroke="${def.bodyColor}" stroke-width="5"/>`;
  } else if (def.silhouette === 'golem') {
    body = `<rect x="18" y="20" width="28" height="28" rx="3" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="2"/><rect x="23" y="12" width="18" height="15" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="2"/><rect x="10" y="25" width="10" height="18" fill="${def.bodyColor}"/><rect x="44" y="25" width="10" height="18" fill="${def.bodyColor}"/><circle cx="28" cy="19" r="2" fill="${def.accentColor}"/><circle cx="36" cy="19" r="2" fill="${def.accentColor}"/><path d="M27 34h10M32 29v10" stroke="${def.accentColor}" stroke-width="2"/>`;
  } else {
    body = `<path d="M32 12 Q42 19 43 30 Q42 43 32 50 Q22 43 21 30 Q22 19 32 12Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="2"/><path d="M22 25 Q9 17 8 27 Q14 34 22 36" fill="${def.accentColor}" opacity=".55"/><path d="M42 25 Q55 17 56 27 Q50 34 42 36" fill="${def.accentColor}" opacity=".55"/><circle cx="29" cy="27" r="2" fill="#fff"/><circle cx="36" cy="27" r="2" fill="#fff"/>`;
  }
  return `<svg class="pixel-sprite pet-${def.petId} animate-float-slow" viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;overflow:visible;transform:scale(${scale});transform-origin:50% 90%;">
    ${aura}<ellipse cx="32" cy="54" rx="13" ry="3" fill="rgba(0,0,0,.4)"/>${body}
    ${stage >= 2 ? `<path d="M25 13 L29 6 L32 13 M36 13 L40 6 L42 15" fill="${def.accentColor}"/>` : ''}
  </svg>`;
}

function renderGenericEnemy(def: EnemySpriteDefinition, tier: GoblinTier, isHurt: boolean): string {
  const hurt = isHurt ? 'filter:brightness(1.7);' : '';
  const bossAura = tier === 'boss' ? `<circle cx="48" cy="47" r="42" fill="${def.presentation.bossAura || def.accentColor}" opacity=".12"/>` : '';
  let body: string;

  switch (def.silhouette) {
    case 'wolf':
    case 'beast':
      body = `<path d="M18 58 Q14 40 28 32 Q43 24 61 33 L73 24 L70 43 Q80 52 70 64 Q58 73 39 67 Q24 71 18 58Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><polygon points="29,34 21,18 38,29" fill="${def.bodyColor}"/><circle cx="59" cy="43" r="3" fill="${def.eyeColor}"/><path d="M18 57 Q7 55 8 42" fill="none" stroke="${def.bodyColor}" stroke-width="8"/>`;
      break;
    case 'tree':
      body = `<path d="M41 72 L38 48 L24 56 L34 42 L22 39 L37 31 L36 18 L48 30 L59 17 L57 33 L73 39 L60 44 L69 58 L53 50 L54 72Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><circle cx="43" cy="39" r="3" fill="${def.eyeColor}"/><circle cx="52" cy="39" r="3" fill="${def.eyeColor}"/>`;
      break;
    case 'golem':
      body = `<rect x="27" y="25" width="42" height="43" rx="4" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><rect x="34" y="14" width="28" height="23" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><rect x="15" y="31" width="15" height="31" fill="${def.bodyColor}"/><rect x="66" y="31" width="15" height="31" fill="${def.bodyColor}"/><circle cx="42" cy="25" r="3" fill="${def.eyeColor}"/><circle cx="54" cy="25" r="3" fill="${def.eyeColor}"/>`;
      break;
    case 'dragon':
      body = `<path d="M30 60 Q24 42 38 31 L44 16 L51 29 Q65 29 72 41 Q79 56 67 68 Q53 78 38 69Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><path d="M38 38 Q17 20 12 35 Q20 46 34 51" fill="${def.accentColor}" opacity=".5"/><path d="M62 37 Q80 20 84 37 Q76 47 68 52" fill="${def.accentColor}" opacity=".5"/><circle cx="59" cy="39" r="3" fill="${def.eyeColor}"/>`;
      break;
    case 'spirit':
      body = `<path d="M48 13 Q68 28 65 49 Q62 69 48 80 Q34 69 31 49 Q28 28 48 13Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3" opacity=".88"/><path d="M31 58 Q22 70 31 80 M65 58 Q74 70 65 80" fill="none" stroke="${def.accentColor}" stroke-width="4"/><circle cx="42" cy="39" r="3" fill="${def.eyeColor}"/><circle cx="55" cy="39" r="3" fill="${def.eyeColor}"/>`;
      break;
    case 'demon':
      body = `<path d="M29 69 L26 37 Q29 24 40 21 L35 10 L47 18 L59 9 L57 23 Q69 28 70 42 L66 69Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><circle cx="43" cy="37" r="3" fill="${def.eyeColor}"/><circle cx="56" cy="37" r="3" fill="${def.eyeColor}"/><path d="M25 45 Q10 32 9 47 Q16 58 27 58 M69 45 Q84 32 86 48 Q78 58 68 58" fill="${def.accentColor}" opacity=".45"/>`;
      break;
    case 'void':
      body = `<path d="M48 14 Q71 21 73 44 Q73 66 58 76 Q45 84 31 73 Q18 63 22 43 Q26 21 48 14Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><ellipse cx="49" cy="42" rx="13" ry="8" fill="#09090b" stroke="${def.accentColor}" stroke-width="2"/><circle cx="49" cy="42" r="4" fill="${def.eyeColor}"/><path d="M30 67 Q18 80 24 87 M42 73 Q35 87 42 91 M57 73 Q64 87 58 91 M67 66 Q82 78 74 88" fill="none" stroke="${def.bodyColor}" stroke-width="6"/>`;
      break;
    case 'humanoid':
    default:
      body = `<circle cx="48" cy="25" r="12" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="2"/><path d="M31 43 Q48 31 65 43 L62 71 L34 71Z" fill="${def.bodyColor}" stroke="${def.accentColor}" stroke-width="3"/><circle cx="43" cy="24" r="3" fill="${def.eyeColor}"/><circle cx="54" cy="24" r="3" fill="${def.eyeColor}"/><path d="M29 47 L15 66 M67 47 L81 64" stroke="${def.accentColor}" stroke-width="5"/><path d="M19 63 L12 71 M77 62 L85 68" stroke="#cbd5e1" stroke-width="3"/>`;
      break;
  }

  return `<svg class="pixel-sprite enemy-${def.spriteId} ${isHurt ? 'animate-hurt' : 'animate-pixel-idle'}" viewBox="0 0 96 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;overflow:visible;${hurt}">
    ${bossAura}<ellipse cx="48" cy="82" rx="24" ry="6" fill="rgba(0,0,0,.45)"/>${body}
  </svg>`;
}

export class ArtRuntimeRenderer {
  public static renderWorld(bgAsset: string, reducedMotion: boolean = false): string {
    const def: WorldArtDefinition = resolveWorldArt(bgAsset);
    const layers = def.layers.map((layer) => {
      const duration = Math.max(10, Math.round(44 / Math.max(0.04, layer.speed)));
      const animation = reducedMotion ? 'none' : `battle-parallax-scroll ${duration}s linear infinite`;
      return `<div class="battle-parallax-layer battle-parallax-${layer.id}" data-art-layer="${layer.assetId}" style="position:absolute;inset:0;z-index:${layer.zIndex};opacity:${layer.opacity};pointer-events:none;${layerBackground(layer)}animation:${animation};will-change:background-position;"></div>`;
    }).join('');

    return `<div class="battle-world-art" data-bg-asset="${def.bgAsset}" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">${layers}<div style="position:absolute;inset:0;z-index:4;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.2));"></div></div>`;
  }

  public static renderEnemy(spriteId: string, tier: GoblinTier, isHurt: boolean = false): string {
    const def = resolveEnemySprite(spriteId);
    if (spriteId === 'enemy_goblin') return PixelSpriteRenderer.getGoblinSprite(tier, isHurt);
    return renderGenericEnemy(def, tier, isHurt);
  }

  public static renderPlayer(classId: CharacterClassId | null | undefined, state: CharacterAnimationState, rankColor: string): string {
    const def = resolvePlayerSprite(classId);
    if (def.classId === 'swordsman') return PixelSpriteRenderer.getSwordsmanSprite(state, rankColor);
    return renderGenericPlayer(def, state, rankColor);
  }

  public static renderPet(petId: string, stage: PetGrowthStage): string {
    const def = resolvePetSprite(petId);
    if (def.petId === 'pet_ignis_drake') return PixelSpriteRenderer.getPetSprite(stage);
    return renderGenericPet(def, stage);
  }
}
