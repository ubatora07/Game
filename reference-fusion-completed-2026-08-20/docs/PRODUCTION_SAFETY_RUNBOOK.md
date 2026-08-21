# Production Safety & Debug-Leak Runbook

## Release invariants

A production build must satisfy both source and artifact gates:

1. `qa:source-safety` verifies runtime source cannot activate DevOverlay/mock-reward/debug fixture paths outside DEV.
2. Vite production build runs only after the source gate passes.
3. `qa:release-safety` scans `dist/` and rejects known cheat/debug markers.
4. Rewarded/fullscreen ads fail closed when the real platform SDK is unavailable or uninitialized.
5. The production fallback platform never simulates ad success, cloud-save success, leaderboard success, or rewards.

## Allowed development behavior

`MockPlatformService`, DevOverlay, mutable debug access to `window.events/window.store`, simulated ads and gameplay cheats are development conveniences only. They are not production fallbacks.

## Emergency rollback if a debug leak reaches production

1. Stop publishing the affected build and retain its exact artifact/hash for incident analysis.
2. Roll back to the most recent artifact that passed `qa:source-safety` and `qa:release-safety`.
3. Disable/reject rewarded placements server/platform-side where possible until a clean artifact is live.
4. Identify the leaked marker/path and add it to `scripts/release-safety-audit.cjs` and/or `scripts/source-production-safety-audit.cjs` before fixing code.
5. Rebuild from a clean checkout; do not patch the minified `dist` artifact manually.
6. Run TypeScript, source-safety, release-safety, unit, browser smoke and Yandex ad-failure tests on the replacement build.
7. Verify a missing/failed SDK cannot grant ad rewards before re-enabling the release.
8. Record the incident and new regression gate in `docs/EXECUTION_LOG.md`.

## Current environment limitation

The supplied dependency archive contains Windows-only Rollup native binaries while the working sandbox is Linux. Therefore source gates and TypeScript checks are valid here, but `P1-02` (fresh production bundle proof) remains open until a Linux-capable Vite build can be produced and scanned.
