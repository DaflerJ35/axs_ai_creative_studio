# AXS Command Deck Facelift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert AXS into a cinematic command-deck interface with shared shell styling, left rail navigation, top command bar, right Production Memory cockpit, and upgraded Studio/Universe/DNA dashboard surfaces.

**Architecture:** Add a small shared command-deck component layer and global CSS utilities, then wire the app shell and key dashboard entry points to those components. Existing stores, tabs, Proof Layer, Universe Forge, and generation logic remain intact.

**Tech Stack:** React 19, TypeScript, Tailwind CSS utilities, motion/react, lucide-react, Zustand.

---

### Task 1: Shared Command Deck Components

**Files:**
- Create: `src/components/command/CommandDeck.tsx`
- Modify: `src/index.css`

- [ ] Add reusable `CommandDeckBackground`, `CommandPanel`, `CommandMetric`, `CommandModuleCard`, `CommandRailButton`, and `CommandSearch`.
- [ ] Add global CSS utilities for gold bevels, cyan/violet energy lines, command panels, and electric substrate.
- [ ] Run `npm run lint`.

### Task 2: App Shell

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/MobileNav.tsx` only if needed
- Modify: `src/App.tsx`
- Modify: `src/components/platform/AXSContextRail.tsx`

- [ ] Replace top pill navigation with command-deck top bar.
- [ ] Add permanent desktop left rail.
- [ ] Keep MobileNav for smaller viewports.
- [ ] Restyle Production Memory as the right cockpit while preserving drag/minimize and Proof Layer drawer.
- [ ] Run `npm run lint`.

### Task 3: Command Deck Home

**Files:**
- Modify: `src/components/platform/StudioHome.tsx`

- [ ] Rebuild StudioHome as the Command Deck workflow board.
- [ ] Include global stats, connected workflow modules, output card, active projects, and New Project card.
- [ ] Keep current navigation actions and agentic command behavior.
- [ ] Run `npm run test`.

### Task 4: Universe And DNA Entry Surfaces

**Files:**
- Modify: `src/features/universe-forge/UniverseForge.tsx`
- Modify: `src/components/dna/DNALibrary.tsx`

- [ ] Add Universe Command Center dashboard at top while preserving existing Universe Forge content below.
- [ ] Add DNA Studio command dashboard at top while preserving existing DNA Library content below.
- [ ] Run `npm run lint`.

### Task 5: Verification

**Files:**
- No additional files.

- [ ] Run `npm run lint`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Open `http://127.0.0.1:3000/` and confirm command-deck UI is visible.
