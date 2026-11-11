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
  session-console:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.dock}"
    padding: "8px 10px 10px"
    height: "126px"
  session-console-resting:
    backgroundColor: "{colors.completion-mint}"
    textColor: "{colors.timer-ink}"
    rounded: "{rounded.dock}"
    padding: "8px 10px 10px"
    height: "90px"
---

# Design System: Setline

## Overview

**Creative North Star: "The Courtside Technical Sheet"**

Setline should feel like a precision sheet clipped beside a court: ink-black slate, clear rules, equipment-label controls, and a small number of unmistakable signals. The interface is modern and premium because it is disciplined, not because it glows. Its density is purposeful, keeping sequence, entry, timing, and readout visually close while preserving comfortable touch targets.

The system refuses the generic neon fitness dashboard. Warm coral behaves like a physical signal; mint behaves like a completion mark made by an operator; slate layers and ruled rows carry the rest of the interface. Controls are direct, numeric content is aligned, and the strongest visual gestures remain scarce.

**Key Characteristics:**

- Ink-black canvas with stepped slate work surfaces.
- Warm coral for current selection and primary emphasis.
- Mint completion marks, progress, and visible focus treatment.
- Condensed uppercase display type paired with a plain system sans.
- Ruled rows, compact equipment-label controls, and sparse structural depth.

## Colors

The palette is a low-light slate field animated by three disciplined signals: coral for selection, mint for completion, and amber for secondary readout.

### Primary

- **Signal Coral** (`colors.signal-coral`): Marks the current choice, the primary action, and the main progress cue. Pair it with Signal Ink for dark, warm contrast.

### Secondary

- **Completion Mint** (`colors.completion-mint`): Marks completed states, selected filters, progress against a reference, and keyboard focus. It communicates confirmation rather than decoration.

### Tertiary

- **Summary Amber** (`colors.summary-amber`): Reserved for reference values, such as last time or a suggested load, that should remain distinct from live progress.

### Neutral

- **Ink Black** (`colors.ink-black`) and **Rail Black** (`colors.rail-black`): Form the page field and persistent navigation plane.
- **Slate Surface**, **Raised Slate**, and **Soft Slate** (`colors.slate-surface`, `colors.slate-raised`, `colors.slate-soft`): Create the working hierarchy for panels, rows, and nested controls.
- **Rule** and **Strong Rule** (`colors.rule`, `colors.rule-strong`): Separate rows and bound controls without introducing bright outlines.
- **Chalk**, **Muted Steel**, and **Faint Steel** (`colors.chalk`, `colors.muted-steel`, `colors.faint-steel`): Carry primary text, secondary values, and quiet labels respectively.
- **Timer Paper** and **Timer Ink** (`colors.timer-paper`, `colors.timer-ink`): Create the deliberate light-on-dark inversion used only by a paused rest in the session console; a running rest uses Completion Mint with Timer Ink.

### Named Rules

**The Signal Plate Rule.** Coral marks selection and current emphasis; mint marks completion, progress, and focus. Neither becomes ambient neon.

## Typography

**Display Font:** DIN Condensed, with Avenir Next Condensed, Arial Narrow, and the system sans as fallbacks.

**Body Font:** The platform system sans, beginning with `ui-sans-serif` and the native Apple or Segoe UI face.

**Character:** Condensed, tightly tracked display type gives large labels the authority of a rotation board. The system sans keeps dense controls and values neutral, fast, and readable.

### Hierarchy

- **Display** (950, `clamp(34px, 5vw, 60px)`, 0.96): Uppercase page-scale identifiers; keep lines short and balanced.
- **Title** (700, 18px, 1.2): Work-card and panel titles with compact negative tracking.
- **Body** (400, 15px, 1.45): Explanatory copy and standard control text; long supporting copy should stay near 64ch.
- **Label** (800, 11px, 0.08em): Uppercase navigation, metadata, and equipment-style annotations.
- **Metric** (950, 28px, 1): Tabular utility readouts and short numeric status values.

### Named Rules

**The Equipment Label Rule.** Uppercase condensed or tracked type is for identity, order, and metadata; body copy stays plain and readable.

## Layout

On wide screens, the application uses three visual stations: a persistent 258px rail, a flexible primary work sheet, and a 286px column holding only the session console, pinned while the sheet scrolls. The inner sheet is capped at 1280px with a 26px column gap, while page gutters breathe between 18px and 44px.

At 1100px, the rail and console column narrow to 228px and 252px, and the main gap contracts to 18px. At 880px, the rail becomes a 56px sticky session bar that opens the session sheet, the main work becomes a single column, and the console becomes a fixed bar at the thumb's edge. On phones the first thing under the bar is the current set: above it there is only a metadata row, and the load presets, the filters and RESET live behind `Ajustes` (an active filter stays visible so it can't hide exercises unnoticed). Gutters contract to 12px without shrinking touch targets below 44px. Safe-area insets protect the sticky bar and the console; scroll padding keeps revealed rows clear of both.

Spacing follows a compact 8px base with recurring 12px, 16px, 20px, 24px, and 28px steps. Use tighter gaps inside ruled rows and wider gaps between major stations.

## Elevation & Depth

Setline is flat by default. Depth comes first from stepped slate tones, one-pixel rules, and sticky positioning; shadows are reserved for major work cards and the session console. The principal sheet uses `0 18px 44px rgba(0, 0, 0, .28)`, work cards use `0 12px 32px rgba(0, 0, 0, .18)`, summary panels use the quieter `.16` alpha variant, and the light timer dock uses `0 18px 50px rgba(0, 0, 0, .42)`.

### Shadow Vocabulary

- **Sheet Lift** (`0 18px 44px rgba(0, 0, 0, .28)`): Separates the dominant work sheet from the ink canvas.
- **Card Structure** (`0 12px 32px rgba(0, 0, 0, .16–.18)`): Gives repeated panels a restrained layer without making them float independently.
- **Dock Float** (`0 18px 50px rgba(0, 0, 0, .42)`): Keeps the session console legible above every work surface.

### Named Rules

**The Grounded Layer Rule.** Most separation comes from stepped slate and ruled borders; shadows are reserved for the primary sheet, work cards, and the session console.

## Shapes

The form language is engineered but approachable: 8px corners on controls and fields, 10–12px corners on repeated rows and navigation, 14px corners on major panels, and 16px on the session console. Full pills belong to compact filters, segmented actions, progress tracks, and switches. Circular geometry is reserved for compact codes and switch thumbs. One-pixel borders and inset rules reinforce the technical-sheet character.

## Components

### Navigation

- **Program control:** A 48px-high, left-aligned equipment label with an outlined code block. Hover lifts the text from muted steel to chalk; selection raises the slate surface and adds a 3px coral inset rule.
- **Day control:** A 44px-high row with a circular code. The selected state becomes a solid coral plate with Signal Ink text.
- **Session bar:** Below 880px, a one-line sticky button shows the dumbbell mark, the day in display type, its program, the `done/total` count and a 3px coral progress line along its base. It is the only permanent navigation on a phone.
- **Session sheet:** The bar opens a bottom sheet with sessions first (the common switch), then programs under their full names, then the catalog link, install and RESET. Picking a program keeps it open and refreshes the sessions; picking a session closes it and returns focus to the bar. Day controls carry their state: `3/14`, `HECHA` or `OPCIONAL`.

### Buttons and Chips

- **Quiet / utility controls:** 44px minimum height, full-pill silhouette, raised slate background, muted text, and a small scale-down on press where appropriate.
- **Selected filter:** Mint fill with dark ink text. It is a state marker, not a generic primary button.
- **Focus:** A 3px translucent mint outline with 2px offset, always visible for keyboard users.

### Cards / Containers

- **Work cards:** 14px corners on a Slate Surface, with a restrained structural shadow. Their internal order is head, ruled data rows, then a separated readout footer.
- **Completed cards:** Shift toward a deep green-black surface and turn the order plate mint; never wash the full card in bright color.

### Inputs / Fields

- **Numeric fields:** 38px-high dark fields with centered, tabular values and an 8px radius. Resting borders may be transparent; hover introduces Strong Rule and focus switches to mint.
- **Reference fields:** Default to the locally saved volume from the previous complete session and label that source plainly. Use `kg·rep` for loaded exercises and `reps` for bodyweight exercises. Use a visible Rule border at rest, left-aligned values, and the same mint focus treatment; typing creates a manual target and reveals a compact `Auto` recovery control.
- **Completion control:** A 44px square checkbox with a Strong Rule border; checked state becomes mint with a dark drawn check.

### Ruled Data Row

The signature row combines a compact index, 44px completion control, paired numeric fields, and faint separators on a Raised Slate strip. In bodyweight sessions, the weight field becomes a static `Corporal` marker and only repetitions are editable. Labels sit above in small uppercase type. Rows are repeated with 5px separation so the sheet scans as an ordered sequence rather than a stack of generic cards.

### Session Header

One compact row: the day title (on phones, the session bar carries it), code, duration, and prescribed series. There is no expanded state and no introductory copy. On phones an `Ajustes` control reveals the load presets, filters and RESET, keeping focus in place with a 44px minimum touch target; on wide screens those are simply on screen.

### Exercise Card States

- **Accordion:** Only the current exercise is open. Upcoming and complete cards collapse to their head, and any head toggles its card; the next exercise opens by itself and scrolls into place when one finishes.
- **Next:** The current exercise carries a 3px coral inset rule; its first pending row gets a 1.5px coral inset ring. On wide screens it also carries a coral `Siguiente` chip and the progress strip offers a `Siguiente · 02 serie 1` control. It follows the user: ticking elsewhere, or `Hacer ahora` on an upcoming card, moves it for as long as that exercise has sets left.
- **Demonstration:** Every card always shows its GIF, in the head's first column with the order number on its corner: large on the open card, a 52–56px thumbnail on the others, and never behind a disclosure. Tapping it enlarges it without changing the card. Video excerpts run full width on the open card, with a pause control.
- **Upcoming:** GIF thumbnail, title, muscle chip, `sets × reps` and RIR, plus a visible 44px-minimum `Hacer ahora` action in the header even while collapsed. It selects any pending exercise directly, ends the previous rest, and resumes its next unfinished set without clearing logged values.
- **Complete:** Once every set is checked the card collapses to a summary (thumbnail with a mint number, title, `Completado · volume · ratio`) with a chevron toggle. Unchecking any set expands it again.
- **Ruled row order:** index, load, reps, then the 48px completion control on the trailing edge so the thumb reaches it one-handed. A pending reps field shows last time's value when there is one, and a plain tick logs exactly that; a range with no known value stays marked without inventing reps or moving focus to an editor. Completion clears the selected row and never opens an editing sheet. On phones, tapping a row number routes that exact set into the existing kg/reps/Hecha console, with a mint outline linking the field to its stepper. Tapping a console number focuses its −/+ control. Neither action opens a modal, blurs the page or requests the native keyboard. Changes persist immediately. `Cerrar` or Escape returns to the current set or rest without completing a set; a completed set uses `Listo` to leave correction without logging it again. The countdown (or paused status) stays visible in the editing header. A running rest keeps its deadline and cannot replace the selected row when it ends; closing restores its full controls. Session changes clear the selection. Focus stays on non-text controls. Desktop retains direct text editing. The completed row remains available for correction. A new weight carries to the unfinished sets below without a weight of their own.
- **Last time:** An amber line under the head (`Última vez (28 oct): 20 kg × 9 · 8 · 7`), or the preset hint when there is no history. Amber keeps it apart from live progress.
- **Disclosure:** The technique cue, video link and optional volume target sit behind `Técnica`, closed by default everywhere. A volume readout appears only once there is volume to read; its bar only with a reference.

### Finishing and RESET

The console is the only finish state: there is no panel below the list. RESET is deliberately quiet everywhere, because a destructive action never looks primary: beside the filters, in the session sheet, and in the finished console. Confirmation uses an in-app `<dialog>` sheet (bottom-anchored on phones, with Cancel stacked below the action, where the thumb already is), asks only the question, and focuses Cancel by default. Reset clears only the current day and timer, preserves references, "Última vez" and other days, and restores focus to the upper RESET control or, on phones, the session bar. A session last logged on another day shows a quiet notice above the list with the same action.

### Session Console

The console drives the session one-handed and only ever shows one of three states, so its surface tells the state from across a bench. It has a 16px radius, strong shadow and tabular numerals; it is fixed at the safe-area edge on phones (above the on-screen keyboard while its own fields are typed in, hidden while a list row is) and pinned in the readout column on wide screens, where it must not cover the work sheet.

- **Work (Raised Slate):** The exercise and `Serie 1/3`, target, RIR and last value in one tappable heading that returns to the row. Below it, 56px steppers for weight and reps (`is-reps-only` for bodyweight) with a tappable number, and the coral `Hecha`, which sits under the thumb. Touching a row or console number reuses this exact layout and adds a visible `Cerrar` control with a 44px height in its heading to return to the workout without completing a set; `Listo` replaces `Hecha` for corrections to completed sets.
- **Rest (Completion Mint; Timer Paper while paused):** What comes next, `Deshacer`, a large countdown, −15/+15, pause and `Saltar`, with a 4px ink line depleting along the bottom edge.
- **Rest over (Signal Coral, six seconds):** The work state in coral with `¡Listo! · Serie 2/3`, plus vibration and tone where available.
- **Done (deep green, mint title):** `Sesión completa`, the summary, the coral `Próxima: …` under the thumb and a quiet RESET on the far side.

Stepping follows the preset grid: 1 kg up to 10 kg, then 2.5 kg.

Every state replaces the last in the same spot, so a control must not catch the second half of a double tap. Console and dialog controls ignore taps briefly after appearing: 350 ms by default, 600 ms on a confirmation, 800 ms when a rest ends by itself, 900 ms on finishing a session. Holding Enter or Space repeats nothing except on the steppers.

## Do's and Don'ts

### Do:

- **Do** stage the page as a grounded work sheet: persistent selection rail, dominant content sheet, and the console beside it on wide screens.
- **Do** reserve coral for current selection and the primary action, mint for completion/focus/progress, and amber for reference values.
- **Do** keep repeated rows ruled, compact, and numerically aligned; preserve 44px controls where interaction is expected.
- **Do** collapse the rail into the one-line session bar and sheet and keep the console at the thumb's edge at 880px and below.
- **Do** honor reduced-motion and keep a visible mint focus ring.

### Don't:

- **Don't** turn the system into a generic neon fitness dashboard, glossy glassmorphism shell, or gradient-heavy cyber interface.
- **Don't** use coral and mint interchangeably; their semantic split is essential.
- **Don't** float every card or add decorative shadows; depth is structural and sparse.
- **Don't** round every element into a pill; pills are for compact filters and controls, not major panels.
- **Don't** import task-specific content, performance claims, or exercise decisions into the visual system.
- **Don't** give permanent screen space on a phone to choices made once per session.
- **Don't** explain the app to its owner. No intro paragraphs, tips, provenance or attribution lines, reminders of how data is stored, or unprompted offers. The interface states values and actions; a tooltip-shaped sentence is a bug.
