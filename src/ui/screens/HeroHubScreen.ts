import { DomainHubScreen, DomainHubAction } from './DomainHubScreen';

const HERO_ACTIONS: readonly DomainHubAction[] = [
  {
    id: 'rank',
    targetId: 'ascension',
    type: 'screen',
    iconId: 'domain_rank',
    labelKey: 'domain.hero.rank',
    descriptionKey: 'domain.hero.rank_desc',
    accent: '#f59e0b',
  },
  {
    id: 'class',
    targetId: 'class_selection',
    type: 'modal',
    iconId: 'domain_class',
    labelKey: 'domain.hero.class',
    descriptionKey: 'domain.hero.class_desc',
    accent: '#38bdf8',
  },
  {
    id: 'equipment',
    targetId: 'equipment_inventory_modal',
    type: 'modal',
    iconId: 'domain_equipment',
    labelKey: 'domain.hero.equipment',
    descriptionKey: 'domain.hero.equipment_desc',
    accent: '#94a3b8',
  },
  {
    id: 'titles',
    targetId: 'title_selection_modal',
    type: 'modal',
    iconId: 'domain_titles',
    labelKey: 'domain.hero.titles',
    descriptionKey: 'domain.hero.titles_desc',
    accent: '#fde047',
  },
];

export class HeroHubScreen extends DomainHubScreen {
  constructor() {
    super({
      id: 'hero',
      iconId: 'nav_hero',
      eyebrowKey: 'domain.hero.eyebrow',
      titleKey: 'domain.hero.title',
      subtitleKey: 'domain.hero.subtitle',
      actions: HERO_ACTIONS,
    });
  }
}
