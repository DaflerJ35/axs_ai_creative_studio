# AXS Command Deck Facelift Design

## Goal
Upgrade the application shell and flagship workspaces from soft premium SaaS glass into a cinematic AXS command-deck operating system. The references define the target: black/navy command surfaces, gold bevel lines, cyan/violet neural energy, hard sci-fi panels, persistent left navigation, and a right-side Production Memory cockpit.

This facelift keeps the product architecture intact. Universe Forge remains the flagship Living Character Universe Engine. Proof Layer, ComfyUI routing, Character DNA, Scene Builder, Image Forge, Video Forge, Voice Studio, Strategy, Campaign, Distribute, Vault, Analytics, and Config stay functionally present.

## Visual System
- Base: deep black/navy `#02060A`, `#071018`, and transparent obsidian panels.
- Accent hierarchy:
  - Gold/amber for premium bevels, logos, section headers, card borders, and command actions.
  - Cyan for active navigation, technical signals, scan lines, workflow connections, and verified states.
  - Violet/magenta for memory core, Universe/NSFW energy, and high-level AI signals.
- Layout texture:
  - Subtle circuit-field background, electric branching lines, corner sparks, scan glow, and panel edge highlights.
  - No generic blobs, no soft SaaS rounded-card stacks as the dominant language.
- Typography:
  - AXS logo as large serif-style wordmark treatment.
  - Uppercase tracked labels for system metadata.
  - Clear sans headings and compact body copy for professional readability.

## Shared Architecture
Create a reusable design layer instead of repainting every screen separately:

- `CommandDeckShell`: app-level shell that owns left nav, top command bar, content region, and right Production Memory rail.
- `CommandDeckBackground`: reusable neural/circuit backdrop with cyan/violet/gold energy bands.
- `CommandPanel`: hard-edged premium panel with bevel border, inner glow, optional active state, and corner accents.
- `CommandMetric`: compact metric/stat tile.
- `CommandModuleCard`: large navigation/action cards used across dashboards.
- `CommandSearch`: top command input visual and keyboard affordance.

The shell should replace the current top nav layout for app tabs. The landing page is not part of this pass unless explicitly requested later.

## Navigation
Left nav becomes the permanent AXS rail:

- AXS wordmark at top.
- Command Deck, Universe, DNA, Voice, Strategy, Scripts, Images, Video, Campaigns, Distribute, Analytics, Config.
- Icon + label, gold inactive state, cyan/violet active state.
- AI Co-Pilot / Sync Pulse Point card at bottom.

Top bar:

- Current section label.
- Large command/search input: “Ask AXS or run a command…”
- Plan dropdown, notifications, avatar.

Right rail:

- Production Memory remains visible and authoritative.
- Keep drag/minimize behavior from current Proof Layer rail.
- Style it to match the references: memory ring, memory ingredients, recent outputs, quick actions.

## Command Deck Dashboard
Default Studio/Command Deck should match the first reference:

- Welcome header with compact global stats.
- Main “AXS Creation Workflow” board showing stages:
  - Input / Creative Brief.
  - Foundation: Universe, DNA.
  - Build: Voice, Strategy.
  - Produce: Scripts, Images, Video.
  - Amplify: Campaigns, Distribute.
  - Intelligence: Analytics, Config.
  - Output: Universe Live.
- Cards are connected with glowing cyan/violet lines. This can be deterministic CSS/SVG first; no heavy 3D needed for v1.
- Bottom active projects strip with cinematic thumbnails and New Project card.

## DNA Studio Dashboard
DNA tab should match the second reference:

- Header: DNA Studio, identity lock metrics, FaceLock, consistency score, seed lock, DNA health.
- Main grid cards:
  - Identity Core
  - Face Lock
  - Full Body
  - Style Signature
  - Wardrobe Memory
  - Values & Themes
  - Visual DNA
  - Seed Consistency
  - Character Variants
- Active DNA Profiles strip at bottom.
- Existing Character Studio data and actions stay available, but the first impression becomes the command dashboard.

## Universe Dashboard
Universe tab should match the third reference while preserving existing Universe Forge depth:

- Header: Universe Command Center with counts for universes, worlds, characters, continuity.
- Large module cards:
  - World Bible
  - Characters
  - Locations
  - Lore & Rules
  - Story Arcs
  - Timeline
  - Relationship Map
  - Continuity
- Universe Health panel and Active Universes strip.
- Existing Season Board, Universe Bible, Story Arc Planner, Relationship Map, Continuity Engine, and Director’s Cut remain reachable as deeper sections or existing content below/within the dashboard.

## Scope For First Implementation Pass
Do the facelift in layers:

1. Shared Command Deck CSS tokens and reusable components.
2. Replace app shell navigation/top bar/right rail styling.
3. Rebuild StudioHome as Command Deck dashboard.
4. Add Universe Command Center top dashboard while preserving existing Universe Forge sections.
5. Add DNA Studio dashboard to DNA Library/Character Studio entry flow.
6. Verify responsiveness and build performance.

Do not rewrite the entire business logic. This is a visual/UX shell upgrade with targeted module dashboard upgrades.

## Risks And Guardrails
- Avoid making the app unusable on smaller screens. Left rail can collapse on tablet/mobile; existing MobileNav can remain for small viewports.
- Avoid burying existing working tools. Dashboard cards should navigate into the current functional sections.
- Keep Proof Layer deterministic and visible.
- Keep Vite chunks clean; no new heavy rendering dependency for this pass.
- Maintain current tests and TypeScript strictness.

## Verification
- `npm run lint`
- `npm run test`
- `npm run build`
- Open `http://127.0.0.1:3000/` and visually verify:
  - Command Deck shell appears.
  - Left rail active states work.
  - Right Production Memory remains draggable/minimizable.
  - Studio/Universe/DNA dashboards match the command-deck language.
  - No white-page regression.
