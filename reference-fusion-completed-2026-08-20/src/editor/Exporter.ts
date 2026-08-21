import { ScreenLayoutDraft, AiExportPackage } from './EditorTypes';

export class Exporter {
  public static generateExportPackage(draft: ScreenLayoutDraft): AiExportPackage {
    const timestamp = new Date().toISOString();
    const screenId = draft.screenId;
    const modalId = draft.modalId;

    const modifiedElements = Object.values(draft.elements).filter((el) => {
      return Boolean(
        el.hidden ||
        el.assetPath ||
        el.aiNote ||
        el.needsAsset ||
        Object.keys(el.base).length > 0 ||
        (el.tablet && Object.keys(el.tablet).length > 0) ||
        (el.mobile && Object.keys(el.mobile).length > 0)
      );
    });

    // 1. elements.json payload
    const elementsJson = modifiedElements.map((el) => ({
      id: el.id,
      uiId: el.uiId,
      tagName: el.tagName,
      name: el.name,
      hidden: el.hidden,
      styles: {
        base: el.base,
        tablet: el.tablet,
        mobile: el.mobile,
      },
      asset: el.assetPath,
      aiNote: el.aiNote,
      purpose: el.purpose,
      needsAsset: el.needsAsset,
    }));

    // 2. assets.json payload
    const usedAssets: string[] = [];
    const newUploadedAssets: string[] = [];
    const missingAssetTasks: Array<{ elementId: string; description: string; dimensions: string }> = [];

    modifiedElements.forEach((el) => {
      if (el.assetPath) {
        usedAssets.push(el.assetPath);
        if (el.assetPath.includes('/user/')) {
          newUploadedAssets.push(el.assetPath);
        }
      }
      if (el.needsAsset) {
        const dims = el.targetAssetDimensions
          ? `${el.targetAssetDimensions.recommendedSourceWidth}x${el.targetAssetDimensions.recommendedSourceHeight} px (slot: ${el.targetAssetDimensions.cssWidth}x${el.targetAssetDimensions.cssHeight})`
          : 'Custom dimensions';
        missingAssetTasks.push({
          elementId: el.id,
          description: el.aiNote || el.name || 'Art asset required',
          dimensions: dims,
        });
      }
    });

    // 3. source-map.json
    const sourceMapJson: Record<string, { component: string; cssClass?: string; suggestedFile?: string }> = {};
    modifiedElements.forEach((el) => {
      sourceMapJson[el.id] = {
        component: screenId,
        suggestedFile: this.getSuggestedSourceFile(screenId, el.id),
      };
    });

    // 4. notes.md
    let notesMd = `# Design Notes: ${screenId.toUpperCase()}${modalId ? ` (Modal: ${modalId})` : ''}\n\n`;
    notesMd += `**Exported At:** ${timestamp}\n\n`;
    if (draft.screenNotes) {
      notesMd += `## Screen Level Guidelines\n\n${draft.screenNotes}\n\n`;
    }
    notesMd += `## Element Instructions\n\n`;
    if (modifiedElements.some((e) => e.aiNote)) {
      modifiedElements
        .filter((e) => e.aiNote)
        .forEach((e) => {
          notesMd += `### \`${e.id}\` (${e.name || e.tagName})\n`;
          notesMd += `- **Instruction:** ${e.aiNote}\n`;
          if (e.needsAsset) notesMd += `- **Asset Requirement:** Needs new visual asset.\n`;
          notesMd += `\n`;
        });
    } else {
      notesMd += `*No element-specific AI notes attached.*\n\n`;
    }

    // 5. changes.md
    let changesMd = `# Layout Changelog: ${screenId.toUpperCase()}${modalId ? ` (Modal: ${modalId})` : ''}\n\n`;
    changesMd += `Summary of visual design modifications made in Visual Editor:\n\n`;
    modifiedElements.forEach((e) => {
      changesMd += `- **\`${e.id}\`** (${e.tagName}):\n`;
      if (e.hidden) changesMd += `  - Set to **hidden**\n`;
      if (e.assetPath) changesMd += `  - Replaced asset with \`${e.assetPath}\`\n`;
      if (Object.keys(e.base).length > 0) {
        changesMd += `  - Base CSS: \`${JSON.stringify(e.base)}\`\n`;
      }
      if (e.tablet && Object.keys(e.tablet).length > 0) {
        changesMd += `  - Tablet CSS: \`${JSON.stringify(e.tablet)}\`\n`;
      }
      if (e.mobile && Object.keys(e.mobile).length > 0) {
        changesMd += `  - Mobile CSS: \`${JSON.stringify(e.mobile)}\`\n`;
      }
    });

    // 6. AI_TASK.md
    let aiTaskMd = `# AI Implementation Task: Update ${screenId.toUpperCase()} UI\n\n`;
    aiTaskMd += `## Objective\n`;
    aiTaskMd += `Apply the visual layout design drafted in Visual Editor to the production codebase for screen \`${screenId}\`${modalId ? ` (modal: \`${modalId}\`)` : ''}.\n\n`;
    aiTaskMd += `## Strict Requirements\n`;
    aiTaskMd += `1. **Do not break existing game logic**, event bindings, or Save v7 data schema.\n`;
    aiTaskMd += `2. **Update semantic CSS** or component files directly according to \`elements.json\`.\n`;
    aiTaskMd += `3. **Maintain responsive support** across desktop, tablet, and mobile breakpoints.\n`;
    aiTaskMd += `4. **Replace raster assets** using the paths specified in \`assets.json\`.\n\n`;
    aiTaskMd += `## Element Changes\n\n`;
    modifiedElements.forEach((e) => {
      aiTaskMd += `### Element: \`${e.id}\`\n`;
      if (e.aiNote) aiTaskMd += `> **Design Note:** ${e.aiNote}\n\n`;
      aiTaskMd += `\`\`\`json\n${JSON.stringify({ base: e.base, tablet: e.tablet, mobile: e.mobile }, null, 2)}\n\`\`\`\n\n`;
    });

    return {
      screenId,
      modalId,
      timestamp,
      layoutJson: draft.elements,
      elementsJson,
      notesMd,
      changesMd,
      assetsJson: {
        usedAssets,
        newUploadedAssets,
        missingAssetTasks,
      },
      sourceMapJson,
      aiTaskMd,
    };
  }

  public static async exportToDevServer(pkg: AiExportPackage): Promise<boolean> {
    try {
      const res = await fetch('/__editor-api/layout/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg, null, 2),
      });
      return res.ok;
    } catch (e) {
      console.warn('[Exporter] Dev API offline; export payload generated in client.', e);
      return false;
    }
  }

  private static getSuggestedSourceFile(screenId: string, elementId: string): string {
    const screenMap: Record<string, string> = {
      battle: 'src/ui/screens/BattleScreen.ts',
      hero: 'src/ui/screens/HeroHubScreen.ts',
      team: 'src/ui/screens/TeamHubScreen.ts',
      settlement: 'src/ui/screens/SettlementScreen.ts',
      world: 'src/ui/screens/WorldHubScreen.ts',
      sect: 'src/ui/screens/HomeScreen.ts',
      ascension: 'src/ui/screens/AscensionScreen.ts',
      tower: 'src/ui/screens/TowerScreen.ts',
      heroes: 'src/ui/screens/HeroesScreen.ts',
      summon: 'src/ui/screens/SummonScreen.ts',
      souls: 'src/ui/screens/SoulTreeScreen.ts',
      quests: 'src/ui/screens/QuestsScreen.ts',
      relics: 'src/ui/screens/RelicsScreen.ts',
      expeditions: 'src/ui/screens/ExpeditionsScreen.ts',
      dailies: 'src/ui/screens/DailyScreen.ts',
    };

    if (elementId.startsWith('shell.header')) return 'src/ui/components/Header.ts';
    if (elementId.startsWith('shell.navigation')) return 'src/ui/components/Navigation.ts';
    return screenMap[screenId] || `src/ui/screens/${screenId}.ts`;
  }
}
