import { store } from '../../core/GameState';
import { i18n } from '../../services/i18n/I18nService';
import { saveService } from '../../services/save/SaveService';
import { RpgSaveAggregate } from '../../services/save/RpgSaveAggregate';
import { Header } from '../../ui/components/Header';
import { Navigation } from '../../ui/components/Navigation';
import { modalManager } from '../../ui/components/ModalManager';
import { ToastManager } from '../../ui/components/ToastManager';
import { ParticleCanvas } from '../../ui/vfx/ParticleCanvas';
import { FloatingNumbers } from '../../ui/vfx/FloatingNumbers';

// Modals
import { AscensionModal } from '../../ui/modals/AscensionModal';
import { SummonResultModal } from '../../ui/modals/SummonResultModal';
import { OfflineRewardModal } from '../../ui/modals/OfflineRewardModal';
import { ReincarnateModal } from '../../ui/modals/ReincarnateModal';
import { SettingsModal } from '../../ui/modals/SettingsModal';
import { StatsModal } from '../../ui/modals/StatsModal';
import { MoreMenuModal } from '../../ui/modals/MoreMenuModal';
import { ClassSelectionModal } from '../../ui/modals/ClassSelectionModal';
import { PartnerAwakeningModal } from '../../ui/modals/PartnerAwakeningModal';
import { RhythmMasterEasterEggModal } from '../../ui/modals/RhythmMasterEasterEggModal';
import { AdventureEventModal } from '../../ui/modals/AdventureEventModal';
import { HeroRecruitmentModal } from '../../ui/modals/HeroRecruitmentModal';
import { MarketModal } from '../../ui/modals/MarketModal';
import { PetModal } from '../../ui/modals/PetModal';
import { BuildingInspectionModal } from '../../ui/modals/BuildingInspectionModal';
import { NPCDialogueModal } from '../../ui/modals/NPCDialogueModal';
import { ForgeCraftingModal } from '../../ui/modals/ForgeCraftingModal';
import { EquipmentInventoryModal } from '../../ui/modals/EquipmentInventoryModal';
import { EquipmentEvolutionModal } from '../../ui/modals/EquipmentEvolutionModal';
import { MercenaryGuildModal } from '../../ui/modals/MercenaryGuildModal';
import { TitleSelectionModal } from '../../ui/modals/TitleSelectionModal';
import { SettlementRaidModal } from '../../ui/modals/SettlementRaidModal';
import { SettlementStoryModal } from '../../ui/modals/SettlementStoryModal';
import { LegacyCodexModal } from '../../ui/modals/LegacyCodexModal';

// Screens
import { BattleScreen } from '../../ui/screens/BattleScreen';
import { AscensionScreen } from '../../ui/screens/AscensionScreen';
import { TowerScreen } from '../../ui/screens/TowerScreen';
import { HeroesScreen } from '../../ui/screens/HeroesScreen';
import { SummonScreen } from '../../ui/screens/SummonScreen';
import { SoulTreeScreen } from '../../ui/screens/SoulTreeScreen';
import { QuestsScreen } from '../../ui/screens/QuestsScreen';
import { RelicsScreen } from '../../ui/screens/RelicsScreen';
import { ExpeditionsScreen } from '../../ui/screens/ExpeditionsScreen';
import { DailyScreen } from '../../ui/screens/DailyScreen';
import { SettlementScreen } from '../../ui/screens/SettlementScreen';
import { HomeScreen } from '../../ui/screens/HomeScreen';
import { HeroHubScreen } from '../../ui/screens/HeroHubScreen';
import { TeamHubScreen } from '../../ui/screens/TeamHubScreen';
import { WorldHubScreen } from '../../ui/screens/WorldHubScreen';
import { createScreenRouteRegistry } from '../../ui/navigation/ScreenRouteRegistry';

import {
  BridgeMessageToPreview,
  BridgeMessageToHost,
  UiElementNode,
  ScreenLayoutDraft,
  BreakpointKey,
  EditorMode,
  PreviewStatePreset,
  StyleOverride,
} from '../EditorTypes';
import { createMockStatePreset } from './MockStatePresets';

export class EditorPreviewApp {
  private screens: Map<string, HTMLElement> = new Map();
  private screenViewport: HTMLElement | null = null;
  private particleCanvas: ParticleCanvas | null = null;
  private currentScreenId: string = 'battle';
  private currentModalId: string | null = null;
  private currentMode: EditorMode = 'edit';
  private currentDraft: ScreenLayoutDraft | null = null;
  private currentBreakpoint: BreakpointKey = 'base';
  private selectedElementId: string | null = null;
  private hoveredElementId: string | null = null;
  private isAnimationsPaused: boolean = false;
  private isCombatFrozen: boolean = false;

  private draftStyleEl: HTMLStyleElement | null = null;
  private highlightStyleEl: HTMLStyleElement | null = null;

  public async init(): Promise<void> {
    console.log('[EditorPreviewApp] Initializing sandbox preview...');

    // Intercept save writes in sandbox
    saveService.saveLocal = () => {};

    // Initialize mock / cloned state
    const realSave = saveService.loadLocal();
    const mockState = createMockStatePreset('mock_normal', realSave || undefined);
    store.replace(mockState);
    RpgSaveAggregate.hydrate(mockState);
    i18n.setLanguage('ru');

    // Build DOM shell inside preview
    const appEl = document.getElementById('app') || document.body;
    appEl.innerHTML = '';

    // VFX Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'background-canvas';
    appEl.appendChild(canvas);
    this.particleCanvas = new ParticleCanvas(canvas);

    // Floating Numbers Container
    const numbersContainer = document.createElement('div');
    numbersContainer.id = 'floatingNumbersLayer';
    numbersContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; overflow:hidden; pointer-events:none; z-index:90;';
    appEl.appendChild(numbersContainer);
    FloatingNumbers.init(numbersContainer);

    // Modal Layer
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalLayer';
    modalContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:200; display:none; align-items:center; justify-content:center;';
    appEl.appendChild(modalContainer);
    modalManager.init(modalContainer);

    // Register all Modals
    modalManager.register(AscensionModal);
    modalManager.register(SummonResultModal);
    modalManager.register(OfflineRewardModal);
    modalManager.register(ReincarnateModal);
    modalManager.register(SettingsModal);
    modalManager.register(StatsModal);
    modalManager.register(MoreMenuModal);
    modalManager.register(ClassSelectionModal);
    modalManager.register(PartnerAwakeningModal);
    modalManager.register(RhythmMasterEasterEggModal);
    modalManager.register(AdventureEventModal);
    modalManager.register(HeroRecruitmentModal);
    modalManager.register(MarketModal);
    modalManager.register(PetModal);
    modalManager.register(BuildingInspectionModal);
    modalManager.register(NPCDialogueModal);
    modalManager.register(ForgeCraftingModal);
    modalManager.register(EquipmentInventoryModal);
    modalManager.register(EquipmentEvolutionModal);
    modalManager.register(MercenaryGuildModal);
    modalManager.register(TitleSelectionModal);
    modalManager.register(SettlementRaidModal);
    modalManager.register(SettlementStoryModal);
    modalManager.register(LegacyCodexModal);

    // Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastLayer';
    toastContainer.style.cssText = 'position:fixed; top:70px; right:16px; z-index:300; display:flex; flex-direction:column; align-items:flex-end; pointer-events:none;';
    appEl.appendChild(toastContainer);
    ToastManager.init(toastContainer);

    // Header
    const header = new Header();
    const headerEl = header.getElement();
    headerEl.setAttribute('data-ui-id', 'shell.header');
    headerEl.setAttribute('data-source-file', 'src/ui/components/Header.ts');
    appEl.appendChild(headerEl);

    // Main Viewport
    this.screenViewport = document.createElement('main');
    this.screenViewport.className = 'app-viewport';
    this.screenViewport.setAttribute('data-ui-id', 'shell.viewport');
    appEl.appendChild(this.screenViewport);

    // Bottom Navigation
    const nav = new Navigation();
    const navEl = nav.getElement();
    navEl.setAttribute('data-ui-id', 'shell.navigation');
    navEl.setAttribute('data-source-file', 'src/ui/components/Navigation.ts');
    appEl.appendChild(navEl);

    // Setup Screens
    const battleScreen = new BattleScreen(this.particleCanvas);
    const battleEl = battleScreen.getElement();
    battleEl.setAttribute('data-ui-id', 'screen.battle');
    battleEl.setAttribute('data-source-file', 'src/ui/screens/BattleScreen.ts');

    const heroHubScreen = new HeroHubScreen();
    const heroHubEl = heroHubScreen.getElement();
    heroHubEl.setAttribute('data-ui-id', 'screen.hero');
    heroHubEl.setAttribute('data-source-file', 'src/ui/screens/HeroHubScreen.ts');

    const teamHubScreen = new TeamHubScreen();
    const teamHubEl = teamHubScreen.getElement();
    teamHubEl.setAttribute('data-ui-id', 'screen.team');
    teamHubEl.setAttribute('data-source-file', 'src/ui/screens/TeamHubScreen.ts');

    const settlementScreen = new SettlementScreen();
    const settlementEl = settlementScreen.getElement();
    settlementEl.setAttribute('data-ui-id', 'screen.settlement');
    settlementEl.setAttribute('data-source-file', 'src/ui/screens/SettlementScreen.ts');

    const worldHubScreen = new WorldHubScreen();
    const worldHubEl = worldHubScreen.getElement();
    worldHubEl.setAttribute('data-ui-id', 'screen.world');
    worldHubEl.setAttribute('data-source-file', 'src/ui/screens/WorldHubScreen.ts');

    const ascensionScreen = new AscensionScreen();
    const towerScreen = new TowerScreen();
    const heroesScreen = new HeroesScreen();
    const summonScreen = new SummonScreen();
    const soulTreeScreen = new SoulTreeScreen();
    const questsScreen = new QuestsScreen();
    const relicsScreen = new RelicsScreen();
    const expeditionsScreen = new ExpeditionsScreen();
    const dailyScreen = new DailyScreen();
    const sectScreen = new HomeScreen(this.particleCanvas);

    this.screens = createScreenRouteRegistry({
      hero: heroHubEl,
      team: teamHubEl,
      battle: battleEl,
      settlement: settlementEl,
      world: worldHubEl,
      sect: sectScreen.getElement(),
      ascension: ascensionScreen.getElement(),
      tower: towerScreen.getElement(),
      heroes: heroesScreen.getElement(),
      summon: summonScreen.getElement(),
      souls: soulTreeScreen.getElement(),
      quests: questsScreen.getElement(),
      relics: relicsScreen.getElement(),
      expeditions: expeditionsScreen.getElement(),
      dailies: dailyScreen.getElement(),
    });

    this.switchScreen('battle');

    // Create style containers
    this.draftStyleEl = document.createElement('style');
    this.draftStyleEl.id = 'editor-draft-styles';
    document.head.appendChild(this.draftStyleEl);

    this.highlightStyleEl = document.createElement('style');
    this.highlightStyleEl.id = 'editor-highlight-styles';
    this.highlightStyleEl.textContent = `
      [data-editor-selected="true"] {
        outline: 2px solid #3b82f6 !important;
        outline-offset: -1px !important;
      }
      [data-editor-hovered="true"]:not([data-editor-selected="true"]) {
        outline: 1px dashed #60a5fa !important;
        outline-offset: -1px !important;
      }
      .editor-design-placeholder {
        background: rgba(59, 130, 246, 0.1);
        border: 1px dashed #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #93c5fd;
        font-family: monospace;
        font-size: 11px;
      }
    `;
    document.head.appendChild(this.highlightStyleEl);

    // Setup input listeners
    this.bindEvents();
    this.setupMessageBridge();

    // Signal ready to host
    this.postMessageToHost({ type: 'PREVIEW_READY', currentScreenId: this.currentScreenId });
    setTimeout(() => this.sendDomTree(), 100);
  }

  public switchScreen(screenId: string): void {
    this.currentScreenId = screenId;
    if (!this.screenViewport) return;
    this.screenViewport.innerHTML = '';
    const screenEl = this.screens.get(screenId);
    if (screenEl) {
      this.screenViewport.appendChild(screenEl);
    }
    this.applyDraftOverrides();
    this.sendDomTree();
  }

  public openModal(modalId: string | null): void {
    this.currentModalId = modalId;
    if (!modalId) {
      modalManager.close();
    } else {
      modalManager.open(modalId);
    }
    this.applyDraftOverrides();
    this.sendDomTree();
  }

  public getCurrentModalId(): string | null {
    return this.currentModalId;
  }

  public getIsAnimationsPaused(): boolean {
    return this.isAnimationsPaused;
  }

  public getIsCombatFrozen(): boolean {
    return this.isCombatFrozen;
  }

  public setStatePreset(preset: PreviewStatePreset): void {
    const realSave = saveService.loadLocal();
    const nextState = createMockStatePreset(preset, realSave || undefined);
    store.replace(nextState);
    RpgSaveAggregate.hydrate(nextState);
    this.switchScreen(this.currentScreenId);
  }

  public applyDraft(draft: ScreenLayoutDraft, breakpoint: BreakpointKey): void {
    this.currentDraft = draft;
    this.currentBreakpoint = breakpoint;
    this.applyDraftOverrides();
  }

  private applyDraftOverrides(): void {
    if (!this.draftStyleEl || !this.currentDraft) return;

    const cssRules: string[] = [];
    const elements = this.currentDraft.elements;

    for (const [id, override] of Object.entries(elements)) {
      const selector = id.startsWith('[data-ui-id') || id.startsWith('#') || id.startsWith('.')
        ? id
        : `[data-ui-id="${id}"]`;

      if (override.hidden) {
        cssRules.push(`${selector} { display: none !important; }`);
        continue;
      }

      // Merge base + breakpoint overrides
      const styles: StyleOverride = {
        ...override.base,
        ...(this.currentBreakpoint === 'tablet' ? override.tablet : {}),
        ...(this.currentBreakpoint === 'mobile' ? override.mobile : {}),
      };

      const declarations: string[] = [];

      if (styles.position) declarations.push(`position: ${styles.position} !important;`);
      if (styles.left !== undefined) declarations.push(`left: ${styles.left} !important;`);
      if (styles.top !== undefined) declarations.push(`top: ${styles.top} !important;`);
      if (styles.right !== undefined) declarations.push(`right: ${styles.right} !important;`);
      if (styles.bottom !== undefined) declarations.push(`bottom: ${styles.bottom} !important;`);
      if (styles.transform) declarations.push(`transform: ${styles.transform} !important;`);
      if (styles.zIndex !== undefined) declarations.push(`z-index: ${styles.zIndex} !important;`);

      if (styles.width !== undefined) declarations.push(`width: ${styles.width} !important;`);
      if (styles.height !== undefined) declarations.push(`height: ${styles.height} !important;`);
      if (styles.minWidth !== undefined) declarations.push(`min-width: ${styles.minWidth} !important;`);
      if (styles.maxWidth !== undefined) declarations.push(`max-width: ${styles.maxWidth} !important;`);
      if (styles.minHeight !== undefined) declarations.push(`min-height: ${styles.minHeight} !important;`);
      if (styles.maxHeight !== undefined) declarations.push(`max-height: ${styles.maxHeight} !important;`);

      if (styles.margin !== undefined) declarations.push(`margin: ${styles.margin} !important;`);
      if (styles.marginTop !== undefined) declarations.push(`margin-top: ${styles.marginTop} !important;`);
      if (styles.marginRight !== undefined) declarations.push(`margin-right: ${styles.marginRight} !important;`);
      if (styles.marginBottom !== undefined) declarations.push(`margin-bottom: ${styles.marginBottom} !important;`);
      if (styles.marginLeft !== undefined) declarations.push(`margin-left: ${styles.marginLeft} !important;`);

      if (styles.padding !== undefined) declarations.push(`padding: ${styles.padding} !important;`);
      if (styles.paddingTop !== undefined) declarations.push(`padding-top: ${styles.paddingTop} !important;`);
      if (styles.paddingRight !== undefined) declarations.push(`padding-right: ${styles.paddingRight} !important;`);
      if (styles.paddingBottom !== undefined) declarations.push(`padding-bottom: ${styles.paddingBottom} !important;`);
      if (styles.paddingLeft !== undefined) declarations.push(`padding-left: ${styles.paddingLeft} !important;`);

      if (styles.gap !== undefined) declarations.push(`gap: ${styles.gap} !important;`);

      if (styles.display) declarations.push(`display: ${styles.display} !important;`);
      if (styles.flexDirection) declarations.push(`flex-direction: ${styles.flexDirection} !important;`);
      if (styles.flexWrap) declarations.push(`flex-wrap: ${styles.flexWrap} !important;`);
      if (styles.justifyContent) declarations.push(`justify-content: ${styles.justifyContent} !important;`);
      if (styles.alignItems) declarations.push(`align-items: ${styles.alignItems} !important;`);
      if (styles.flexGrow !== undefined) declarations.push(`flex-grow: ${styles.flexGrow} !important;`);
      if (styles.flexShrink !== undefined) declarations.push(`flex-shrink: ${styles.flexShrink} !important;`);
      if (styles.flexBasis !== undefined) declarations.push(`flex-basis: ${styles.flexBasis} !important;`);

      if (styles.fontSize) declarations.push(`font-size: ${styles.fontSize} !important;`);
      if (styles.fontWeight) declarations.push(`font-weight: ${styles.fontWeight} !important;`);
      if (styles.lineHeight) declarations.push(`line-height: ${styles.lineHeight} !important;`);
      if (styles.letterSpacing) declarations.push(`letter-spacing: ${styles.letterSpacing} !important;`);
      if (styles.textAlign) declarations.push(`text-align: ${styles.textAlign} !important;`);
      if (styles.color) declarations.push(`color: ${styles.color} !important;`);

      if (styles.opacity !== undefined) declarations.push(`opacity: ${styles.opacity} !important;`);
      if (styles.backgroundColor) declarations.push(`background-color: ${styles.backgroundColor} !important;`);
      if (styles.border) declarations.push(`border: ${styles.border} !important;`);
      if (styles.borderWidth) declarations.push(`border-width: ${styles.borderWidth} !important;`);
      if (styles.borderColor) declarations.push(`border-color: ${styles.borderColor} !important;`);
      if (styles.borderStyle) declarations.push(`border-style: ${styles.borderStyle} !important;`);
      if (styles.borderRadius) declarations.push(`border-radius: ${styles.borderRadius} !important;`);
      if (styles.boxShadow) declarations.push(`box-shadow: ${styles.boxShadow} !important;`);

      if (styles.objectFit) declarations.push(`object-fit: ${styles.objectFit} !important;`);
      if (styles.objectPosition) declarations.push(`object-position: ${styles.objectPosition} !important;`);
      if (styles.imageRendering) declarations.push(`image-rendering: ${styles.imageRendering} !important;`);
      if (styles.filter) declarations.push(`filter: ${styles.filter} !important;`);

      if (declarations.length > 0) {
        cssRules.push(`${selector} { ${declarations.join(' ')} }`);
      }

      // Handle direct DOM text / asset replacement
      try {
        const domNodes = document.querySelectorAll(selector);
        domNodes.forEach((node) => {
          if (override.assetPath && (node instanceof HTMLImageElement)) {
            node.src = override.assetPath;
          }
          if (styles.customText !== undefined && node.childNodes.length <= 1) {
            node.textContent = styles.customText;
          }
        });
      } catch (e) {
        // Ignored for complex selectors
      }
    }

    this.draftStyleEl.textContent = cssRules.join('\n');
  }

  public setSelectedElement(elementId: string | null): void {
    this.selectedElementId = elementId;
    document.querySelectorAll('[data-editor-selected]').forEach((el) => el.removeAttribute('data-editor-selected'));
    if (elementId) {
      const target = this.findElementById(elementId);
      if (target) {
        target.setAttribute('data-editor-selected', 'true');
      }
    }
  }

  public setHoveredElement(elementId: string | null): void {
    this.hoveredElementId = elementId;
    document.querySelectorAll('[data-editor-hovered]').forEach((el) => el.removeAttribute('data-editor-hovered'));
    if (elementId && elementId !== this.selectedElementId) {
      const target = this.findElementById(elementId);
      if (target) {
        target.setAttribute('data-editor-hovered', 'true');
      }
    }
  }

  private findElementById(id: string): HTMLElement | null {
    if (id.startsWith('[data-ui-id') || id.startsWith('#') || id.startsWith('.')) {
      try {
        return document.querySelector(id);
      } catch {
        return null;
      }
    }
    return document.querySelector(`[data-ui-id="${id}"]`) || document.querySelector(`#${id}`);
  }

  private bindEvents(): void {
    window.addEventListener('click', (e) => {
      if (this.currentMode !== 'edit') return;
      e.preventDefault();
      e.stopPropagation();

      const target = (e.target as HTMLElement)?.closest('[data-ui-id], button, .card, .panel, .header, nav, main, div, section, img, span, p, h1, h2, h3') as HTMLElement | null;
      if (!target || target === document.body || target === document.documentElement) return;

      const elementId = this.getElementId(target);
      const rect = target.getBoundingClientRect();

      this.setSelectedElement(elementId);
      this.postMessageToHost({
        type: 'ELEMENT_CLICKED',
        elementId,
        rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
        isMultiSelect: e.shiftKey,
      });
    }, true);

    window.addEventListener('mousemove', (e) => {
      if (this.currentMode !== 'edit') return;
      const target = (e.target as HTMLElement)?.closest('[data-ui-id], button, .card, .panel, .header, nav, main, div, section, img, span, p') as HTMLElement | null;
      if (!target || target === document.body || target === document.documentElement) {
        if (this.hoveredElementId) {
          this.setHoveredElement(null);
          this.postMessageToHost({ type: 'ELEMENT_HOVERED', elementId: null });
        }
        return;
      }
      const id = this.getElementId(target);
      if (id !== this.hoveredElementId) {
        this.setHoveredElement(id);
        this.postMessageToHost({ type: 'ELEMENT_HOVERED', elementId: id });
      }
    });

    window.addEventListener('resize', () => {
      this.sendDomTree();
    });
  }

  private getElementId(el: HTMLElement): string {
    const explicitUiId = el.getAttribute('data-ui-id');
    if (explicitUiId) return explicitUiId;
    if (el.id) return `#${el.id}`;

    // Build hierarchical unique path
    const pathParts: string[] = [];
    let curr: HTMLElement | null = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr.getAttribute('data-ui-id')) {
        pathParts.unshift(`[data-ui-id="${curr.getAttribute('data-ui-id')}"]`);
        break;
      }
      if (curr.id) {
        pathParts.unshift(`#${curr.id}`);
        break;
      }
      const tag = curr.tagName.toLowerCase();
      const parent = curr.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((c) => c.tagName.toLowerCase() === tag);
        if (siblings.length > 1) {
          const index = siblings.indexOf(curr) + 1;
          pathParts.unshift(`${tag}:nth-of-type(${index})`);
        } else {
          pathParts.unshift(tag);
        }
      } else {
        pathParts.unshift(tag);
      }
      curr = curr.parentElement;
    }
    return pathParts.join(' > ');
  }

  public sendDomTree(): void {
    const rootEl = this.screenViewport || document.getElementById('app') || document.body;
    const tree = this.serializeNode(rootEl);
    this.postMessageToHost({ type: 'DOM_TREE_UPDATED', rootNode: tree });
  }

  private serializeNode(el: HTMLElement): UiElementNode {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const explicitUiId = el.getAttribute('data-ui-id') || undefined;
    const sourceFile = el.getAttribute('data-source-file') || undefined;
    const sourceComponent = el.getAttribute('data-source-component') || undefined;
    const isImg = el instanceof HTMLImageElement;

    const children: UiElementNode[] = [];
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      // Skip transient layers
      if (child.id === 'floatingNumbersLayer' || child.id === 'editor-draft-styles' || child.id === 'editor-highlight-styles') {
        continue;
      }
      children.push(this.serializeNode(child));
    }

    return {
      id: this.getElementId(el),
      uiId: explicitUiId,
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      textContent: el.children.length === 0 ? el.textContent?.trim().slice(0, 40) : undefined,
      sourceComponent,
      sourceFile,
      rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      computedStyle: {
        display: style.display,
        position: style.position,
        width: style.width,
        height: style.height,
        padding: style.padding,
        margin: style.margin,
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize,
      },
      isImage: isImg,
      imageSrc: isImg ? (el as HTMLImageElement).src : undefined,
      isDesignOnly: el.classList.contains('editor-design-placeholder'),
      children,
    };
  }

  private setupMessageBridge(): void {
    window.addEventListener('message', (event) => {
      const msg = event.data as BridgeMessageToPreview;
      if (!msg || typeof msg !== 'object' || !msg.type) return;

      switch (msg.type) {
        case 'INIT_PREVIEW':
          if (msg.statePreset) this.setStatePreset(msg.statePreset);
          if (msg.screenId) this.switchScreen(msg.screenId);
          if (msg.modalId !== undefined) this.openModal(msg.modalId);
          break;

        case 'SWITCH_SCREEN':
          this.switchScreen(msg.screenId);
          if (msg.modalId !== undefined) this.openModal(msg.modalId);
          break;

        case 'SET_STATE_PRESET':
          this.setStatePreset(msg.preset);
          break;

        case 'APPLY_DRAFT':
          this.applyDraft(msg.draft, msg.breakpoint);
          break;

        case 'SELECT_ELEMENT':
          this.setSelectedElement(msg.elementId);
          break;

        case 'HOVER_ELEMENT':
          this.setHoveredElement(msg.elementId);
          break;

        case 'SET_MODE':
          this.currentMode = msg.mode;
          break;

        case 'SET_ANIMATIONS_PAUSED':
          this.isAnimationsPaused = msg.paused;
          document.body.style.animationPlayState = msg.paused ? 'paused' : 'running';
          break;

        case 'FREEZE_COMBAT':
          this.isCombatFrozen = msg.freeze;
          break;

        case 'REQUEST_TREE_REFRESH':
          this.sendDomTree();
          break;
      }
    });
  }

  private postMessageToHost(msg: BridgeMessageToHost): void {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
  }
}
