export type DevicePresetId =
  | 'desktop_fhd'
  | 'desktop_hd'
  | 'tablet'
  | 'mobile_iphone'
  | 'mobile_android'
  | 'custom';

export type BreakpointKey = 'base' | 'tablet' | 'mobile';

export type EditorMode = 'edit' | 'preview';

export type PreviewStatePreset =
  | 'real_snapshot'
  | 'mock_normal'
  | 'mock_rich'
  | 'mock_boss'
  | 'mock_empty'
  | 'mock_maxed';

export interface ViewportConfig {
  width: number;
  height: number;
  label: string;
  preset: DevicePresetId;
  orientation: 'portrait' | 'landscape';
  showSafeArea: boolean;
  zoom: number; // 0.25 to 2.0
}

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UiElementNode {
  id: string; // generated selector or stable data-ui-id
  uiId?: string; // explicit data-ui-id
  tagName: string;
  className: string;
  textContent?: string;
  sourceComponent?: string;
  sourceFile?: string;
  rect: ElementRect;
  computedStyle: Record<string, string>;
  isImage: boolean;
  imageSrc?: string;
  isDesignOnly?: boolean;
  children: UiElementNode[];
}

export interface StyleOverride {
  // Positioning
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  transform?: string;
  zIndex?: string;

  // Dimensions
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;

  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;

  gap?: string;

  // Flex / Layout
  display?: string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: string;
  alignItems?: string;
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;

  // Appearance
  opacity?: string;
  backgroundColor?: string;
  border?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: string;
  boxShadow?: string;

  // Image Specific
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  imageRendering?: 'auto' | 'pixelated' | 'crisp-edges';
  filter?: string;

  // Custom text override
  customText?: string;
}

export interface ElementOverride {
  id: string; // uiId or selector path
  uiId?: string;
  tagName: string;
  name?: string;
  hidden?: boolean;
  locked?: boolean;
  isDesignOnly?: boolean;
  assetPath?: string;
  aiNote?: string;
  purpose?: string;
  needsAsset?: boolean;
  assetPrompt?: string;
  targetAssetDimensions?: {
    cssWidth: number;
    cssHeight: number;
    recommendedSourceWidth: number;
    recommendedSourceHeight: number;
  };
  base: StyleOverride;
  tablet?: Partial<StyleOverride>;
  mobile?: Partial<StyleOverride>;
}

export interface ReferenceOverlayConfig {
  imageUrl: string;
  opacity: number; // 0 to 1
  x: number;
  y: number;
  scale: number;
  locked: boolean;
  visible: boolean;
}

export interface ScreenLayoutDraft {
  schemaVersion: number;
  screenId: string;
  modalId?: string;
  screenNotes?: string;
  createdAt: string;
  updatedAt: string;
  sourceBaselineHash?: string;
  elements: Record<string, ElementOverride>;
  referenceOverlay?: ReferenceOverlayConfig;
}

export interface AssetMetadata {
  id: string;
  filename: string;
  relativePath: string;
  category: 'characters' | 'enemies' | 'pets' | 'backgrounds' | 'ui' | 'icons' | 'user' | 'other';
  width?: number;
  height?: number;
  format: string;
  isPixelArt?: boolean;
  thumbnailUrl: string;
}

export type BridgeMessageToPreview =
  | { type: 'INIT_PREVIEW'; screenId: string; modalId?: string; statePreset: PreviewStatePreset }
  | { type: 'SWITCH_SCREEN'; screenId: string; modalId?: string }
  | { type: 'SET_STATE_PRESET'; preset: PreviewStatePreset }
  | { type: 'APPLY_DRAFT'; draft: ScreenLayoutDraft; breakpoint: BreakpointKey }
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'HOVER_ELEMENT'; elementId: string | null }
  | { type: 'SET_MODE'; mode: EditorMode }
  | { type: 'SET_ANIMATIONS_PAUSED'; paused: boolean }
  | { type: 'FREEZE_COMBAT'; freeze: boolean }
  | { type: 'REQUEST_TREE_REFRESH' };

export type BridgeMessageToHost =
  | { type: 'PREVIEW_READY'; currentScreenId: string }
  | { type: 'DOM_TREE_UPDATED'; rootNode: UiElementNode }
  | { type: 'ELEMENT_CLICKED'; elementId: string; rect: ElementRect; isMultiSelect: boolean }
  | { type: 'ELEMENT_HOVERED'; elementId: string | null }
  | { type: 'ELEMENT_RECT_CHANGED'; elementId: string; rect: ElementRect }
  | { type: 'PREVIEW_ERROR'; message: string };

export interface AiExportPackage {
  screenId: string;
  modalId?: string;
  timestamp: string;
  layoutJson: Record<string, any>;
  elementsJson: Array<{
    id: string;
    uiId?: string;
    tagName: string;
    name?: string;
    sourceComponent?: string;
    hidden?: boolean;
    styles: {
      base: StyleOverride;
      tablet?: Partial<StyleOverride>;
      mobile?: Partial<StyleOverride>;
    };
    asset?: string;
    aiNote?: string;
    purpose?: string;
    needsAsset?: boolean;
  }>;
  notesMd: string;
  changesMd: string;
  assetsJson: {
    usedAssets: string[];
    newUploadedAssets: string[];
    missingAssetTasks: Array<{
      elementId: string;
      description: string;
      dimensions: string;
    }>;
  };
  sourceMapJson: Record<string, { component: string; cssClass?: string; suggestedFile?: string }>;
  aiTaskMd: string;
}
