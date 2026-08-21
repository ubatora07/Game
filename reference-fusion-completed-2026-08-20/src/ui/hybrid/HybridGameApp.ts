import { store } from '../../core/GameState';
import { gameLoop } from '../../core/GameLoop';
import { events } from '../../core/EventBus';
import { platform } from '../../services/platform/YandexGamesService';
import { saveService } from '../../services/save/SaveService';
import { RpgSaveAggregate } from '../../services/save/RpgSaveAggregate';
import { selectMostRecentSave } from '../../services/save/SaveSelection';
import { i18n } from '../../services/i18n/I18nService';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { OfflineSystem } from '../../systems/OfflineSystem';
import { DailySystem } from '../../systems/DailySystem';
import { towerSystem } from '../../systems/TowerSystem';
import { campaignCombatService } from '../../systems/CampaignCombatService';
import { adventureEventDirector } from '../../systems/AdventureEventDirector';

// VFX & Layers
import { ParticleCanvas } from '../vfx/ParticleCanvas';
import { FloatingNumbers } from '../vfx/FloatingNumbers';
import { modalManager } from '../components/ModalManager';
import { ToastManager } from '../components/ToastManager';

// Modals
import { AscensionModal } from '../modals/AscensionModal';
import { SummonResultModal } from '../modals/SummonResultModal';
import { OfflineRewardModal } from '../modals/OfflineRewardModal';
import { ReincarnateModal } from '../modals/ReincarnateModal';
import { SettingsModal } from '../modals/SettingsModal';
import { StatsModal } from '../modals/StatsModal';
import { MoreMenuModal } from '../modals/MoreMenuModal';
import { ClassSelectionModal } from '../modals/ClassSelectionModal';
import { PartnerAwakeningModal } from '../modals/PartnerAwakeningModal';
import { RhythmMasterEasterEggModal } from '../modals/RhythmMasterEasterEggModal';
import { AdventureEventModal } from '../modals/AdventureEventModal';
import { HeroRecruitmentModal } from '../modals/HeroRecruitmentModal';
import { MarketModal } from '../modals/MarketModal';
import { PetModal } from '../modals/PetModal';
import { BuildingInspectionModal } from '../modals/BuildingInspectionModal';
import { NPCDialogueModal } from '../modals/NPCDialogueModal';
import { ForgeCraftingModal } from '../modals/ForgeCraftingModal';
import { EquipmentInventoryModal } from '../modals/EquipmentInventoryModal';
import { EquipmentEvolutionModal } from '../modals/EquipmentEvolutionModal';
import { MercenaryGuildModal } from '../modals/MercenaryGuildModal';
import { TitleSelectionModal } from '../modals/TitleSelectionModal';
import { SettlementRaidModal } from '../modals/SettlementRaidModal';
import { SettlementStoryModal } from '../modals/SettlementStoryModal';
import { LegacyCodexModal } from '../modals/LegacyCodexModal';

// Hybrid Components & Screens
import { HybridHeader } from './components/HybridHeader';
import { HybridNavigation } from './components/HybridNavigation';
import { HybridBattleScreen } from './screens/HybridBattleScreen';
import { HybridInventoryScreen } from './screens/HybridInventoryScreen';
import { HybridSettlementScreen } from './screens/HybridSettlementScreen';
import { HybridHeroScreen } from './screens/HybridHeroScreen';

// Secondary / Canonical Screens
import { AscensionScreen } from '../screens/AscensionScreen';
import { TowerScreen } from '../screens/TowerScreen';
import { HeroesScreen } from '../screens/HeroesScreen';
import { SummonScreen } from '../screens/SummonScreen';
import { SoulTreeScreen } from '../screens/SoulTreeScreen';
import { QuestsScreen } from '../screens/QuestsScreen';
import { RelicsScreen } from '../screens/RelicsScreen';
import { ExpeditionsScreen } from '../screens/ExpeditionsScreen';
import { DailyScreen } from '../screens/DailyScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TeamHubScreen } from '../screens/TeamHubScreen';
import { WorldHubScreen } from '../screens/WorldHubScreen';

export class HybridGameApp {
  private header!: HybridHeader;
  private navigation!: HybridNavigation;
  private viewport!: HTMLElement;
  private screens: Map<string, HTMLElement> = new Map();
  private activeScreenId: string = 'battle';

  private hybridBattleScreen!: HybridBattleScreen;
  private hybridInventoryScreen!: HybridInventoryScreen;
  private hybridSettlementScreen!: HybridSettlementScreen;
  private hybridHeroScreen!: HybridHeroScreen;

  public async bootstrap(): Promise<void> {
    console.log('[HybridGameApp] Bootstrapping Hybrid Beta 0.1...');

    // 1. Initialize Platform & Language
    await platform.init();
    const detectedLang = platform.getLanguage();
    i18n.setLanguage(detectedLang);

    // 2. Load Real Save V7
    const localSave = saveService.loadLocal();
    const cloudSave = await platform.loadCloudSave();
    const activeSave = selectMostRecentSave(localSave, cloudSave);

    if (activeSave) {
      store.replace(activeSave);
      RpgSaveAggregate.hydrate(activeSave);
    }

    campaignCombatService.spawnCurrentEncounter();
    towerSystem.resetToFloor(store.get().towerFloor);

    // 3. UI Shell Setup
    const appEl = document.getElementById('app') || document.body;
    appEl.innerHTML = '';
    appEl.className = 'hybrid-shell';

    // VFX Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'background-canvas';
    canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;';
    appEl.appendChild(canvas);
    const particleCanvas = new ParticleCanvas(canvas);

    // Floating Numbers Layer
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

    // Register Modals
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

    adventureEventDirector.init();

    // Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastLayer';
    toastContainer.style.cssText = 'position:fixed; top:70px; right:16px; z-index:300; display:flex; flex-direction:column; align-items:flex-end; pointer-events:none;';
    appEl.appendChild(toastContainer);
    ToastManager.init(toastContainer);

    // Header & Navigation
    this.header = new HybridHeader();
    appEl.appendChild(this.header.getElement());

    this.navigation = new HybridNavigation();
    appEl.appendChild(this.navigation.getElement());

    // Main Viewport
    this.viewport = document.createElement('main');
    this.viewport.className = 'hybrid-viewport';
    appEl.appendChild(this.viewport);

    // 4. Initialize Hybrid and Standard Screens
    this.hybridBattleScreen = new HybridBattleScreen();
    this.hybridInventoryScreen = new HybridInventoryScreen();
    this.hybridSettlementScreen = new HybridSettlementScreen();
    this.hybridHeroScreen = new HybridHeroScreen();

    const teamHubScreen = new TeamHubScreen();
    const worldHubScreen = new WorldHubScreen();
    const towerScreen = new TowerScreen();
    const heroesScreen = new HeroesScreen();
    const summonScreen = new SummonScreen();
    const soulTreeScreen = new SoulTreeScreen();
    const questsScreen = new QuestsScreen();
    const relicsScreen = new RelicsScreen();
    const expeditionsScreen = new ExpeditionsScreen();
    const dailyScreen = new DailyScreen();
    const sectScreen = new HomeScreen(particleCanvas);
    const ascensionScreen = new AscensionScreen();

    this.screens = new Map([
      ['battle', this.hybridBattleScreen.getElement()],
      ['bank', this.hybridInventoryScreen.getElement()],
      ['settlement', this.hybridSettlementScreen.getElement()],
      ['hero', this.hybridHeroScreen.getElement()],
      ['team', teamHubScreen.getElement()],
      ['world', worldHubScreen.getElement()],
      ['tower', towerScreen.getElement()],
      ['heroes', heroesScreen.getElement()],
      ['summon', summonScreen.getElement()],
      ['souls', soulTreeScreen.getElement()],
      ['quests', questsScreen.getElement()],
      ['relics', relicsScreen.getElement()],
      ['expeditions', expeditionsScreen.getElement()],
      ['dailies', dailyScreen.getElement()],
      ['sect', sectScreen.getElement()],
      ['ascension', ascensionScreen.getElement()],
    ]);

    // Navigation events
    this.navigation.onNavigate((screenId) => {
      this.switchScreen(screenId);
    });

    events.on('screen:change', ({ screenId }) => {
      this.switchScreen(screenId);
    });

    this.switchScreen('battle');

    // Offline progress check
    const offlineGains = OfflineSystem.calculateOfflineGains(store.get());
    if (offlineGains) {
      setTimeout(() => {
        events.emit('modal:open', { modalId: 'offline_reward', data: { gains: offlineGains } });
      }, 500);
    }
    DailySystem.checkDailyReset();

    // 5. Hook Main Game Loop
    let lastRender = 0;
    gameLoop.addCallback((dt, now) => {
      const state = store.get();
      EconomyEngine.calculateMetrics(state, now);

      lastRender += dt;
      if (lastRender >= 0.1) {
        lastRender = 0;
        this.header.update();
        if (this.activeScreenId === 'battle') this.hybridBattleScreen.update();
        else if (this.activeScreenId === 'bank') this.hybridInventoryScreen.update();
        else if (this.activeScreenId === 'settlement') this.hybridSettlementScreen.update();
        else if (this.activeScreenId === 'hero') this.hybridHeroScreen.update();
      }
    });

    gameLoop.start();
  }

  public switchScreen(screenId: string): void {
    this.activeScreenId = screenId;
    this.viewport.innerHTML = '';
    const screenEl = this.screens.get(screenId);
    if (screenEl) {
      this.viewport.appendChild(screenEl);
    }
    this.navigation.setActiveScreen(screenId);

    if (screenId === 'battle') this.hybridBattleScreen.update();
    else if (screenId === 'bank') this.hybridInventoryScreen.update();
    else if (screenId === 'settlement') this.hybridSettlementScreen.update();
    else if (screenId === 'hero') this.hybridHeroScreen.update();
  }
}
