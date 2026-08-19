# Phase 70: LiveOps Event Framework Specification

## 1. Core Architectural Principle

**"Events reuse the existing engine."**
LiveOps seasonal events must NOT create disjoint mini-games or duplicate combat loops. Instead, they layer temporary visual themes, quest parameters, boss gauntlets, and cosmetic rewards directly on top of the established `CampaignCombatService`, `ParticleCanvas`, `QuestSystem`, and `YandexGamesService`.

---

## 2. Event Calendar & Specifications

### Event 1: Sakura Blossom Festival (Фестиваль Цветения Сакуры)
- **Duration:** 14 Days (Spring / Seasonal).
- **Visual Accent:** Gentle falling pink petal particles layered on the `ParticleCanvas` and Sakura Empire background boost.
- **Special Encounter:** *Golden Sakura Kitsune* rare spirit spawn yielding $3\times$ gold and gacha gems.
- **Event Quest Chain:**
  1. *Sakura Meditation:* Complete 100 manual attacks ($\to 50$ Sakura Petals).
  2. *Defeat 30 Forest/Sakura Foes:* ($\to 100$ Sakura Petals).
  3. *Overcome Grimbark Boss:* ($\to 200$ Sakura Petals + Exclusive Sakura Avatar Frame).
- **Event Shop Rewards:** Free 10x Hero Summon Ticket, 500 Gems, *Petal Dance Blade* cosmetic.

---

### Event 2: Void Invasion (Вторжение Пустоты)
- **Duration:** 7 Days (Bi-weekly rotation).
- **Visual Accent:** Deep purple nebula aura and void lightning screen flash.
- **Boss Ladder:** 5 progressive Void Sovereign bosses (`Void Sentinel`, `Shadow Beast`, `Cosmic Devourer`, `Void Overlord`, `Abyssal Emperor`).
- **Reward:** *Voidheart Talisman* Event Relic ($+20\%$ party damage in void environments) and exclusive title *«Void Consecrator»*.

---

### Event 3: Endless Boss Rush Challenge (Режим «Босс-Раш»)
- **Duration:** Weekend Tournament (Every Fri–Sun).
- **Mechanics:** 10 campaign bosses spawn sequentially without trash minion waves.
- **Scoring:** Clear time + Total DPS.
- **Leaderboard Integration:** Direct sync to Yandex Games `Leaderboard` with tier badges (Top 1%, Top 5%, Top 20%).

---

## 3. Implementation Modularity

```typescript
export interface LiveOpsEvent {
  id: 'sakura_festival' | 'void_invasion' | 'boss_rush';
  titleKey: string;
  startDate: number;
  endDate: number;
  particleTheme: 'sakura' | 'void' | 'fire';
  quests: readonly EventQuestDefinition[];
  leaderboardName?: string;
}
```
