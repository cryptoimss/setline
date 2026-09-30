# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static, self-contained HTML/CSS/JavaScript file, explicitly requested by the user. No backend or build step.

## Users

One primary user training for hypertrophy around volleyball sessions, using the interface on a Mac or iPhone while planning or completing gym workouts.

## Product Purpose

Present four ordered training programs, make each session easy to execute, and provide lightweight in-session tracking for sets, weight or bodyweight reps, rest, exercise volume, and weekly volume.

## Positioning

Combines a volleyball-compatible gym plan, an independent 3–4 day hypertrophy plan, a chest-priority gym/home plan, and a beginner bodyweight plan in one focused training sheet, with progress calculated locally rather than requiring an account or backend.

## Operating Context

Used in a gym or around volleyball training, often one-handed on a phone and under mixed or low ambient light. The user switches programs and days, records working sets, times rest, and compares exercise volume against a preserved previous reference or an optional manual target.

## Capabilities and Constraints

- Four programs: volleyball gym work, 3–4 day hypertrophy without volleyball, chest-priority gym/home sessions, and beginner calisthenics A/B. All complete sessions estimate 30–45 minutes, including warm-up, sets, prescribed rest and transitions; the user can stop earlier.
- Prioritize chest, back, shoulders, and arms; legs are minimal and optional.
- Exercises include order, muscle group, sets, rep range, rest, and RIR.
- The independent 3–4 day hypertrophy program is the first-run default.
- Personalized Light, Normal, and Heavy starting-load presets prefill untouched set weights; manual edits always take precedence and the prescribed RIR remains the calibration rule.
- Local tabs, filters, set completion, weight/reps inputs, reps-only bodyweight tracking, volume calculations, preserved previous references with manual targets, progress bars, rest timer, and weekly summary.
- RESET clears only the current program/day entries and rest timer after confirmation. It preserves manual targets, previous volume references and other days, and never snapshots new volumes. Cancel and navigation away leave the session data intact.
- Current session entries and preferences persist automatically in localStorage. There is no chronological session log, backend, IndexedDB or cross-device synchronization; Cache Storage stores shell/GIF assets.
- No medical claims, backend, account, or real cross-device synchronization.

## Brand Commitments

Dark, modern, clean, premium fitness-app presentation. Spanish interface copy.

## Evidence on Hand

The user supplied their current measurements and training priorities in the referenced conversation. No logo, photography, formal brand system, verified performance history, or medical assessment was supplied; the interface must not invent them.

## Product Principles

- Make the next set and its target obvious at a glance.
- Preserve volleyball quality by keeping combined sessions concise and stable.
- Use transparent arithmetic and previous-session references instead of opaque scores; keep manual overrides available.
- Keep touch interactions comfortable and all data under the user's local control.
- Treat legs as maintenance/optional work, not the program's center.
- Keep the beginner bodyweight plan full-body, within the same 30–45 minute session window, and easy to scale through exercise variants rather than invented external loads.

## Accessibility & Inclusion

Semantic controls, visible keyboard focus, readable contrast, 44px touch targets where practical, reduced-motion support, and responsive layouts for phone and desktop.
