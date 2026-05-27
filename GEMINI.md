# AXS AI Creative Studio — Gemini Agent Instructions

## Prime Directive

You are working inside an existing React/TypeScript frontend project for AXS AI Creative Studio.

Do not create disconnected demo files.
Do not rebuild the app from scratch.
Do not replace the existing design system.
Do not make random new routes/components unless they are needed and integrated into the real app.

First inspect the project structure, then modify the real files used by the actual application.

Before editing, identify:
- package.json
- app entry file
- router or active tab system
- AppShell/layout component
- sidebar navigation
- Config page/component
- AXSContextRail or right-side context panel component
- global CSS/layout files
- current background mounting location

Report the exact files you intend to modify before making major changes.

---

## Critical Background Lock

The approved AXS background must be preserved exactly.

Do not:
- replace the background
- regenerate the background
- recolor the background
- brighten the background
- darken the background
- globally blur the background
- remove the background
- add new lightning effects over it
- change the visual mood of the background
- change the background art direction

Allowed:
- Fix technical mounting/scaling only.
- Prevent stretching, clipping, tiling, or weird viewport behavior.
- Use `background-size: cover`, `object-fit`, proper absolute positioning, or container fixes if needed.
- Improve readability by adjusting panels, cards, local overlays, borders, opacity, shadows, spacing, and layout.

The layout must adapt around the existing background. The background itself is not the thing to redesign.

---

## Brand Direction

Preserve the premium AXS style:

- dark black/charcoal base
- gold accents
- cyan/electric highlights
- cinematic AI command-center feel
- clean floating panels
- high-end SaaS dashboard polish
- controlled energy, not tacky lightning
- readable text
- consistent panel borders
- consistent spacing
- premium hover/focus states

Avoid:
- excessive glow
- messy lightning overlays
- unreadable tiny text
- chaotic z-index stacking
- hardcoded giant widths
- glassmorphism overload
- panels covering important UI

---

## Engineering Rules

Fix root causes, not surface symptoms.

Required engineering standards:
- No hardcoded oversized page widths.
- Prevent horizontal overflow.
- Use responsive grid/flex patterns.
- Use `clamp()` where useful for spacing, font sizes, and panel sizes.
- Use `min-width: 0` on grid/flex children where needed.
- Use defensive rendering for null/missing data.
- Use safe localStorage parsing.
- Do not let one broken route crash the whole app.
- Use route-level error boundaries where appropriate.
- Do not duplicate existing hooks/components if equivalents already exist.
- Merge safely with the existing architecture.
- Keep TypeScript types valid.
- Keep imports clean.
- Avoid console errors.
- Do not remove working functionality just to silence errors.

---

## Required Workflow

Before editing:
1. Inspect `package.json`.
2. Inspect the `src` tree.
3. Locate the app entry file.
4. Locate routing/sidebar active tab logic.
5. Locate the Config page.
6. Locate `AXSContextRail` or any right-side panel component.
7. Locate global CSS/layout files.
8. Locate where the background is mounted.
9. Report the files that need edits.

After editing:
1. Run build/typecheck/lint if available.
2. Test every sidebar route.
3. Confirm Config does not crash.
4. Confirm the approved background still looks the same.
5. Confirm there is no horizontal overflow on common desktop sizes.
6. Report changed files and remaining issues.

---

## Routes To Smoke Test

Test every sidebar route and ensure each renders without crashing:

- `studio` / Command Deck
- `universe`
- `dna`
- `voice`
- `strategy`
- `scripts`
- `images`
- `videos` / `video`
- `campaign` / `campaigns`
- `distribute`
- `analytics`
- `vault`
- `config`

For each route:
- Page renders.
- No full-app crash.
- No major console errors.
- Layout fits viewport.
- Missing data does not crash the page.
- Buttons either work or show polished unavailable/coming-soon states.
- Sidebar route and page title match.

---

## Production Memory Panel Rules

The right-side Production Memory / Context Rail panel must be route-aware.

Show by default on:
- `studio`
- `universe`
- `dna`
- `scripts`
- `strategy`
- `campaign`
- `analytics`

Hide or collapse by default on:
- `images`
- `videos`
- `voice`
- `config`
- `vault`
- `distribute`
- `creator`
- `scene`
- `landing`

Behavior requirements:
- Do not blindly show it on every page.
- Add or preserve a global toggle so the user can reopen it.
- Persist open/closed state in localStorage.
- Persist minimized/expanded state in localStorage if supported.
- Persist drag offset only if dragging already exists or is safely added.
- Do not allow the panel to cover the sidebar or top command bar in desktop layout.
- On smaller screens, make it a drawer/overlay.
- Main content should not be hidden underneath the panel.
- If the panel is irrelevant on a route, keep it hidden unless manually opened.

---

## Config Page Rule

The Config page must never crash the whole app.

Fix all runtime risks:
- undefined `.map`
- undefined `.filter`
- null destructuring
- missing props
- missing imports
- unsafe localStorage parsing
- bad API assumptions
- backend unavailable state
- broken context usage
- malformed settings objects

Config must render a polished fallback if data is missing, corrupt, null, or unavailable:

> Config settings unavailable. Check connection or reset local settings.

Add a “Reset Local Settings” action if applicable.

Config must be inside a route-level error boundary so future Config bugs do not take down the whole app shell.

---

## Studio / Workflow Fix Rules

The Studio / workflow area must behave like a polished creation dashboard.

Fix:
- card/node alignment
- connection line overlap
- hardcoded huge widths
- horizontal overflow
- clipped status bars
- unreadable cards on smaller screens
- buttons that throw errors
- missing backend data crashes

Requirements:
- Cards/nodes should scale inside their parent container.
- Connection lines should be responsive or simplified/hidden on smaller widths.
- Status bars should fit without clipping.
- “Open”, “Change”, “View Live”, “Open Universe”, and similar buttons must not crash.
- Unfinished features should show disabled or coming-soon states.
- Missing data should use stable mock/default fallback data.

---

## Layout Rules

Use a stable shell structure like:

```tsx
<AppShell>
  <Sidebar />
  <div className="app-main-shell">
    <TopCommandBar />
    <main className="app-content">
      <RouteErrorBoundary>
        <CurrentPage />
      </RouteErrorBoundary>
    </main>
  </div>
  <ProductionMemoryPanelController />
</AppShell>

## Preferred CSS Principles

Use these as layout guidance. Do not blindly paste these classes if the project already has equivalent layout classes. Merge the principles into the existing app shell/global CSS safely.

```css
.app-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  overflow-x: hidden;
}

.app-main-shell {
  min-width: 0;
  display: flex;
.app-content {
  min-width: 0;
  width: 100%;
  padding: clamp(12px, 1.4vw, 24px);
}
```

Key rules:
- Use `min-width: 0` on grid/flex children to prevent overflow.
- Use `overflow-x: hidden` only on the shell/root where appropriate.
- Use `clamp()` for responsive spacing and sizing.
- Do not hardcode giant widths.
- Do not change the approved background asset.
- Fix readability through panels/cards/layout, not by altering the background.