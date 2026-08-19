import { events } from '../../core/EventBus';

export type LiveOpsEventId = 'sakura_festival' | 'void_invasion' | 'boss_rush';

export interface EventQuest {
  id: string;
  nameKey: string;
  targetCount: number;
  reward: { crystals?: number; gold?: number; essence?: number };
}

export interface LiveOpsEventConfig {
  id: LiveOpsEventId;
  nameKey: string;
  defaultName: string;
  particleTheme: 'sakura' | 'void' | 'fire' | 'default';
  descriptionKey: string;
  quests: EventQuest[];
}

export const LIVEOPS_EVENTS: Record<LiveOpsEventId, LiveOpsEventConfig> = {
  sakura_festival: {
    id: 'sakura_festival',
    nameKey: 'liveops.sakura.title',
    defaultName: 'Sakura Blossom Festival',
    particleTheme: 'sakura',
    descriptionKey: 'liveops.sakura.desc',
    quests: [
      { id: 'sakura_q1', nameKey: 'liveops.sakura.q1', targetCount: 100, reward: { crystals: 100 } },
      { id: 'sakura_q2', nameKey: 'liveops.sakura.q2', targetCount: 30, reward: { crystals: 150, essence: 25 } },
    ],
  },
  void_invasion: {
    id: 'void_invasion',
    nameKey: 'liveops.void.title',
    defaultName: 'Void Invasion',
    particleTheme: 'void',
    descriptionKey: 'liveops.void.desc',
    quests: [
      { id: 'void_q1', nameKey: 'liveops.void.q1', targetCount: 5, reward: { crystals: 200 } },
    ],
  },
  boss_rush: {
    id: 'boss_rush',
    nameKey: 'liveops.boss_rush.title',
    defaultName: 'Boss Rush Challenge',
    particleTheme: 'fire',
    descriptionKey: 'liveops.boss_rush.desc',
    quests: [
      { id: 'rush_q1', nameKey: 'liveops.rush.q1', targetCount: 10, reward: { crystals: 500, essence: 100 } },
    ],
  },
};

export class LiveOpsService {
  private static instance: LiveOpsService;
  private activeEventId: LiveOpsEventId | null = 'sakura_festival'; // Default seasonal event

  private constructor() {}

  public static getInstance(): LiveOpsService {
    if (!LiveOpsService.instance) {
      LiveOpsService.instance = new LiveOpsService();
    }
    return LiveOpsService.instance;
  }

  public getActiveEvent(): LiveOpsEventConfig | null {
    if (!this.activeEventId) return null;
    return LIVEOPS_EVENTS[this.activeEventId] || null;
  }

  public setActiveEvent(eventId: LiveOpsEventId | null): void {
    this.activeEventId = eventId;
    events.emit('liveops:event_changed', { eventId });
  }

  public isEventActive(eventId: LiveOpsEventId): boolean {
    return this.activeEventId === eventId;
  }

  public getActiveParticleTheme(): 'sakura' | 'void' | 'fire' | 'default' {
    const active = this.getActiveEvent();
    return active ? active.particleTheme : 'default';
  }
}

export const liveOps = LiveOpsService.getInstance();
