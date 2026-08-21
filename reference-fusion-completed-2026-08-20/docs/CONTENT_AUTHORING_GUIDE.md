# CONTENT AUTHORING GUIDE — Data-Driven Developer Manual
## Schema Standards, Catalog Reference & Validation Tooling

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Tooling**: `src/tools/contentValidator.ts`

---

### 1. Executive Summary & Authoring Philosophy
In Phase 118, all game content in *Anime Infinite Ascension* has transitioned to **declarative, data-driven catalogs**. Adding new random events, narrative sagas, weapons, blacksmith recipes, mercenaries, titles, or raids no longer requires altering core gameplay logic.

---

### 2. Standard Content Catalog File Locations

| Content Domain | Catalog File Location | Interface Definition |
| :--- | :--- | :--- |
| **Adventure Events** | `src/content/adventureEvents.ts` | `AdventureEventDefinition` |
| **Narrative Event Chains** | `src/content/narrativeChainsCatalog.ts` | `AdventureEventDefinition` |
| **Equipment Templates** | `src/content/equipmentCatalog.ts` | `EquipmentTemplate` |
| **Crafting & Recipes** | `src/content/craftingCatalog.ts` | `CraftingRecipeDefinition` |
| **Blacksmith Mentors** | `src/content/craftingCatalog.ts` | `BlacksmithDefinition` |
| **Mercenary Guild** | `src/content/mercenariesCatalog.ts` | `MercenaryDefinition` |
| **Sovereign Titles** | `src/content/titlesCatalog.ts` | `TitleDefinition` |
| **Market & Contraband** | `src/content/marketCatalog.ts` | `MarketOfferDefinition` |
| **Settlement Raids** | `src/content/settlementRaidsCatalog.ts` | `SettlementRaidDefinition` |
| **Legacy Endings & Boons**| `src/content/legacyEndingsCatalog.ts` | `LegacyEndingDefinition` |

---

### 3. Authoring a Multi-Stage Narrative Chain Example

To author a new 2-stage branching saga:

```typescript
// 1. Define Step 1 with a follow-up link
{
  id: 'evt_chain_lost_artifact_1',
  titleKey: 'event.chain.lost_artifact_1.title',
  icon: '🔮',
  category: 'story',
  weight: 35,
  cooldownSeconds: 60,
  requirements: { minWorldId: 1, onceOnly: true },
  choices: [
    {
      id: 'investigate_sanctuary',
      labelKey: 'Investigate the glowing ruins (+10 Karma)',
      outcome: {
        resultTextKey: 'You uncover an ancient glyph tablet.',
        karmaDelta: 10,
        followUpEventId: 'evt_chain_lost_artifact_2', // <-- Next step link
        flagId: 'lost_artifact_sanctuary_found',
        flagValue: true
      }
    }
  ]
}
```

---

### 4. Authoring a Themed Live Event Pack (Phase 124 Standard)

To author a complete seasonal drop (like `MOONLIT_HUNT_PACK`):

```typescript
import { ThemedLiveEventPack } from './ContentPackTypes';

export const MY_THEMED_PACK: ThemedLiveEventPack = {
  metadata: {
    packId: 'pack_my_theme_v1',
    version: '1.0.0',
    category: 'themed_event',
    state: 'ACTIVE',
    titleKey: 'pack.my_theme.title',
    defaultTitle: 'Festival of the Stars',
    author: 'LiveOps Team',
    minGameVersion: '3.0.0',
    isActive: true,
  },
  events: [ /* AdventureEventDefinition[] */ ],
  raids: [ /* SettlementRaidDefinition[] */ ],
  marketOffers: [ /* MarketOfferDefinition[] */ ],
  titles: [ /* TitleDefinition[] */ ],
};
```

---

### 5. Running the Content Validator

To run validation checks on all entities across the codebase:

```typescript
import { ContentValidator } from '../src/tools/contentValidator';

const report = ContentValidator.validateAll();
console.log(`Entities Checked: ${report.totalEntitiesChecked}`);
console.log(`Validation Status: ${report.isValid ? 'PASSED ✅' : 'FAILED ❌'}`);
if (report.issues.length > 0) {
  console.table(report.issues);
}
```

---
**Content Authoring Guide complete.**
