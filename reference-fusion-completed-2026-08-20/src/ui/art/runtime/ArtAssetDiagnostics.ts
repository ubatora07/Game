const reportedMissingAssets = new Set<string>();

export function reportMissingArtAsset(kind: string, id: string, fallbackId: string): void {
  if (!import.meta.env.DEV) return;
  const key = `${kind}:${id}`;
  if (reportedMissingAssets.has(key)) return;
  reportedMissingAssets.add(key);
  console.warn(`[ArtAssetRegistry] Missing ${kind} asset "${id}"; using fallback "${fallbackId}".`);
}

export function resetArtAssetDiagnosticsForTests(): void {
  reportedMissingAssets.clear();
}
