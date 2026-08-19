import { store } from '../../core/GameState';
import { shouldShowExpeditions, shouldShowTower } from '../navigation/SecondaryDisclosure';
import { DomainHubScreen, DomainHubAction } from './DomainHubScreen';

const WORLD_ACTIONS: readonly DomainHubAction[] = [
  {
    id: 'campaign',
    targetId: 'battle',
    type: 'screen',
    iconId: 'domain_campaign',
    labelKey: 'domain.world.campaign',
    descriptionKey: 'domain.world.campaign_desc',
    accent: '#ef4444',
  },
  {
    id: 'tower',
    targetId: 'tower',
    type: 'screen',
    iconId: 'domain_tower',
    labelKey: 'domain.world.tower',
    descriptionKey: 'domain.world.tower_desc',
    accent: '#38bdf8',
    isVisible: () => shouldShowTower(store.get().rankId),
  },
  {
    id: 'expeditions',
    targetId: 'expeditions',
    type: 'screen',
    iconId: 'domain_expeditions',
    labelKey: 'domain.world.expeditions',
    descriptionKey: 'domain.world.expeditions_desc',
    accent: '#10b981',
    isVisible: () => shouldShowExpeditions(Object.keys(store.get().heroes).length),
  },
  {
    id: 'quests',
    targetId: 'quests',
    type: 'screen',
    iconId: 'domain_quests',
    labelKey: 'domain.world.quests',
    descriptionKey: 'domain.world.quests_desc',
    accent: '#f59e0b',
  },
];

export class WorldHubScreen extends DomainHubScreen {
  constructor() {
    super({
      id: 'world',
      iconId: 'nav_world',
      eyebrowKey: 'domain.world.eyebrow',
      titleKey: 'domain.world.title',
      subtitleKey: 'domain.world.subtitle',
      actions: WORLD_ACTIONS,
    });

    let disclosureKey = this.getDisclosureKey();
    store.subscribe(() => {
      const nextKey = this.getDisclosureKey();
      if (nextKey !== disclosureKey) {
        disclosureKey = nextKey;
        this.refresh();
      }
    });
  }

  private getDisclosureKey(): string {
    const state = store.get();
    return `${state.rankId}:${Object.keys(state.heroes).length}`;
  }
}
