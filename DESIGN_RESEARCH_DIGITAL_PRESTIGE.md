# DESIGN_RESEARCH_DIGITAL_PRESTIGE.md

# AXS Digital Prestige Research System

This document is the deeper visual and UX research reference for AXS AI Innovation Studio.

It supports `AGENTS.md`.

`AGENTS.md` is the execution law.
This file is the design research, rationale, and inspiration layer.

If there is ever a conflict, follow `AGENTS.md`.

---

## 1. Core Position

AXS AI Innovation Studio is a premium cinematic AI creative operating system.

It is not a generic SaaS dashboard.
It is not a beige fintech briefing tool.
It is not a toy AI generator.
It is not a random neon cyberpunk app.

AXS should feel like an elite creative production environment where a user can turn one idea into a complete content system.

The product should feel like:

- a cinematic studio
- a production control room
- a creative operating system
- a memory-aware AI workspace
- a premium tool built for serious creators

The emotional target is:

> “This feels expensive, powerful, clear, and alive.”

---

## 2. Premium Means Restraint, Not More Decoration

A premium interface is not created by adding more glow, more gradients, more cards, or more effects.

Premium comes from:

- strong hierarchy
- intentional spacing
- refined material layers
- high readability
- fewer stronger sections
- clear next actions
- smooth interaction feedback
- disciplined accent colors
- calm visual rhythm

AXS should never look desperate for attention.

It should feel confident.

The user should feel guided, not attacked by information.

---

## 3. AXS Visual Identity

### Base Mood

AXS uses a cinematic dark environment:

- obsidian
- warm black
- deep charcoal
- dark graphite
- soft atmospheric gradients
- faint cinematic glow

Avoid pure black as the only background.

Pure black can feel harsh, cheap, and unfinished. Use tonal layering instead.

Suggested dark layer logic:

```css
--axs-bg: #0b0b0d;
--axs-bg-warm: #101010;
--axs-surface-1: #141416;
--axs-surface-2: #191a1d;
--axs-surface-3: #202126;
--axs-border-soft: rgba(255, 214, 143, 0.12);
--axs-border-active: rgba(232, 184, 92, 0.42);
```

### Accent System

Gold is the premium brand signal.

Use gold for:

- active navigation
- primary CTA
- important section markers
- progress highlights
- premium dividers
- key “AXS” moments

Do not make everything gold.

Suggested gold range:

```css
--axs-gold: #d6a84f;
--axs-gold-soft: #f0d28a;
--axs-gold-deep: #8a6626;
--axs-gold-glow: rgba(214, 168, 79, 0.28);
```

Cyan/teal is the intelligence signal.

Use cyan/teal for:

- AI routing
- system status
- live processing
- technical readiness
- active sync

Suggested intelligence range:

```css
--axs-cyan: #31d7e6;
--axs-cyan-soft: #7befff;
--axs-cyan-glow: rgba(49, 215, 230, 0.22);
```

Purple is depth/creative energy.

Use purple sparingly for:

- DNA
- Voice
- Scripts
- creative depth accents
- secondary shadows

Suggested purple range:

```css
--axs-purple: #8b5cf6;
--axs-purple-soft: #c084fc;
--axs-purple-glow: rgba(139, 92, 246, 0.18);
```

---

## 4. Materiality: Liquid Glass, But Codable

AXS should use liquid-glass-inspired surfaces, but not impossible fantasy effects.

The goal is not full real-time optical refraction.

The goal is a practical premium material system using:

- translucent panels
- backdrop blur
- layered gradients
- subtle inner highlights
- 1px light-catching borders
- soft specular sheen
- cursor-reactive highlights only where lightweight
- tonal elevation instead of harsh shadows

Good surface pattern:

```css
.axs-glass-panel {
  background:
    linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)),
    rgba(18, 18, 20, 0.78);
  border: 1px solid rgba(232, 184, 92, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 24px 80px rgba(0,0,0,0.35);
  backdrop-filter: blur(18px) saturate(1.1);
  border-radius: 22px;
}
```

Use liquid glass most on:

- top navigation
- side navigation
- command input surfaces
- active project cards
- high-value modal/dialog surfaces

Do not use heavy glass everywhere.

Too much blur becomes muddy.

---

## 5. Structure Should Be Felt, Not Seen

The best premium interfaces have structure, but they do not scream “grid.”

AXS should use:

- consistent spacing
- consistent gutters
- consistent card radius
- consistent internal padding
- clean alignment
- modular bento sections
- purposeful asymmetry

Use the 8px system:

```text
4px  = micro alignment
8px  = small element spacing
16px = compact card spacing
24px = standard section/card spacing
32px = major layout spacing
48px = large vertical rhythm
64px = hero/major breathing room
```

Preferred layout specs:

```text
Page padding: 24px–32px
Major section gap: 24px
Card padding: 16px–24px
Hero padding: 24px–32px
Card radius: 16px–24px
Panel border: 1px soft light-catching border
```

Avoid random values like:

```text
13px
19px
27px
41px
```

unless there is a specific reason.

---

## 6. Bento Layout Rules

Bento grids are useful, but only when they create clarity.

Good bento sections:

- one large primary card
- two or three secondary cards
- compact supporting cards
- clear visual weight
- no duplicate metrics everywhere

Bad bento sections:

- 20 equal cards
- tiny unreadable labels
- no visual priority
- no obvious next action
- cards that all look equally important

Every bento card should answer one of these:

- What is active?
- What needs attention?
- What can I do next?
- What did AXS remember?
- Where does this output go?

If a card does not help the user act, reduce it or remove it.

---

## 7. Cognitive Fluency

AXS should make advanced creative production feel easy.

The user should never wonder:

- What is this page for?
- What should I click?
- What is active?
- Where did my output go?
- What should happen next?

Every page should have:

1. a clear page title
2. a short purpose subtitle
3. a primary action
4. current state
5. next recommended action
6. output handoff to the next module

Example:

```text
Command Deck
Route ideas, files, and project intent into the right production engine.
```

Example:

```text
Universe Engine
Build worlds, protect canon, and keep every story asset connected.
```

Example:

```text
Scripts
Write, refine, and send production-ready scripts into voice, image, video, or campaign workflows.
```

---

## 8. Ambient AI Patterns

AXS is an AI creative operating system, so intelligence should feel present.

But AI should not be noisy.

Use:

- suggested next moves
- route-to-module chips
- action previews
- short reasoning summaries
- production gap alerts
- memory-aware context
- “send to next engine” buttons
- compact system activity

Avoid:

- huge chain-of-thought logs
- fake over-explaining
- constant animated thinking
- cluttered AI panels
- scary autonomy language

Good AI summary:

```text
AXS recommends locking Character DNA before generating campaign visuals.
```

Good action plan:

```text
1. Finish character identity lock
2. Generate 5 key art variants
3. Build campaign teaser script
4. Package for TikTok and YouTube
```

Bad AI UX:

```text
The system is autonomously executing multi-agent recursive reasoning across all available nodes...
```

AXS should sound useful, not fake-smart.

---

## 9. Motion Research

Motion should communicate quality.

Use motion for:

- hover confirmation
- navigation transitions
- panel reveal
- status changes
- progress feedback
- successful task completion

Good motion:

```text
Card hover: scale 1.01–1.02
Button tap: scale 0.97–0.98
Panel reveal: 180–320ms
Spring: gentle, not bouncy
Glow pulse: rare and meaningful
```

Avoid:

- constant pulsing
- huge bounces
- exaggerated zooms
- looping effects everywhere
- animations that slow the app

Motion should feel physical and responsive, not decorative.

---

## 10. Typography Research

AXS typography should feel premium, clear, and modern.

Recommended UI fonts:

- Inter
- Geist Sans
- Satoshi
- Manrope

Recommended mono fonts:

- Geist Mono
- JetBrains Mono
- IBM Plex Mono

Use mono for:

- IDs
- timestamps
- counts
- technical routing
- status labels

Do not use serif as the core AXS product UI style.

Serif may work for marketing pages, but the platform itself should feel like a premium software operating system, not an ivory editorial report.

Suggested type scale:

```text
Display: 48–64px / 1.05–1.1 line height
Page Title: 28–40px / 1.15 line height
Section Heading: 16–22px / 1.25 line height
Card Title: 14–18px / 1.3 line height
Body: 14–16px / 1.5 line height
Meta: 11–13px / 1.4 line height
Tiny Label: 10–12px uppercase with letter spacing
```

Large text should not just be giant white blocks.

Use:

- contrast
- spacing
- weight
- subtle gold emphasis
- balanced line length

---

## 11. Premium Dark Mode Rules

Do not use pure black and pure white as the whole UI.

Use warm dark tones and layered elevation.

Bad:

```css
background: #000;
color: #fff;
```

Better:

```css
background: #0b0b0d;
color: #f4efe4;
```

In dark mode, elevation is created by:

- slightly lighter surfaces
- subtle border highlights
- soft inner light
- low-opacity glows
- warm shadows

Not by huge black drop shadows.

---

## 12. Background Research

AXS backgrounds should be cinematic but restrained.

Good background language:

- obsidian base
- subtle grain
- faint routing lines
- constellation/circuit paths
- atmospheric glow
- soft radial gradients
- low-opacity blueprint grid
- warm gold light leaks
- section-specific mood

Bad background language:

- loud wallpaper
- bright cyberpunk city behind text
- noisy starfield
- heavy pattern everywhere
- random neon gradients
- unreadable sections

The background should create depth without reducing usability.

Recommended layered background:

```css
.axs-page-bg {
  background:
    radial-gradient(circle at 20% 10%, rgba(214, 168, 79, 0.10), transparent 34%),
    radial-gradient(circle at 80% 18%, rgba(49, 215, 230, 0.08), transparent 30%),
    radial-gradient(circle at 50% 90%, rgba(139, 92, 246, 0.08), transparent 38%),
    linear-gradient(180deg, #0b0b0d 0%, #101012 48%, #08080a 100%);
}
```

Optional texture overlay:

```css
.axs-page-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black, transparent 78%);
}
```

---

## 13. Tab Theme Research

Each AXS tab should feel like a different room in the same studio.

Shared foundation:

- obsidian base
- premium gold accents
- liquid-glass surfaces
- cinematic background depth
- clear page purpose
- connected workflow

Individual room moods:

### Command Deck — Obsidian Mission Control

Purpose:
Route intent, continue production, show next actions.

Mood:
- control room
- mission command
- routing surface
- calm authority

Accent balance:
- gold primary
- cyan intelligence
- subtle purple only for memory/copilot

Primary sections:
- AXS command input
- active production
- start/create actions
- continue projects
- pipeline map
- suggested next moves
- memory snapshot

---

### Universe Engine — Cinematic Story Bible

Purpose:
Worldbuilding, canon, continuity, story logic.

Mood:
- celestial archive
- story command bible
- timeline and lore intelligence

Accent balance:
- gold canon markers
- deep blue/obsidian atmosphere
- cyan continuity status

Primary sections:
- universe overview
- worlds/realms
- characters/factions
- timeline
- canon rules
- continuity health
- conflicts/warnings
- connected assets

---

### DNA — Identity Lab

Purpose:
Character/brand consistency.

Mood:
- premium identity lab
- reference locking
- face/body/style protection

Accent balance:
- cyan identity signal
- purple creative depth
- gold approval/lock markers

Primary sections:
- reference slots
- face lock
- body lock
- style lock
- live preview
- DNA score
- continuity checklist
- send to Images/Video

---

### Voice — Voice Console

Purpose:
Narration and audio identity.

Mood:
- cinematic audio bay
- waveform studio
- controlled voice design

Accent balance:
- cyan waveform
- gold premium voice markers
- subtle purple tone controls

Primary sections:
- voice profile
- voice samples
- script-to-voice
- tone/emotion
- rhythm/pacing
- performance controls
- generated voiceovers
- engine routing

---

### Strategy — War Room

Purpose:
Campaign direction and launch planning.

Mood:
- tactical growth room
- decision board
- audience intelligence

Accent balance:
- gold plan/priority
- cyan data intelligence
- muted green for readiness

Primary sections:
- objective
- audience
- positioning
- content pillars
- funnel
- launch roadmap
- KPI targets
- recommendations

---

### Scripts — Writer’s Forge

Purpose:
Writing and production scripting.

Mood:
- dark writing desk
- creative forge
- script-to-production bridge

Accent balance:
- warm gold editorial accents
- purple creative tools
- cyan route/send actions

Primary sections:
- script library
- editor
- scene outline
- hook generator
- rewrite assistant
- tone controls
- storyboard notes
- version history
- send to Voice/Images/Video/Campaigns

---

### Images — Visual Forge

Purpose:
Visual generation and refinement.

Mood:
- cinematic image studio
- gallery wall
- prompt-to-visual engine

Accent balance:
- cyan generation
- gold selected/approved assets
- subtle magenta/purple for style

Primary sections:
- prompt composer
- model/style controls
- preview
- variations
- gallery
- enhancement tools
- send to Video/Campaigns/Vault

---

### Video — Director’s Bay

Purpose:
Motion, scenes, camera, render.

Mood:
- editing bay
- director monitor
- cinematic timeline

Accent balance:
- gold render/primary actions
- cyan timeline/status
- muted red/orange only for render warnings

Primary sections:
- scene list
- preview monitor
- shot controls
- timeline
- render queue
- export settings

---

### Campaigns — Launch Builder

Purpose:
Package production into a campaign.

Mood:
- campaign assembly board
- launch packaging suite

Accent balance:
- gold launch status
- cyan asset readiness
- platform color only in small marks

Primary sections:
- campaign package
- asset readiness
- launch checklist
- CTA variants
- platform versions
- schedule handoff

---

### Distribution — Publishing Grid

Purpose:
Schedule and publish across platforms.

Mood:
- rollout command grid
- publishing matrix

Accent balance:
- gold primary action
- platform brand colors as small identifiers
- cyan automation status

Primary sections:
- channel connections
- posting matrix
- content calendar
- scheduled queue
- export packs
- automation rules

---

### Analytics — Performance Intelligence

Purpose:
Performance and recommendations.

Mood:
- calm intelligence room
- decision clarity
- insights over chart noise

Accent balance:
- green success
- amber warning
- cyan data intelligence
- gold revenue/priority

Primary sections:
- performance overview
- top assets
- engagement
- conversions
- audience insights
- recommendations
- predictive outlook

---

### Vault — Creative Memory Archive

Purpose:
Storage, asset memory, approvals, reuse.

Mood:
- premium archive
- creative vault
- memory system

Accent balance:
- gold archive markers
- cyan metadata/sync
- muted status colors for approval

Primary sections:
- asset browser
- folders
- collections
- preview
- metadata
- approval
- permissions
- related assets

---

### Config — Studio Operations

Purpose:
Settings, models, integrations, providers.

Mood:
- clean machine control
- operational clarity

Accent balance:
- gold premium settings
- cyan connection/online states
- amber warnings

Primary sections:
- workspace
- models
- providers
- API keys
- integrations
- team
- billing
- automation
- safety

---

## 14. Command Deck Research Focus

The Command Deck is the first impression of the platform.

It must create a halo effect.

It should not feel like a normal dashboard.

The user should immediately understand:

- I can tell AXS what to do.
- AXS knows my current project.
- AXS can route work to the right module.
- AXS remembers context.
- AXS suggests next moves.
- AXS connects the full production pipeline.

Command Deck priority order:

1. command input
2. active production
3. start/create actions
4. continue projects
5. pipeline map
6. suggested next moves
7. memory snapshot

Metrics should be compact.
Actions should be obvious.
The command surface should dominate.

---

## 15. Decision Rules for Agents

When uncertain, choose:

- clarity over decoration
- fewer stronger cards over many weak cards
- action-first over stats-first
- warm obsidian over pure black
- champagne gold over yellow
- restrained cyan over neon blue
- progressive disclosure over clutter
- workflow continuity over isolated features
- responsive layout over fixed mockup perfection
- codable CSS effects over impossible visual concepts

Never sacrifice usability for a cool screenshot.

---

## 16. What To Avoid Forever

Avoid:

- beige fintech dashboard direction
- ivory editorial platform UI
- generic SaaS admin templates
- all tabs looking identical
- overuse of purple
- overuse of neon
- every border glowing
- everything gold
- too many equal cards
- tiny text everywhere
- hardcoded giant widths
- absolute-positioned core layouts
- unmaintainable one-off page hacks
- visuals that cannot be coded reasonably

AXS should feel original, premium, cinematic, and usable.

---

## 17. Final Design Standard

The final standard for AXS is:

> Same AXS universe. Different premium studio rooms.

Every module must feel connected by shared craft, but distinct in purpose.

The user should want to keep exploring because each room feels intentional, powerful, and useful.

The interface should make users believe:

> “This platform can actually help me build something serious.”
