# Anime Infinite Ascension — Asset Provenance & Licensing Log

## 1. Asset Registry & Sources

| Category | Implementation Type | Provenance | License | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Character Sprites** | Procedural SVG / CSS Vector | Custom Engine Assets | Proprietary / MIT | 100% vector-scalable |
| **Hero Portraits** | Stylized Anime Cards (SVG/CSS) | Original Procedural Designs | Proprietary / MIT | GPU-accelerated gradients & particle auras |
| **VFX / Floating Elements** | Canvas 2D Particle Engine | Built-in Engine System | Proprietary / MIT | Zero external heavy asset payloads |
| **Audio Synthesizer** | Web Audio API Oscillator Synth | Built-in Sound System | Proprietary / MIT | Low-latency algorithmic audio synthesis |
| **UI Iconography** | Universal Emoji & CSS Badges | System Unicode Fonts | Open Standards | Instant zero-download rendering |

---

## 2. Optimization & Web Delivery Rules

1. **Zero External Blocking Payloads:** All visual and audio assets are self-contained or synthesized procedurally, ensuring $< 1\text{s}$ initial load times on mobile 4G.
2. **GPU Texture Memory:** Canvas and CSS layers use hardware acceleration (`transform: translateZ(0)`) without heavy uncompressed texture memory footprints.
3. **No Heavy PNG / GIF Sprite Sheets:** Avoids network lag, memory exhaustion, or CORS asset failures across platform webviews (Yandex Games, VK Play, CrazyGames).
