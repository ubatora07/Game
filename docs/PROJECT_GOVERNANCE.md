# Project Governance — Game Consolidation V1

This document defines how an implementation agent decides what is authoritative, how risky changes are classified, and what evidence is required before work is marked complete.

## 1. Source-of-truth precedence

When documents or historical reports disagree, use this order:

1. **Current source + executable contracts** — current branch code, current save schema/migrations, current automated tests, and current build/QA scripts.
2. **`docs/ULTRA_MASTER_PLAN.md`** — the single active implementation roadmap and checkbox ledger.
3. **Current domain contracts** — documents explicitly maintained by the consolidation work, including `SAVE_REBIRTH_CONTRACT.md`, `UX_INFORMATION_ARCHITECTURE_V3.md`, `PRODUCT_IDENTITY_V2.md`, `TERMINOLOGY_MIGRATION_MAP.md`, `ART_RUNTIME_ARCHITECTURE_V2.md`, `UI_PRODUCTION_SYSTEM_V1.md`, and this file.
4. **`docs/EXECUTION_LOG.md`** — implementation evidence and known environment limitations for completed batches.
5. **Historical reports/plans** — root `PLAN*.md`, `CHECKLIST*.md`, milestone/final/QA reports and other documents that describe an older commit. They are context only and never override current source or the active roadmap.

A document containing words such as “verified”, “final”, or “complete” is not current evidence unless its claims were re-run against the current HEAD.

## 2. Severity semantics

- **P0** — release blocker, data-loss/corruption risk, production debug/security/platform-safety defect.
- **P1** — major gameplay/product coherence blocker or architecture defect that makes a core feature misleading/broken.
- **P2** — production quality/polish problem that should be fixed before release candidate but is not data-loss critical.
- **P3** — optimization, maintainability or cleanup work.
- **P4** — optional/future scope; do not let it displace P0/P1 work.

## 3. Effort semantics

Effort describes implementation + local validation, not calendar promises.

- **S** — isolated change, normally one subsystem/file cluster and one focused regression check.
- **M** — multi-file change inside one domain, usually requiring a focused integration test or audit update.
- **L** — cross-domain contract or UI architecture change with migrations/integration coverage and multiple validation gates.
- **XL** — release-wide or data-model change crossing several domains; must be split into independently reviewable batches before implementation where possible.

## 4. Migration-risk semantics

- **LOW** — presentation/refactor-only; no persisted shape, stable ID, reward transaction, or reset semantics change.
- **MEDIUM** — changes hydration/modifier/runtime orchestration while preserving serialized shape and stable IDs.
- **HIGH** — changes save schema/version, migration, stable identifiers, ownership of persisted state, reset/rebirth semantics, cloud/local selection, or destructive clear behavior.

HIGH-risk work requires an explicit preservation matrix, regression coverage for old data, and a rollback path before its checkbox can be closed.

## 5. Acceptance-criteria template

Every implementation batch should record:

```text
Batch:
Goal:
Severity / effort / migration risk:
Source(s) of truth:
In scope:
Out of scope:
State ownership affected:
Save/migration impact:
Player-facing behavior:
Acceptance criteria:
  - [ ] deterministic functional result
  - [ ] old-state/non-regression path covered when relevant
  - [ ] source TypeScript passes
  - [ ] focused test/harness/audit passes
  - [ ] git diff --check passes
  - [ ] browser/build evidence recorded when the task requires it
Rollback:
Evidence / limitations:
```

A checkbox must remain open if its acceptance criterion specifically requires browser/build/platform evidence that was not actually produced.

## 6. Save-sensitive rollback requirements

Before merging any HIGH migration-risk change:

1. Keep the previous read key(s) and migration path until a tested replacement exists.
2. Never overwrite the only known-good save during migration before sanitization succeeds.
3. Preserve stable internal IDs unless an explicit ID migration maps old → new.
4. Keep each migration deterministic and version-bounded; do not make old migrations depend on `CURRENT_SAVE_VERSION` side effects.
5. Record exact reset/preserve semantics for every external save domain.
6. Keep the change in an isolated commit/batch so it can be reverted without reverting unrelated UI/content work.
7. If a release containing the migration is unsafe, roll back application code first while retaining backward-compatible readers for saves already written by the newer version whenever feasible.
8. Never “repair” production data by shipping a hand-edited/minified bundle.

## 7. Production-only verification checklist

Source checks are necessary but do not substitute for artifact checks. Before a release candidate is accepted:

- [ ] clean checkout / known HEAD recorded;
- [ ] `npm test` passes current HEAD;
- [ ] `npm run build` passes current HEAD;
- [ ] build-enforced source/content/UI/art safety audits pass;
- [ ] `qa:release-safety` passes the newly generated `dist/`;
- [ ] release bundle does not instantiate DevOverlay or expose mutable cheat/debug globals;
- [ ] production platform fallback is fail-closed for rewarded/fullscreen ads;
- [ ] `npm run package:release` succeeds only after artifact safety passes;
- [ ] release ZIP has `index.html` at archive root and contains only built `dist/` payload;
- [ ] fresh-save, migrated-save and rebirth smoke paths pass;
- [ ] 390x844, 1366x768 and 1920x1080 browser checks pass;
- [ ] no console errors on the release path;
- [ ] Yandex lifecycle/cloud/ad smoke checks pass in the target environment.

If the environment cannot execute a required gate, record it as **BLOCKED / NOT VERIFIED**; do not convert it into a pass from static inspection.

## 8. Release commands

Production build:

```bash
npm run build
```

Release packaging (after a successful fresh build):

```bash
npm run package:release
```

The packaging command runs the artifact safety audit again, then archives the **contents of `dist/` only** into the legacy-compatible `anime-infinite-ascension.zip` name. Keeping the archive name does not lock the future player-facing game title.
