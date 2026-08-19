# Anime: Infinite Ascension — Yandex Games Deployment & Soft Launch Guide

## 1. Release Package

- **Archive Path:** `anime-infinite-ascension.zip`
- **Compressed Size:** ~82 KB
- **Entrypoint:** `index.html` (root inside zip)
- **Engine / Stack:** TypeScript, Vite, Web Audio API, Canvas 2D, Pure CSS3 / HTML5.

---

## 2. Upload Steps to Yandex Developer Console (Консоль Разработчика Яндекс Игр)

1. **Log in to Yandex Games Console:** [https://yandex.ru/dev/games/](https://yandex.ru/dev/games/).
2. **Create / Select Application:** *«Аниме: Бесконечное Вознесение»* / *Anime: Infinite Ascension*.
3. **Upload Archive:**
   - In the **Source Code (Исходный код)** section, upload `anime-infinite-ascension.zip`.
   - Verify that `index.html` is detected in the root of the archive.
4. **Fill in Store Card Details:**
   - Copy Russian and English texts directly from [`docs/STORE_CARD_V2.md`](file:///c:/Users/ubatora/Desktop/сососососососососос/docs/STORE_CARD_V2.md).
   - Upload App Icon from [`docs/marketing/icon_512.svg`](file:///c:/Users/ubatora/Desktop/сососососососососос/docs/marketing/icon_512.svg) (or exported 512x512 PNG).
   - Upload Cover Banner from [`docs/marketing/cover_800x450.svg`](file:///c:/Users/ubatora/Desktop/сососососососососос/docs/marketing/cover_800x450.svg) (or exported 800x450 PNG).
5. **Configure Monetization & Features:**
   - Ensure **Rewarded Video** and **Fullscreen Ads (Interstitial)** are enabled.
   - Leaderboard name: `Leaderboard` (Score: Tower Highest Floor / Lifetime Power).
   - Cloud Saves: Check `ANIME_ASCENSION_DATA` flag enabled.
6. **Submit for Moderation (Отправить на модерацию):**
   - Click *Publish to Draft / Submit for Moderation*.

---

## 3. Live Analytics & Telemetry Tracking Plan

| Metric Category | Tracked Event Key | Purpose |
| :--- | :--- | :--- |
| **First Minute Funnel** | `stage_start`, `manual_attack_batch`, `funnel_first_enemy_killed`, `funnel_stage_1_3_cleared` | Verifies intuitive clicker onboarding and early enemy defeats. |
| **First Session Milestones** | `funnel_first_boss_cleared`, `funnel_world_1_cleared`, `funnel_tower_unlock`, `funnel_first_hero`, `funnel_rank_s`, `funnel_first_reincarnation` | Measures conversion through World 1, Tower, Gacha, and Samsara Rebirth. |
| **Ad Monetization Opt-in** | `ad:rewarded_completed`, `ad:rewarded_failed` | Tracks player voluntary engagement with 2x offline rewards, boss surges, and free summons. |
| **Retention & Return** | `save:saved`, `offline_reward_claim` | Measures Day 1/Day 7 return rates and meditation reward claims. |

---

## 4. LiveOps Incident Response Plan

- If first boss completion rate $< 60\%$: Minor adjustment to Stage 1-10 boss base HP multiplier in `src/content/enemies.ts`.
- If ad opt-in rate is high: Increase rewarded placement variety without adding forced ad walls.
- If performance on low-end mobile $< 55\text{ FPS}$: Recommend enabling Comfort Mode (`reducedMotion = true`).
