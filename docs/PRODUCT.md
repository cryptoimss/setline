# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static, self-contained HTML/CSS/JavaScript file, explicitly requested by the user. No backend or build step.

## Users

One primary user training for hypertrophy around volleyball sessions, using the interface on a Mac or iPhone while planning or completing gym workouts.

## Product Purpose

Present two ordered hypertrophy programs, make each gym session easy to execute, and provide lightweight in-session tracking for sets, weight, reps, rest, exercise volume, and weekly volume.

## Positioning

Combines a volleyball-compatible gym plan and an independent 3–4 day hypertrophy plan in one focused training sheet, with progress calculated locally rather than requiring an account or backend.

## Operating Context

Used in a gym or around volleyball training, often one-handed on a phone and under mixed or low ambient light. The user switches programs and days, records working sets, times rest, and compares exercise volume against an editable reference.

## Capabilities and Constraints

- Two programs: gym-only work for volleyball days, and a 3–4 day hypertrophy program without volleyball.
- Prioritize chest, back, shoulders, and arms; legs are minimal and optional.
- Exercises include order, muscle group, sets, rep range, rest, and RIR.
- Local tabs, filters, set completion, weight/reps inputs, volume calculations, reference comparison, progress bars, rest timer, and weekly summary.
- State may live in browser memory and optionally localStorage; the app must remain useful as a static file.
- The web interface may launch a user-configured iOS Shortcut named `Setline Fuerza`; with a paired Apple Watch, that shortcut can use the system action to start Traditional Strength Training, with post-workout logging as a fallback.
- Direct HealthKit access and sensor collection are outside a static website; live metrics come from the Apple Watch workout, and first-party direct control would require native Apple capabilities.
- No medical claims, backend, account, or real cross-device synchronization.

## Brand Commitments

Dark, modern, clean, premium fitness-app presentation. Spanish interface copy.

## Evidence on Hand

The user supplied their current measurements and training priorities in the referenced conversation. No logo, photography, formal brand system, verified performance history, or medical assessment was supplied; the interface must not invent them.

## Product Principles

- Make the next set and its target obvious at a glance.
- Preserve volleyball quality by keeping combined sessions concise and stable.
- Use transparent arithmetic and editable references instead of opaque scores.
- Keep touch interactions comfortable and all data under the user's local control.
- Treat legs as maintenance/optional work, not the program's center.

## Accessibility & Inclusion

Semantic controls, visible keyboard focus, readable contrast, 44px touch targets where practical, reduced-motion support, and responsive layouts for phone and desktop.
