# AXS AI Creative Studio Instructions

## Brand Rules
- Preserve the approved AXS background exactly.
- Do not replace, recolor, brighten, darken, blur globally, or regenerate the background.
- Fix layout/readability through panels, cards, spacing, overlays, and responsive mounting only.
- Preserve the premium black/charcoal, gold, and cyan/electric command-center style.

## Engineering Rules
- Fix root causes, not surface symptoms.
- Avoid hardcoded oversized widths.
- Prevent horizontal overflow.
- Use responsive layout patterns with grid/flex/clamp.
- Add defensive rendering for missing/null API data.
- Do not let one broken route crash the whole app.
- Use route-level error boundaries where appropriate.

## Required Checks
Before finishing frontend changes:
- Start the app.
- Test every sidebar route.
- Confirm Config does not crash.
- Confirm the background still looks the same.
- Confirm no major console errors remain.