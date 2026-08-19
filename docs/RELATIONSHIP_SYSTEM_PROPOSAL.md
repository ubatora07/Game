# PHASE 112 — RELATIONSHIP SYSTEM DESIGN PROPOSAL
## Comprehensive Design Gate & Strategic Feasibility Assessment for Anime Infinite Ascension

**Document Status**: DESIGN ANALYSIS ONLY (No runtime implementation)  
**Date**: 2026-08-19  
**Target Project**: *Anime Infinite Ascension*  
**Authoritative Sources**: `PLAN.md`, `DESIGN.md`, `docs/ART_STYLE_V1.md`

---

### 1. Executive Summary & Core Question
The purpose of Phase 112 is to evaluate whether a character Affinity / Relationship / Bond system adds meaningful emotional and strategic depth to *Anime Infinite Ascension*, or whether it risks devolving into a shallow "gift-spamming chore meter" that distracts from the core fantasy of heroic growth, settlement expansion, and Samsara rebirth.

---

### 2. Player Value Analysis

| Evaluated Dimension | High-Value Potential | Risk of Failure / Slop |
| :--- | :--- | :--- |
| **Emotional Attachment** | Players develop genuine investment in Mountain Haven residents (e.g., Goran, Lyanna, Aldric, Vane, Sylas). | Dialogues become repetitive stock tropes that players skip past without reading. |
| **Roleplay & Identity** | Personal choices (Mercenary bonds, Blacksmith mentorship, Companion Pet attunement) shape the hero’s legacy. | Forces players to "date everyone" to maximize stat numbers, ruining roleplay coherence. |
| **Settlement Connection** | The settlement feels alive with personal stakes during Raids (defending specific allies). | Turns into an obligation to click "Talk" and "Give Gift" daily for flat $+2$ points. |
| **Replayability Across Lives** | Different Samsara lives encourage befriending different allies (e.g., Vane in a Dark run, Aldric in a Lawful run). | Frustration if relationship progress is wiped completely upon reincarnation. |

**Verdict on Player Value**:
Relationships provide substantial narrative value **only if they are event-driven and consequence-based**, rather than numeric daily gift-grinds.

---

### 3. Cross-System Gameplay Fit

```
                    ┌─────────────────────────┐
                    │      KARMA SYSTEM       │
                    │ (Moral alignment shifts)│
                    └───────────┬─────────────┘
                                │
                                ▼
  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
  │  SETTLEMENT &    │────▶│    NPC BONDS &   │◀────│ NARRATIVE EVENT  │
  │  BUILDING TIERS  │     │   STORY SAGAS    │     │      CHAINS      │
  └──────────────────┘     └────────┬─────────┘     └──────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────┐
                    │     SAMSARA LEGACY      │
                    │ (Eternal soul memories) │
                    └─────────────────────────┘
```

1. **Settlement & NPCs**:
   - As Mountain Haven expands, NPCs gain new work stations, personal dilemmas, and story quests.
   - Relationship milestones unlock specialized crafting recipes (e.g., Goran's Master Alloy) or discounted mercenary contracts.
2. **Karma Nuance**:
   - Avoid simplistic *Good = Liked, Bad = Disliked*.
   - *Master Goran* respects craftsmanship and direct honesty regardless of Karma.
   - *Elder Aldric* aligns with Virtuous protection of the realm.
   - *Vane the Shadowsmith* and *Sylas the Whisper* only open deep personal trust to those who walk in the shadows (Negative/Infamous Karma).
3. **Main Characters & Dual Team**:
   - Protagonist Slot 1 and Awakened Partner Slot 2 develop a Resonance Bond that scales with shared combat encounters and simultaneous class awakenings.

---

### 4. Content Burden & Production Cost Estimation

| Content Category | MVP Scope (6 Core NPCs) | Full Scope (18 NPCs/Heroes) | Production Effort |
| :--- | :--- | :--- | :--- |
| **Bust Art & Expressions** | 6 characters × 3 expressions (Neutral, Warm, Intense) = 18 assets | 18 characters × 4 expressions = 72 assets | Medium / High |
| **Dialogue Scripts** | 6 characters × 4 bond ranks = 24 dialogue scenes ($\sim 6,000$ words) | 18 characters × 6 ranks = 108 scenes ($\sim 35,000$ words) | High |
| **Branching Event Chains** | 6 unique companion quests | 18 unique companion sagas | High |
| **Localization (EN/RU)** | $\sim 12,000$ translated words | $\sim 70,000$ translated words | High |
| **QA & State Testing** | Edge-case verification across Samsara resets and Karma extremes | Complex state permutation matrix | Medium |

**Conclusion on Cost**:
A full dating/romance simulator would triple the narrative content burden of the entire game. A streamlined **Bond & Mentorship** system restricted to major settlement figures and heroes is far more cost-effective and thematic.

---

### 5. UI Architecture Proposal
- **Zero Primary Navigation Burden**:
  - The Relationship UI must **NOT** occupy a main bottom navigation tab (keeping bottom nav $\le 6$ buttons).
- **Contextual Integration**:
  - Located within the existing `NPCDialogueModal` and `HeroDetailView`.
  - Displays a clean visual "Bond Level" indicator, current trust stage, and active mentorship bonus.

---

### 6. The Samsara Reincarnation Problem & Solution

#### Evaluated Options:
- **Option A (Full Wipe)**: All affinity returns to 0 on Rebirth. *(Rejected: Causes player fatigue and discourages emotional investment).*
- **Option B (Complete Preservation)**: All relationship progress remains 100% frozen. *(Rejected: Eliminates narrative progression in subsequent lives).*
- **Option C (Legacy Bond Memories — RECOMMENDED)**:
  - Current-life dialogue and day-to-day affinity reset upon Samsara.
  - However, achieving **Max Bond (Rank 4)** unlocks an immutable **Legacy Soul Bond**:
    - Permanently records the NPC in the *Samsara Codex*.
    - Grants an eternal passive modifier across all future lives.
    - Unlocks exclusive "Past Life Recognition" dialogue when meeting the NPC in future incarnations.

---

### 7. Content Suitability & Monetization Ethics
- **Age Rating**: Suitable for general audiences (PG-13 / 12+). The focus is on camaraderie, sworn oaths, mentorship, shared survival, and heroic bonds. Zero explicit adult content.
- **Monetization Safeguards**:
  - Absolute ban on paid "affection items" or paying real money/gems to skip bond requirements.
  - All progression must stem from organic gameplay, narrative choices, and settlement achievements.

---

### 8. Final Strategic Recommendation

```
┌────────────────────────────────────────────────────────┐
│                   RECOMMENDATION:                      │
│                   IMPLEMENT LATER                      │
│     (Tier C / Post-Milestone E Architecture)          │
└────────────────────────────────────────────────────────┘
```

#### Justification:
1. **Core Systems Prioritization**: The immediate focus of Milestone D & E is delivering robust core gameplay (Settlement Defense, Narrative Event Chains, Karma Consequences V2, and Legacy Endings).
2. **Avoiding Feature Creep**: Adding dozens of dialogue branches and relationship meters right now would dilute the polish of existing battle, settlement, and crafting loops.
3. **Future Foundation**: When implemented later, it should follow the **Legacy Soul Bond** architecture outlined above, integrating smoothly into the Settlement and Codex without cluttering the UI.

---
**Phase 112 Design Gate is complete. No relationship code has been written.**
