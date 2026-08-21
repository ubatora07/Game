import { CharacterClassId } from '../content/classes';
import { PARTNER_AWAKENING_INVITATION_FLAG } from '../content/partnerUnlock';
import { karmaSystem } from './KarmaSystem';
import { partyTeamSystem } from './PartyTeamSystem';

/**
 * Progression policy for the second buildable Main Character.
 * The invitation is persisted through Karma major-choice flags, so a player can
 * dismiss the class/name setup and complete it later from the Team hub.
 */
export class PartnerUnlockSystem {
  public isPartnerUnlocked(): boolean {
    return partyTeamSystem.getCharacter('char_2').isUnlocked;
  }

  public hasAwakeningInvitation(): boolean {
    return karmaSystem.hasMajorChoiceFlag(PARTNER_AWAKENING_INVITATION_FLAG);
  }

  public canAwakenPartner(): boolean {
    return !this.isPartnerUnlocked() && this.hasAwakeningInvitation();
  }

  public grantAwakeningInvitation(): void {
    if (this.isPartnerUnlocked() || this.hasAwakeningInvitation()) return;
    karmaSystem.setMajorChoiceFlag(PARTNER_AWAKENING_INVITATION_FLAG, true);
  }

  public completeAwakening(name: string, classId: CharacterClassId): boolean {
    if (!this.canAwakenPartner()) return false;
    return partyTeamSystem.unlockSecondCharacter(name, classId);
  }
}

export const partnerUnlockSystem = new PartnerUnlockSystem();
