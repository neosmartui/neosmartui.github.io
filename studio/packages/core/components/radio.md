# `core.radio`

`core.radio` is the generic mutually-exclusive choice primitive. One radio represents one option in a set where selecting one enabled option deselects the previously selected peer. It does not own the group legend, option label content, help text, validation copy, or field layout.

## Semantics

- Web adapters SHOULD use a real native `<input type="radio">` where practical, or an accessibility-equivalent primitive that preserves native radio semantics.
- Radios that belong to one exclusive set MUST share the platform grouping mechanism (for native Web controls, the same form owner and `name`).
- The primitive MUST expose checked/unchecked state correctly and MUST NOT emulate independent checkbox behavior.
- Native keyboard behavior MUST be preserved: focus enters the radio set through the platform tab order; arrow-key movement/selection within a focused set and Space selection MUST remain available where platform semantics provide them.
- Disabled radios MUST remain perceivable, MUST NOT become selected through user activation, and MUST be skipped by selection movement where native platform behavior requires it.
- Invalid state MUST remain distinguishable without relying only on color.

## Tactile law

- Contact MUST acknowledge immediately.
- Hover/proximity MAY compress toward the resting surface but MUST NOT increase apparent elevation.
- Press MUST compress toward the surface before or as checked state resolves.
- Checked state MUST resolve immediately and remain unambiguous after physical feedback releases.
- Moving selection from one peer to another MUST leave exactly one checked option in the exclusive set unless the owning platform/form model explicitly permits no current selection.

## Target sizing

The visible radio glyph may be smaller than `size.control.minimum`, but the effective interactive hit target MUST meet or exceed `size.control.minimum`. Label association MAY enlarge the usable target; the Core radio primitive does not own label copy.

## Accessibility and resilience

- `focus-visible` is distinct from hover and MUST remain visible.
- Touch interaction MUST provide pressed feedback without requiring hover.
- RTL MUST preserve semantic meaning and must not reverse checked/unchecked meaning; directional keyboard behavior follows platform-native radio-group semantics.
- Reduced motion removes non-essential travel/rebound while preserving immediate contact and selection feedback.
- Forced colors MUST preserve the control boundary, focus indication, and checked/unchecked distinction.

## State contract

```text
rest
hover
focus-visible
pressed
unchecked
checked
invalid
disabled
```

`checked` and `unchecked` describe persistent selection state and may coexist with transient interaction states such as `focus-visible` or `pressed`.

## Composition boundary

`core.radio` owns one radio control. A higher-level field/group composition owns legends, shared help/error copy, layout, required-group messaging, and option-label content. Choice-card presentation is a separate composition and MUST NOT change the underlying mutually-exclusive semantics.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family behavior: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly groups radios with checkboxes for contact compression and immediate, unambiguous selection feedback, while also requiring keyboard/touch/reduced-motion conformance.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` lists `radio/choice card` among reusable Core primitives and applies the full conformance state/resilience gate.
- No radio-specific Rivet implementation artifact is claimed for the pinned Rivet snapshot; provenance is intentionally limited to evidence actually present in the reviewed snapshots.

Maturity is `public-proof`: the NeoSmartUI-owned native Web adapter is covered by exact-SHA browser evidence and the current live GitHub Pages deployment cohort. Custom-domain work remains deferred until the development roadmap is complete.
