import { ADVENTURE_EVENTS } from '../content/adventureEvents';
import { getAllEquipmentTemplates } from '../content/equipmentCatalog';
import { getAllCraftingRecipes } from '../content/craftingRecipesCatalog';
import { getAllMercenaryDefs } from '../content/mercenariesCatalog';
import { getAllTitleDefs } from '../content/titlesCatalog';
import { getAllMarketOfferDefs } from '../content/marketCatalog';
import { getAllRaidDefinitions } from '../content/settlementRaidsCatalog';
import { getAllLegacyEndingDefs } from '../content/legacyEndingsCatalog';
import { contentPackRegistry } from '../content/packs/ContentPackRegistry';

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING';
  category: string;
  id: string;
  message: string;
}

export interface ContentValidationReport {
  timestamp: number;
  totalEntitiesChecked: number;
  errorCount: number;
  warningCount: number;
  isValid: boolean;
  issues: ValidationIssue[];
}

export class ContentValidator {
  public static validateAll(): ContentValidationReport {
    const issues: ValidationIssue[] = [];
    const seenIds = new Set<string>();
    let totalEntities = 0;

    // 1. Validate Adventure & Narrative Events
    const allEvents = [...ADVENTURE_EVENTS];
    const eventIdSet = new Set(allEvents.map((e) => e.id));

    for (const evt of allEvents) {
      totalEntities++;
      if (seenIds.has(evt.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'Event',
          id: evt.id,
          message: `Duplicate entity ID detected: ${evt.id}`,
        });
      }
      seenIds.add(evt.id);

      // Validate Event Structure
      if (!evt.titleKey || !evt.choices || evt.choices.length === 0) {
        issues.push({
          severity: 'ERROR',
          category: 'Event',
          id: evt.id,
          message: 'Event is missing titleKey or has empty choices array',
        });
      }

      // Validate Choices & Outcomes
      for (const choice of evt.choices || []) {
        if (choice.outcome.followUpEventId && !eventIdSet.has(choice.outcome.followUpEventId)) {
          issues.push({
            severity: 'ERROR',
            category: 'Event',
            id: evt.id,
            message: `Broken followUpEventId reference: '${choice.outcome.followUpEventId}' does not exist in event catalog`,
          });
        }

        // Reward bounds check
        if (choice.outcome.goldDelta && (choice.outcome.goldDelta < -50000 || choice.outcome.goldDelta > 50000)) {
          issues.push({
            severity: 'WARNING',
            category: 'Event',
            id: evt.id,
            message: `Gold delta out of standard range: ${choice.outcome.goldDelta}`,
          });
        }
        if (choice.outcome.crystalsDelta && choice.outcome.crystalsDelta > 150) {
          issues.push({
            severity: 'WARNING',
            category: 'Event',
            id: evt.id,
            message: `Crystals delta exceeds soft cap of 150: ${choice.outcome.crystalsDelta}`,
          });
        }
        if (choice.outcome.karmaDelta && (choice.outcome.karmaDelta < -50 || choice.outcome.karmaDelta > 50)) {
          issues.push({
            severity: 'WARNING',
            category: 'Event',
            id: evt.id,
            message: `Karma delta exceeds standard range [-50, 50]: ${choice.outcome.karmaDelta}`,
          });
        }
      }
    }

    // 2. Validate Equipment Templates
    const equipTemplates = getAllEquipmentTemplates();
    const equipTemplateIdSet = new Set(equipTemplates.map((t) => t.templateId));

    for (const eq of equipTemplates) {
      totalEntities++;
      if (seenIds.has(eq.templateId)) {
        issues.push({
          severity: 'ERROR',
          category: 'Equipment',
          id: eq.templateId,
          message: `Duplicate entity ID detected: ${eq.templateId}`,
        });
      }
      seenIds.add(eq.templateId);

      if ((eq.baseStats?.attack || 0) < 0 || (eq.baseStats?.defense || 0) < 0) {
        issues.push({
          severity: 'ERROR',
          category: 'Equipment',
          id: eq.templateId,
          message: 'Negative base stat values in equipment template',
        });
      }
    }

    // 3. Validate Crafting Recipes
    const recipes = getAllCraftingRecipes();
    for (const r of recipes) {
      totalEntities++;
      if (seenIds.has(r.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'Recipe',
          id: r.id,
          message: `Duplicate entity ID detected: ${r.id}`,
        });
      }
      seenIds.add(r.id);

      if (!equipTemplateIdSet.has(r.resultTemplateId)) {
        issues.push({
          severity: 'ERROR',
          category: 'Recipe',
          id: r.id,
          message: `Recipe references non-existent resultTemplateId: '${r.resultTemplateId}'`,
        });
      }
    }

    // 4. Validate Mercenaries
    const mercs = getAllMercenaryDefs();
    for (const m of mercs) {
      totalEntities++;
      if (seenIds.has(m.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'Mercenary',
          id: m.id,
          message: `Duplicate entity ID detected: ${m.id}`,
        });
      }
      seenIds.add(m.id);

      if (m.contractDurationMinutes <= 0 || m.costGold < 0) {
        issues.push({
          severity: 'ERROR',
          category: 'Mercenary',
          id: m.id,
          message: 'Invalid duration or cost parameters on mercenary definition',
        });
      }
    }

    // 5. Validate Titles
    const titles = getAllTitleDefs();
    for (const tit of titles) {
      totalEntities++;
      if (seenIds.has(tit.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'Title',
          id: tit.id,
          message: `Duplicate entity ID detected: ${tit.id}`,
        });
      }
      seenIds.add(tit.id);
    }

    // 6. Validate Market Offers
    const offers = getAllMarketOfferDefs();
    for (const off of offers) {
      totalEntities++;
      if (seenIds.has(off.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'MarketOffer',
          id: off.id,
          message: `Duplicate entity ID detected: ${off.id}`,
        });
      }
      seenIds.add(off.id);

      if (off.reward.type === 'equipment' && off.reward.templateId && !equipTemplateIdSet.has(off.reward.templateId)) {
        issues.push({
          severity: 'ERROR',
          category: 'MarketOffer',
          id: off.id,
          message: `Market offer references non-existent equipment template: '${off.reward.templateId}'`,
        });
      }
    }

    // 7. Validate Settlement Raids
    const raids = getAllRaidDefinitions();
    for (const rd of raids) {
      totalEntities++;
      if (seenIds.has(rd.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'Raid',
          id: rd.id,
          message: `Duplicate entity ID detected: ${rd.id}`,
        });
      }
      seenIds.add(rd.id);

      if (rd.requiredDefense <= 0) {
        issues.push({
          severity: 'ERROR',
          category: 'Raid',
          id: rd.id,
          message: 'Raid requires non-positive defense threshold',
        });
      }
    }

    // 8. Validate Legacy Endings
    const endings = getAllLegacyEndingDefs();
    for (const end of endings) {
      totalEntities++;
      if (seenIds.has(end.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'LegacyEnding',
          id: end.id,
          message: `Duplicate entity ID detected: ${end.id}`,
        });
      }
      seenIds.add(end.id);
    }

    // 9. Validate Live Content Packs
    const packs = contentPackRegistry.getAllPacks();
    for (const p of packs) {
      totalEntities++;
      if (!p.packId || !p.version || !p.category) {
        issues.push({
          severity: 'ERROR',
          category: 'ContentPack',
          id: p.packId || 'unknown_pack',
          message: 'Content pack missing required metadata fields (packId, version, category)',
        });
      }
    }

    const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

    return {
      timestamp: Date.now(),
      totalEntitiesChecked: totalEntities,
      errorCount,
      warningCount,
      isValid: errorCount === 0,
      issues,
    };
  }
}
