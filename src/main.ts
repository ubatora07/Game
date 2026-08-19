import { store } from './core/GameState';
import { gameLoop } from './core/GameLoop';
import { events } from './core/EventBus';
import { platform } from './services/platform/YandexGamesService';
import { saveService } from './services/save/SaveService';
import { RpgSaveAggregate } from './services/save/RpgSaveAggregate';
import { selectMostRecentSave } from './services/save/SaveSelection';
import { i18n } from './services/i18n/I18nService';
import { EconomyEngine } from './economy/EconomyEngine';
import { OfflineSystem } from './systems/OfflineSystem';
import { QuestSystem } from './systems/QuestSystem';
import { towerSystem } from './systems/TowerSystem';
import { campaignCombatService } from './systems/CampaignCombatService';
import { TrainingSystem } from './systems/TrainingSystem';
import { RandomEventSystem } from './systems/RandomEventSystem';
import { RelicSystem } from './systems/RelicSystem';
import { DailySystem } from './systems/DailySystem';
import { sound } from './services/audio/SoundService';

// UI
import { Header } from './ui/components/Header';
import { Navigation } from './ui/components/Navigation';
import { modalManager } from './ui/components/ModalManager';
import { ToastManager } from './ui/components/ToastManager';
import { ParticleCanvas } from './ui/vfx/ParticleCanvas';
import { FloatingNumbers } from './ui/vfx/FloatingNumbers';

// Modals
import { AscensionModal } from './ui/modals/AscensionModal';
import { SummonResultModal } from './ui/modals/SummonResultModal';
import { OfflineRewardModal } from './ui/modals/OfflineRewardModal';
import { ReincarnateModal } from './ui/modals/ReincarnateModal';
import { SettingsModal } from './ui/modals/SettingsModal';
import { StatsModal } from './ui/modals/StatsModal';
import { MoreMenuModal } from './ui/modals/MoreMenuModal';
import { ClassSelectionModal } from './ui/modals/ClassSelectionModal';
import { PartnerAwakeningModal } from './ui/modals/PartnerAwakeningModal';
import { RhythmMasterEasterEggModal } from './ui/modals/RhythmMasterEasterEggModal';
import { AdventureEventModal } from './ui/modals/AdventureEventModal';
import { HeroRecruitmentModal } from './ui/modals/HeroRecruitmentModal';
import { MarketModal } from './ui/modals/MarketModal';
import { PetModal } from './ui/modals/PetModal';
import { BuildingInspectionModal } from './ui/modals/BuildingInspectionModal';
import { NPCDialogueModal } from './ui/modals/NPCDialogueModal';
import { ForgeCraftingModal } from './ui/modals/ForgeCraftingModal';
import { EquipmentInventoryModal } from './ui/modals/EquipmentInventoryModal';
import { EquipmentEvolutionModal } from './ui/modals/EquipmentEvolutionModal';
import { MercenaryGuildModal } from './ui/modals/MercenaryGuildModal';
import { TitleSelectionModal } from './ui/modals/TitleSelectionModal';
import { SettlementRaidModal } from './ui/modals/SettlementRaidModal';
import { SettlementStoryModal } from './ui/modals/SettlementStoryModal';
import { LegacyCodexModal } from './ui/modals/LegacyCodexModal';

// Screens
import { BattleScreen } from './ui/screens/BattleScreen';
import { AscensionScreen } from './ui/screens/AscensionScreen';
import { TowerScreen } from './ui/screens/TowerScreen';
import { HeroesScreen } from './ui/screens/HeroesScreen';
import { SummonScreen } from './ui/screens/SummonScreen';
import { SoulTreeScreen } from './ui/screens/SoulTreeScreen';
import { QuestsScreen } from './ui/screens/QuestsScreen';
import { RelicsScreen } from './ui/screens/RelicsScreen';
import { ExpeditionsScreen } from './ui/screens/ExpeditionsScreen';
import { DailyScreen } from './ui/screens/DailyScreen';
import { SettlementScreen } from './ui/screens/SettlementScreen';
import { HomeScreen } from './ui/screens/HomeScreen';
import { HeroHubScreen } from './ui/screens/HeroHubScreen';
import { TeamHubScreen } from './ui/screens/TeamHubScreen';
import { WorldHubScreen } from './ui/screens/WorldHubScreen';
import { createScreenRouteRegistry } from './ui/navigation/ScreenRouteRegistry';

class GameApp {
  private screens: Map<string, HTMLElement> = new Map();
  private screenViewport: HTMLElement | null = null;
  private particleCanvas: ParticleCanvas | null = null;
  private devOverlay: { updateFps(): void } | null = null;

  public async bootstrap(): Promise<void> {
    console.log('[Anime Infinite Ascension] Bootstrapping...');
    // Keep mutable debug handles out of production. E2E/dev tooling can still
    // use them while running the Vite development server.
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).events = events;
      (window as any).store = store;
    }

    // 1. Initialize Platform (Yandex Games SDK / Mock)
    await platform.init();
    const detectedLang = platform.getLanguage();
    i18n.setLanguage(detectedLang);

    // 2. Load Save Data (Local Storage with fallback to Cloud Save)
    const localSave = saveService.loadLocal();
    const cloudSave = await platform.loadCloudSave();
    const activeSave = selectMostRecentSave(localSave, cloudSave);

    if (activeSave) {
      store.replace(activeSave);
      RpgSaveAggregate.hydrate(activeSave);
    }

    // Sync combat states with the (possibly loaded) save.
    campaignCombatService.spawnCurrentEncounter();
    towerSystem.resetToFloor(store.get().towerFloor);

    // 3. Setup UI Shell & Containers
    const appEl = document.getElementById('app')!;
    appEl.innerHTML = ''; // Clear splash

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

    // Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastLayer';
    toastContainer.style.cssText = 'position:fixed; top:70px; right:16px; z-index:300; display:flex; flex-direction:column; align-items:flex-end; pointer-events:none;';
    appEl.appendChild(toastContainer);
    ToastManager.init(toastContainer);

    // Header
    const header = new Header();
    appEl.appendChild(header.getElement());

    // Main Viewport
    this.screenViewport = document.createElement('main');
    this.screenViewport.className = 'app-viewport';
    appEl.appendChild(this.screenViewport);

    // Bottom Navigation
    const nav = new Navigation();
    appEl.appendChild(nav.getElement());

    // Dev-only telemetry / cheats. Dynamic import keeps it outside the
    // production execution path when import.meta.env.DEV is false.
    if (import.meta.env.DEV) {
      const { DevOverlay } = await import('./ui/components/DevOverlay');
      const devOverlay = new DevOverlay();
      this.devOverlay = devOverlay;
      appEl.appendChild(devOverlay.getElement());
    }

    // 4. Initialize Screens
    const battleScreen = new BattleScreen(this.particleCanvas);
    const ascensionScreen = new AscensionScreen();
    const towerScreen = new TowerScreen();
    const heroesScreen = new HeroesScreen();
    const summonScreen = new SummonScreen();
    const soulTreeScreen = new SoulTreeScreen();
    const questsScreen = new QuestsScreen();
    const relicsScreen = new RelicsScreen();
    const expeditionsScreen = new ExpeditionsScreen();
    const dailyScreen = new DailyScreen();
    const settlementScreen = new SettlementScreen();
    const sectScreen = new HomeScreen(this.particleCanvas);
    const heroHubScreen = new HeroHubScreen();
    const teamHubScreen = new TeamHubScreen();
    const worldHubScreen = new WorldHubScreen();

    this.screens = createScreenRouteRegistry({
      hero: heroHubScreen.getElement(),
      team: teamHubScreen.getElement(),
      battle: battleScreen.getElement(),
      settlement: settlementScreen.getElement(),
      world: worldHubScreen.getElement(),
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

    // Screen change event handler
    events.on('screen:change', ({ screenId }) => {
      this.switchScreen(screenId);
    });

    this.switchScreen('battle');

    // 5. Calculate Offline Progress on launch
    const offlineGains = OfflineSystem.calculateOfflineGains(store.get());
    if (offlineGains) {
      setTimeout(() => {
        events.emit('modal:open', { modalId: 'offline_reward', data: { gains: offlineGains } });
      }, 500);
    }

    // Daily Reset Check on Launch
    DailySystem.checkDailyReset();

    // 6. Hook Main Game Loop
    let achievementCheckTimer = 0;
    let randomEventTimer = 0;
    let dailyCheckTimer = 0;

    gameLoop.addCallback((dt, now) => {
      const state = store.get();
      const metrics = EconomyEngine.calculateMetrics(state, now);

      // Passive Power & Gold gains
      const passivePower = metrics.passivePowerPerSec * dt;
      const passiveGold = metrics.passiveGoldPerSec * dt;

      if (passivePower > 0 || passiveGold > 0) {
        store.set((draft) => {
          draft.power += passivePower;
          draft.gold += passiveGold;
          draft.stats.lifetimePower += passivePower;
          draft.stats.lifetimeGold += passiveGold;
          draft.stats.playtimeSeconds += dt;
        });
      }

      // Auto-Training Relic
      const autoClicksPerSec = RelicSystem.getEquippedEffectValue(state, 'auto_training');
      if (autoClicksPerSec > 0) {
        const autoPower = metrics.clickPower * autoClicksPerSec * dt;
        const autoGold = metrics.clickGold * autoClicksPerSec * dt;
        store.set((draft) => {
          draft.power += autoPower;
          draft.gold += autoGold;
          draft.stats.lifetimePower += autoPower;
          draft.stats.lifetimeGold += autoGold;
        });
      }

      // Update Active Combo decay
      TrainingSystem.updateCombo(dt);

      // Update Random Event (Golden Spirit)
      randomEventTimer += dt;
      if (randomEventTimer >= 1.0) {
        randomEventTimer = 0;
        RandomEventSystem.update(now);
      }
      
      // Update Daily Reset Check
      dailyCheckTimer += dt;
      if (dailyCheckTimer >= 60.0) { // Check every 60 seconds
        dailyCheckTimer = 0;
        DailySystem.checkDailyReset();
      }

      // Update Campaign Combat (Autobattler)
      campaignCombatService.update(dt);

      // Update Tower Combat
      towerSystem.update(dt);

      // Update VFX
      if (this.particleCanvas) {
        this.particleCanvas.update();
      }

      // Update Dev FPS
      if (this.devOverlay) {
        this.devOverlay.updateFps();
      }

      // Periodic achievement check
      achievementCheckTimer += dt;
      if (achievementCheckTimer >= 1.0) {
        achievementCheckTimer = 0;
        QuestSystem.checkAchievements();
      }
    });

    // 10. Start Loop
    gameLoop.start();

    // 11. Notify platform game is ready!
    platform.notifyGameReady();
    platform.notifyGameplayStart();
    console.log('[Anime Infinite Ascension] Game initialized & ready.');
    events.emit('game_start', { saveVersion: activeSave?.version || 1 });

    // Setup global audio unlock on first interaction
    const unlockAudio = () => {
      if (store.get().settings.musicEnabled) {
        sound.startAmbientBgm();
      }
      document.body.removeEventListener('pointerdown', unlockAudio);
      document.body.removeEventListener('keydown', unlockAudio);
    };
    document.body.addEventListener('pointerdown', unlockAudio);
    document.body.addEventListener('keydown', unlockAudio);
  }

  private switchScreen(screenId: string): void {
    if (!this.screenViewport) return;
    const targetEl = this.screens.get(screenId);
    if (!targetEl) return;

    this.screenViewport.innerHTML = '';
    this.screenViewport.appendChild(targetEl);
  }
}

// Start application
const app = new GameApp();
window.addEventListener('DOMContentLoaded', () => {
  app.bootstrap().catch((err) => console.error('[Fatal Bootstrap Error]:', err));
});
