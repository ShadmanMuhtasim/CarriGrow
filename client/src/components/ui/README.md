# UI Component Library (Milestone 1)

This folder contains reusable Bootstrap-based UI primitives used across auth, profile, and dashboard pages.

## Components

- `Button`: supports `primary`, `secondary`, `outline`, and `danger` variants plus loading state.
- `Input`: standard input with label and validation error rendering.
- `Card`: common content wrapper with title/subtitle/actions slots.
- `Modal`: controlled modal dialog for confirmations and quick flows.
- `Toast`: app-level toast viewport plus `toastUI` helpers.
- `Badge`: status/skill badge rendering with semantic variants.
- `Pagination`: simple page navigation control.

## Why this is needed

- Keeps Milestone 1 UI consistent instead of duplicating Bootstrap markup in every page.
- Reduces form and dashboard implementation time for future milestones.
- Makes acceptance checks explicit for issue `#14`.
