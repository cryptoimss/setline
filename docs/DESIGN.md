---
name: Setline
description: A courtside technical-sheet system for focused, low-light logging interfaces.
colors:
  ink-black: "#0c1013"
  rail-black: "#0f1417"
  slate-surface: "#13191d"
  slate-raised: "#192126"
  slate-soft: "#20292f"
  rule: "#2b353b"
  rule-strong: "#3b474e"
  chalk: "#f5f1e9"
  muted-steel: "#a8b1b5"
  faint-steel: "#929da2"
  signal-coral: "#ff735c"
  signal-ink: "#1a0c09"
  completion-mint: "#8ed7ca"
  summary-amber: "#f2c979"
  timer-paper: "#edf0e9"
  timer-ink: "#11181a"
typography:
  display:
    fontFamily: '"DIN Condensed", "Avenir Next Condensed", "Arial Narrow", ui-sans-serif, sans-serif'
    fontSize: "clamp(34px, 5vw, 60px)"
    fontWeight: 950
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  title:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.018em"
  body:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
  metric:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "28px"
    fontWeight: 950
    lineHeight: 1
    letterSpacing: "-0.035em"
rounded:
  control: "8px"
  row: "10px"
  navigation: "11px"
  support: "12px"
  panel: "14px"
  dock: "16px"
  pill: "999px"
spacing:
  compact: "8px"
  control: "12px"
  cluster: "16px"
  card: "20px"
  section: "24px"
  loose: "28px"
components:
  navigation-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted-steel}"
    typography: "{typography.body}"
    rounded: "{rounded.navigation}"
    padding: "10px 11px"
    height: "48px"
  navigation-button-selected:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.navigation}"
    padding: "10px 11px"
    height: "48px"
  day-selector-selected:
    backgroundColor: "{colors.signal-coral}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.navigation}"
    padding: "7px 10px"
    height: "44px"
  filter-chip-selected:
    backgroundColor: "{colors.completion-mint}"
    textColor: "{colors.timer-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 15px"
    height: "44px"
  data-field:
    backgroundColor: "{colors.slate-surface}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 11px"
    height: "38px"
  work-card:
    backgroundColor: "{colors.slate-surface}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.panel}"
    padding: "20px"
  summary-panel:
    backgroundColor: "{colors.slate-surface}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.panel}"
    padding: "20px"
  signal-plate:
    backgroundColor: "{colors.signal-coral}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  timer-dock:
    backgroundColor: "{colors.timer-paper}"
    textColor: "{colors.timer-ink}"
    rounded: "{rounded.dock}"
    padding: "11px 12px 11px 18px"
    height: "70px"
---

# Design System: Setline

## Overview

**Creative North Star: "The Courtside Technical Sheet"**

Setline should feel like a precision sheet clipped beside a court: ink-black slate, clear rules, equipment-label controls, and a small number of unmistakable signals. The interface is modern and premium because it is disciplined, not because it glows. Its density is purposeful, keeping sequence, entry, timing, and readout visually close while preserving comfortable touch targets.

The system refuses the generic neon fitness dashboard. Warm coral behaves like a physical signal plate; mint behaves like a completion mark made by an operator; slate layers and ruled rows carry the rest of the interface. Controls are direct, numeric content is aligned, and the strongest visual gestures remain scarce.

**Key Characteristics:**

- Ink-black canvas with stepped slate work surfaces.
- Warm coral signal plates for current selection and primary emphasis.
- Mint completion marks, progress, and visible focus treatment.
- Condensed uppercase display type paired with a plain system sans.
- Ruled rows, compact equipment-label controls, and sparse structural depth.

## Colors

The palette is a low-light slate field animated by three disciplined signals: coral for selection, mint for completion, and amber for secondary readout.

### Primary

- **Signal Coral** (`colors.signal-coral`): Marks the current choice, the large signal plate, and the main progress cue. Pair it with Signal Ink for dark, warm contrast.

### Secondary

- **Completion Mint** (`colors.completion-mint`): Marks completed states, selected filters, progress against a reference, and keyboard focus. It communicates confirmation rather than decoration.

### Tertiary

- **Summary Amber** (`colors.summary-amber`): Reserved for secondary aggregate bars and readouts that should remain distinct from live progress.

### Neutral

- **Ink Black** (`colors.ink-black`) and **Rail Black** (`colors.rail-black`): Form the page field and persistent navigation plane.
- **Slate Surface**, **Raised Slate**, and **Soft Slate** (`colors.slate-surface`, `colors.slate-raised`, `colors.slate-soft`): Create the working hierarchy for panels, rows, and nested controls.
- **Rule** and **Strong Rule** (`colors.rule`, `colors.rule-strong`): Separate rows and bound controls without introducing bright outlines.
- **Chalk**, **Muted Steel**, and **Faint Steel** (`colors.chalk`, `colors.muted-steel`, `colors.faint-steel`): Carry primary text, secondary explanation, and quiet labels respectively.
- **Timer Paper** and **Timer Ink** (`colors.timer-paper`, `colors.timer-ink`): Create the deliberate light-on-dark inversion used only by the floating utility dock.

### Named Rules

**The Signal Plate Rule.** Coral marks selection and current emphasis; mint marks completion, progress, and focus. Neither becomes ambient neon.

## Typography

**Display Font:** DIN Condensed, with Avenir Next Condensed, Arial Narrow, and the system sans as fallbacks.

**Body Font:** The platform system sans, beginning with `ui-sans-serif` and the native Apple or Segoe UI face.

**Character:** Condensed, tightly tracked display type gives large labels the authority of a rotation board. The system sans keeps dense controls and explanatory copy neutral, fast, and readable.

### Hierarchy

- **Display** (950, `clamp(34px, 5vw, 60px)`, 0.96): Uppercase page-scale identifiers and signal plates; keep lines short and balanced.
- **Title** (700, 18px, 1.2): Work-card and panel titles with compact negative tracking.
- **Body** (400, 15px, 1.45): Explanatory copy and standard control text; long supporting copy should stay near 64ch.
- **Label** (800, 11px, 0.08em): Uppercase navigation, metadata, and equipment-style annotations.
- **Metric** (950, 28px, 1): Tabular utility readouts and short numeric status values.

### Named Rules

**The Equipment Label Rule.** Uppercase condensed or tracked type is for identity, order, and metadata; body copy stays plain and readable.

## Layout

On wide screens, the application uses three visual stations: a persistent 258px rail, a flexible primary work sheet, and a sticky 286px readout column. The inner sheet is capped at 1280px with a 26px column gap, while page gutters breathe between 18px and 44px. The primary sheet leads; the readout remains visibly subordinate.

At 1100px, the rail and readout narrow to 228px and 252px, and the main gap contracts to 18px. At 880px, the rail becomes a sticky horizontal top bar, the main work becomes a single column, and readouts form a two-column band below it. At 620px, all panels stack, gutters contract to 12px, the signal plate shifts beneath the heading, and dense row internals tighten without shrinking interactive controls below 44px where practical. Safe-area insets protect the sticky top bar and floating dock.

Spacing follows a compact 8px base with recurring 12px, 16px, 20px, 24px, and 28px steps. Use tighter gaps inside ruled rows and wider gaps between major stations.

## Elevation & Depth

Setline is flat by default. Depth comes first from stepped slate tones, one-pixel rules, and sticky positioning; shadows are reserved for major work cards and the floating dock. The principal sheet uses `0 18px 44px rgba(0, 0, 0, .28)`, work cards use `0 12px 32px rgba(0, 0, 0, .18)`, summary panels use the quieter `.16` alpha variant, and the light timer dock uses `0 18px 50px rgba(0, 0, 0, .42)`.

### Shadow Vocabulary

- **Sheet Lift** (`0 18px 44px rgba(0, 0, 0, .28)`): Separates the dominant work sheet from the ink canvas.
- **Card Structure** (`0 12px 32px rgba(0, 0, 0, .16–.18)`): Gives repeated panels a restrained layer without making them float independently.
- **Dock Float** (`0 18px 50px rgba(0, 0, 0, .42)`): Keeps the inverted utility dock legible above every work surface.

### Named Rules

**The Grounded Layer Rule.** Most separation comes from stepped slate and ruled borders; shadows are reserved for the primary sheet, work cards, and floating dock.

## Shapes

The form language is engineered but approachable: 8px corners on controls and fields, 10–12px corners on repeated rows and navigation, 14px corners on major panels, and 16px on the floating dock. Full pills belong to compact filters, segmented actions, progress tracks, and switches. Circular geometry is reserved for compact codes and switch thumbs. One-pixel borders and inset rules reinforce the technical-sheet character.

## Components

### Navigation

- **Program control:** A 48px-high, left-aligned equipment label with an outlined code block. Hover lifts the text from muted steel to chalk; selection raises the slate surface and adds a 3px coral inset rule.
- **Day control:** A 44px-high row with a circular code. The selected state becomes a solid coral plate with Signal Ink text.
- **Responsive treatment:** Below 880px, both navigation groups scroll horizontally inside the sticky top bar; secondary descriptions disappear before labels do.

### Buttons and Chips

- **Quiet / utility controls:** 44px minimum height, full-pill silhouette, raised slate background, muted text, and a small scale-down on press where appropriate.
- **Selected filter:** Mint fill with dark ink text. It is a state marker, not a generic primary button.
- **Focus:** A 3px translucent mint outline with 2px offset, always visible for keyboard users.

### Cards / Containers

- **Work cards:** 14px corners on a Slate Surface, with a restrained structural shadow. Their internal order is head, ruled data rows, then a separated readout footer.
- **Completed cards:** Shift toward a deep green-black surface and turn the order plate mint; never wash the full card in bright color.
- **Summary panels:** Use the same 14px shell and 20px padding, but a quieter shadow and simpler internal hierarchy.

### Inputs / Fields

- **Numeric fields:** 38px-high dark fields with centered, tabular values and an 8px radius. Resting borders may be transparent; hover introduces Strong Rule and focus switches to mint.
- **Reference fields:** Use a visible Rule border at rest, left-aligned values, and the same mint focus treatment.
- **Completion control:** A 44px square checkbox with a Strong Rule border; checked state becomes mint with a dark drawn check.

### Ruled Data Row

The signature row combines a compact index, 44px completion control, paired numeric fields, and faint separators on a Raised Slate strip. Labels sit above in small uppercase type. Rows are repeated with 5px separation so the sheet scans as an ordered sequence rather than a stack of generic cards.

### Coral Signal Plate

The signal plate is a solid coral block inset with a quiet one-pixel inner rule. It pairs an oversized condensed code with compact ruled facts. On narrow screens it becomes a horizontal band beneath the heading while preserving the large code as its anchor.

### Timer Dock

The dock is the system's one deliberate light surface: Timer Paper with Timer Ink, a 16px radius, strong shadow, tabular metric, and 46px controls. Its running state turns mint. Keep it fixed near the safe-area edge and wide enough for one-handed operation without obscuring the primary sheet.

## Do's and Don'ts

### Do:

- **Do** stage the page as a grounded work sheet: persistent selection rail, dominant content sheet, and a narrow readout column on wide screens.
- **Do** reserve coral for current selection and signal plates, mint for completion/focus/progress, and amber for secondary readouts.
- **Do** keep repeated rows ruled, compact, and numerically aligned; preserve 44px controls where interaction is expected.
- **Do** collapse the rail into a sticky horizontal top bar and stack the readout below the main work area at 880px and below.
- **Do** honor reduced-motion and keep a visible mint focus ring.

### Don't:

- **Don't** turn the system into a generic neon fitness dashboard, glossy glassmorphism shell, or gradient-heavy cyber interface.
- **Don't** use coral and mint interchangeably; their semantic split is essential.
- **Don't** float every card or add decorative shadows; depth is structural and sparse.
- **Don't** round every element into a pill; pills are for compact filters and controls, not major panels.
- **Don't** import task-specific content, performance claims, or exercise decisions into the visual system.
