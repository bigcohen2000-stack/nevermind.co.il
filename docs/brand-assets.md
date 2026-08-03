# Brand assets: השם לא משנה / NeverMinde

Files live under `public/brand/` and `public/icons/`. Keep filenames exact so the site picks them up automatically. Do not put prompts or README notes inside `public/` (they would be publicly reachable).

## Brand filenames

| File | Use |
| --- | --- |
| `logo-on-light.svg` | Dark logo for light / cream backgrounds |
| `logo-on-light.png` | Same logo as PNG (fallback / OG) |
| `logo-on-dark.svg` | Light / white logo for dark bands and header |
| `logo-on-dark.png` | Same logo as PNG (fallback) |
| `gated-lock.svg` | Club / gated video fallback art |
| `club-lock-overlay.png` | Optional lock overlay mark |

## Recommended sizes

- SVG preferred (any artboard, transparent background)
- PNG export: at least **1200 x 320** (wide wordmark) or square **1024 x 1024** if the mark is square
- Keep padding tight. No shadows, no gradients in the file itself.

## PWA / favicon icons

Also under `public/icons/`:

| File | Size |
| --- | --- |
| `icon-192.png` | 192 x 192 |
| `icon-512.png` | 512 x 512 |
| `apple-touch-icon.png` | 180 x 180 |
| `favicon.ico` | browser tab |

Use a simplified square mark on a solid dark (`#000000`) or cream (`#FAFAF8`) field. No rounded mask needed (iOS applies its own).

Club teaser image prompt: see `docs/club-teaser-prompt.txt`.
