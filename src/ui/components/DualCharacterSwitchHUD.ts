import { partyTeamSystem } from '../../systems/PartyTeamSystem';
import { getClassById } from '../../content/classes';

export class DualCharacterSwitchHUD {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'dual-character-hud';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public render(): void {
    const char1 = partyTeamSystem.getCharacter('char_1');
    const char2 = partyTeamSystem.getCharacter('char_2');
    const activeFocus = partyTeamSystem.getActiveFocusSlot();

    const class1 = char1.classId ? getClassById(char1.classId) : null;
    const class2 = char2.classId ? getClassById(char2.classId) : null;

    this.element.style.cssText = 'display:flex; gap:var(--space-08); align-items:center; justify-content:center; margin-bottom:var(--space-08);';

    this.element.innerHTML = `
      <!-- Character 1 -->
      <div id="hud-char-1" class="char-hud-card ${activeFocus === 'char_1' ? 'active-focus' : ''}" style="display:flex; align-items:center; gap:var(--space-06); background:rgba(15,23,42,0.85); border:2px solid ${activeFocus === 'char_1' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; border-radius:var(--radius-08); padding:var(--space-06) var(--space-10); cursor:pointer; min-width:120px;">
        <div style="font-size:16px;">${class1 ? class1.iconSvg : '👤'}</div>
        <div>
          <div style="font-size:11px; font-weight:bold; color:#f8fafc;">${char1.name}</div>
          <div style="font-size:9px; color:#94a3b8;">Lv.${char1.level} ${class1 ? class1.defaultName : 'Novice'}</div>
        </div>
      </div>

      <!-- Character 2 -->
      <div id="hud-char-2" class="char-hud-card ${activeFocus === 'char_2' ? 'active-focus' : ''}" style="display:flex; align-items:center; gap:var(--space-06); background:rgba(15,23,42,0.85); border:2px solid ${activeFocus === 'char_2' ? '#a855f7' : 'rgba(255,255,255,0.1)'}; border-radius:var(--radius-08); padding:var(--space-06) var(--space-10); cursor:pointer; min-width:120px;">
        ${
          char2.isUnlocked
            ? `
          <div style="font-size:16px;">${class2 ? class2.iconSvg : '👤'}</div>
          <div>
            <div style="font-size:11px; font-weight:bold; color:#f8fafc;">${char2.name}</div>
            <div style="font-size:9px; color:#c084fc;">Lv.${char2.level} ${class2 ? class2.defaultName : 'Novice'}</div>
          </div>
        `
            : `
          <div style="font-size:14px; color:#64748b;">🔒</div>
          <div style="font-size:10px; color:#64748b; font-weight:bold;">Slot 2: Locked</div>
        `
        }
      </div>
    `;

    this.element.querySelector('#hud-char-1')?.addEventListener('click', () => {
      partyTeamSystem.setActiveFocusSlot('char_1');
      this.render();
    });

    this.element.querySelector('#hud-char-2')?.addEventListener('click', () => {
      if (char2.isUnlocked) {
        partyTeamSystem.setActiveFocusSlot('char_2');
        this.render();
      }
    });
  }
}
