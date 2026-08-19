import { DomainHubScreen, DomainHubAction } from './DomainHubScreen';

const TEAM_ACTIONS: readonly DomainHubAction[] = [
  {
    id: 'partner',
    targetId: 'partner_awakening',
    type: 'modal',
    iconId: 'domain_partner',
    labelKey: 'domain.team.partner',
    descriptionKey: 'domain.team.partner_desc',
    accent: '#c084fc',
  },
  {
    id: 'roster',
    targetId: 'heroes',
    type: 'screen',
    iconId: 'domain_roster',
    labelKey: 'domain.team.roster',
    descriptionKey: 'domain.team.roster_desc',
    accent: '#38bdf8',
  },
  {
    id: 'recruit',
    targetId: 'summon',
    type: 'screen',
    iconId: 'domain_recruit',
    labelKey: 'domain.team.recruit',
    descriptionKey: 'domain.team.recruit_desc',
    accent: '#f59e0b',
  },
  {
    id: 'pets',
    targetId: 'pet_modal',
    type: 'modal',
    iconId: 'domain_pets',
    labelKey: 'domain.team.pets',
    descriptionKey: 'domain.team.pets_desc',
    accent: '#10b981',
  },
  {
    id: 'mercenaries',
    targetId: 'mercenary_guild_modal',
    type: 'modal',
    iconId: 'domain_mercenaries',
    labelKey: 'domain.team.mercenaries',
    descriptionKey: 'domain.team.mercenaries_desc',
    accent: '#fb923c',
  },
];

export class TeamHubScreen extends DomainHubScreen {
  constructor() {
    super({
      id: 'team',
      iconId: 'nav_team',
      eyebrowKey: 'domain.team.eyebrow',
      titleKey: 'domain.team.title',
      subtitleKey: 'domain.team.subtitle',
      actions: TEAM_ACTIONS,
    });
  }
}
