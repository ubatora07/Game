# LIVE CONTENT CADENCE & PACK AUTHORING GUIDE (PHASE 121)
## Declarative Content Releases, Event Rotations & Serverless Cadence Design

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Source**: `src/content/packs/ContentPackRegistry.ts`

---

### 1. Executive Summary
Phase 121 establishes a **data-driven live content architecture** for *Anime Infinite Ascension* that requires zero complex backend microservices or server dependencies. New content drops (story sagas, weapon sets, sellswords, market cargo rotations, and kingdom raids) are bundled into modular **Content Packs** that register dynamically with existing validator pipelines.

---

### 2. Live Content Release Cadence (Browser-Game Standard)

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    SUSTAINABLE LIVE CONTENT CADENCE                    │
  ├───────────────────────┬───────────────────────┬────────────────────────┤
  │    BI-WEEKLY (14D)    │     MONTHLY (30D)     │    MAJOR LIFE EXP (Q)  │
  ├───────────────────────┼───────────────────────┼────────────────────────┤
  │ • Market Caravan Drop │ • 2-Stage Story Saga  │ • New Reincarnation Act│
  │ • 1 Tavern Mercenary  │ • 1 Equipment Set     │ • New Companion Pet    │
  │ • 1 Settlement Raid   │ • 1 Unique Title      │ • Legacy Ending Tier   │
  └───────────────────────┴───────────────────────┴────────────────────────┘
```

> [!NOTE]
> No fake daily busywork or punitive streak mechanics are introduced. Content packs provide high-value optional discovery for returning players.

---

### 3. Content Pack Template Example

To create a new **Bi-Weekly Market Rotation Pack**:

```typescript
import { MarketRotationPack } from './ContentPackTypes';

export const FrostfallMarketPack: MarketRotationPack = {
  metadata: {
    packId: 'pack_market_frostfall_v1',
    version: '1.0.0',
    category: 'market_rotation',
    titleKey: 'pack.frostfall.title',
    defaultTitle: 'Frostfall Caravan Shipments',
    author: 'LiveOps Team',
    minGameVersion: '3.0.0',
    isActive: true,
  },
  rotationId: 'rot_frostfall_caravan',
  durationDays: 14,
  offers: [
    {
      id: 'offer_frost_meteorite_crate',
      category: 'materials',
      nameKey: 'market.frost_meteorite.name',
      defaultName: 'Glacial Star Ore Crate',
      costGold: 4500,
      stockMax: 3,
      reward: { type: 'material', materialId: 'material_rare_meteorite', amount: 5 },
      rarity: 'rare',
      iconSvg: '<svg>...</svg>',
      description: 'Chilled celestial ore extracted from the frozen peaks.',
    },
  ],
};
```

---

### 4. Registration and Validation Lifecycle

All content packs pass through `ContentValidator.validateAll()` before release:
1. Pack author exports pack object adhering to TypeScript interfaces.
2. `ContentPackRegistry.registerXPack()` registers the bundle.
3. Automated test suites verify zero broken IDs or reward cap violations.

---
**Live Content Foundation complete and documented.**
