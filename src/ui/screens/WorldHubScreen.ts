import { DomainHubScreen, DomainHubAction } from './DomainHubScreen';

const WORLD_ACTIONS: readonly DomainHubAction[] = [
  {
    id: 'campaign',
    targetId: 'battle',
    type: 'screen',
    icon: '▶',
    labelKey: 'domain.world.campaign',
    descriptionKey: 'domain.world.campaign_desc',
    accent: '#ef4444',
  },
  {
    id: 'tower',
    targetId: 'tower',
    type: 'screen',
    icon: '△',
    labelKey: 'domain.world.tower',
    descriptionKey: 'domain.world.tower_desc',
    accent: '#38bdf8',
  },
  {
    id: 'expeditions',
    targetId: 'expeditions',
    type: 'screen',
    icon: '⌁',
    labelKey: 'domain.world.expeditions',
    descriptionKey: 'domain.world.expeditions_desc',
    accent: '#10b981',
  },
  {
    id: 'quests',
    targetId: 'quests',
    type: 'screen',
    icon: '▤',
    labelKey: 'domain.world.quests',
    descriptionKey: 'domain.world.quests_desc',
    accent: '#f59e0b',
  },
];

export class WorldHubScreen extends DomainHubScreen {
  constructor() {
    super({
      id: 'world',
      icon: '🗺️',
      eyebrowKey: 'domain.world.eyebrow',
      titleKey: 'domain.world.title',
      subtitleKey: 'domain.world.subtitle',
      actions: WORLD_ACTIONS,
    });
  }
}
