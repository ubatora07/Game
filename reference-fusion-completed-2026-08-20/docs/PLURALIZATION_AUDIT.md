# EN/RU Pluralization-Sensitive Copy Audit

Date: 2026-08-19
Status: AUDIT COMPLETE / GENERAL PLURAL ENGINE DEFERRED

## Current i18n capability

`I18nService` supports key lookup plus named interpolation (`{count}`, `{minutes}`, etc.). It does not currently implement CLDR-style plural categories or a plural-message DSL.

## Strategy used in Localization V2

For Russian runtime strings whose values vary at runtime, migrated copy deliberately prefers grammar that does not require choosing between `1 / 2-4 / 5+` noun forms:

- seconds use `сек.` / `с`;
- minutes use `мин.`;
- hours use `ч.`;
- battle hit count uses the invariant abbreviation `уд.`;
- level/status copy uses `ур.` or sentence structures where the number does not inflect the noun;
- skill-tree refund copy is phrased as `Возвращено очков: {points}`;
- duplicate counters use label + numeric ratio rather than `N дубликат/дубликата/дубликатов`.

## Resource-count observations

Some reward messages use fixed game values such as 25/50+ crystals or predefined expedition rewards and therefore currently use the stable plural resource label. If future content allows arbitrary values including `1`, player-perfect Russian grammar will require plural-aware formatting.

## Deferred implementation rule

Do not add ad-hoc ternaries for Russian plural forms throughout UI code. If arbitrary count-sensitive prose expands, add one central plural API using Russian one/few/many categories and migrate affected keys in one controlled pass.

## Gate implication

Placeholder parity is already enforced by `scripts/i18n-audit.cjs`, so EN and RU cannot silently diverge in required interpolation arguments even before a full plural engine exists.
