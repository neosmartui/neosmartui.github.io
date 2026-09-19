# `core.switch`

`core.switch` is the generic binary-setting primitive. It represents one setting whose current value is either off or on and whose state changes immediately when the control is activated. It is not a multi-selection checkbox, a mutually-exclusive radio option, or a delayed-submit choice.

## Semantics

- Web adapters SHOULD expose true switch semantics with `role="switch"` and an accurate checked state. Where native form participation is required, a real `<input type="checkbox" role="switch">` is preferred; a button/ARIA switch MAY be used when form participation is not required and equivalent activation semantics are preserved.
- The switch MUST represent exactly one binary setting and MUST NOT expose an indeterminate state.
- `off` and `on` are persistent semantic states. Transient hover, focus-visible, and pressed feedback MUST NOT obscure the current setting.
- State MUST change immediately on successful activation; the primitive MUST NOT imply a pending save unless a higher-level composition explicitly owns that asynchronous workflow.
- An accessible name is required but label/description copy is composition outside the primitive.
- Invalid state, when applicable to a constrained setting, MUST remain distinguishable without relying only on color.

## Keyboard and activation contract

- The control participates in normal Tab order unless disabled.
- Space MUST toggle the switch where the chosen platform primitive provides checkbox/switch semantics.
- If a button-based switch is used, its native button keyboard activation MUST be preserved and `aria-checked` MUST remain synchronized.
- Arrow keys are not a required switch interaction and MUST NOT be invented merely because radios use them.
- Disabled switches MUST NOT toggle through pointer, touch, or keyboard activation.

## Tactile and toggle law

- Contact MUST acknowledge immediately by compressing toward the resting surface, never by generic upward lift.
- Hover/proximity MAY partially compress structural depth when hover exists.
- Press MUST reach full or near-full compression before or as state resolves.
- Switching state MUST combine track/state-color change with thumb travel; thumb position and state color MUST resolve together so the result cannot visually disagree with the semantic state.
- `off` places the thumb at logical inline-start and `on` at logical inline-end. RTL MAY mirror physical placement through logical geometry, but MUST NOT reverse the meaning of on/off.
- Release restores physical depth without undoing the persistent on/off state.

## Target sizing

The visible track may be smaller than `size.control.minimum`, but the effective interactive hit target MUST meet or exceed `size.control.minimum`. Label association MAY enlarge the usable target; label copy remains outside the Core switch primitive.

## Accessibility and resilience

- `focus-visible` is distinct from hover and MUST remain visible.
- Touch receives immediate press acknowledgement without depending on hover.
- RTL uses logical inline geometry for thumb travel while preserving state meaning.
- Reduced motion MUST remove non-essential travel/overshoot; thumb/state resolution becomes near-instant or uses subtle non-spatial feedback while semantic state remains unchanged.
- Forced colors MUST preserve track boundary, focus indication, and an unambiguous distinction between off and on without depending only on authored color.

## State contract

```text
rest
hover
focus-visible
pressed
off
on
invalid
disabled
```

`off` and `on` are mutually exclusive persistent states and may coexist with transient interaction states such as `focus-visible` or `pressed`.

## Composition boundary

`core.switch` owns only the binary switch control and its state. Setting labels, descriptions, help/error text, async-save status, confirmation copy, layout, and business consequences belong to higher-level field/block/application composition.

## Web implementation

The canonical Web adapter uses a real `<input type="checkbox">` as the form/activation base and applies `role="switch"`. Native checked state remains authoritative; the adapter only prevents indeterminate presentation and mirrors checked state to agent-readable `data-state="off|on"`. CSS owns the visual track, logical thumb travel, pressure compression, focus, invalid, disabled, reduced-motion, and forced-colors presentation.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family behavior: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly requires switches to combine contact compression with thumb travel and to resolve state color and thumb position together, under the shared keyboard/touch/reduced-motion conformance rules.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` lists switch among reusable Core primitives and applies the full conformance/resilience gate.
- No switch-specific Rivet implementation artifact is claimed for the pinned Rivet snapshot `bb4b641d35bc77c958b7345a3b7c0a134c7d802d`; the reviewed `components/ui/` tree contains no `switch.tsx`, so provenance is intentionally limited to evidence actually present.

Maturity is `public-proof`: the unchanged canonical Web implementation is bound to exact merged-main Chromium evidence and the same exact-SHA native GitHub Pages deployment cohort as the other public Core primitives.
