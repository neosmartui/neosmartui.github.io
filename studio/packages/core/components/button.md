# `core.button`

Status: **contract-only**

The canonical implementation is intentionally absent in this slice. A Theme must first resolve concrete token values and an adapter must own platform rendering.

## Semantic contract

Adapters MUST use the platform's native button semantic when available. On the web, that means a real `<button>` rather than a generic element with a role.

The default non-form action maps to `type="button"`. Submit/reset behavior must be an explicit adapter/application choice.

## Input behavior

- Pointer hover/proximity compresses the control; it MUST NOT increase apparent elevation.
- Pointer/touch press acknowledges contact immediately.
- Keyboard activation supports the platform-equivalent Enter/Space behavior.
- `focus-visible` is independent from hover and remains visually obvious without motion.
- Touch skips hover semantics.
- RTL must not change action meaning or break depth/press coherence.

## Loading

Loading prevents duplicate activation and exposes busy state to assistive technology. If loading starts while the button owns focus, adapters SHOULD preserve that focus rather than removing the control from the focus order mid-action.

## Disabled

Disabled communicates unavailability without relying on opacity alone. It must not look interactive and must not fire the action.

## Reduced motion

Reduced motion removes non-essential travel/rebound while preserving immediate state acknowledgement and result legibility.

## Token dependencies

The machine-readable contract in `button.json` is authoritative for token dependencies. It contains no concrete visual values and no Flavor identity.
