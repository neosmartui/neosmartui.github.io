# `core.checkbox`

`core.checkbox` is the generic checkable-control contract. It represents one independent boolean choice and MAY expose an indeterminate visual state when application-owned aggregate state requires it. It does not own field labels, help text, validation copy, or multi-control grouping.

## Semantics

- Web adapters SHOULD use a native `<input type="checkbox">` where practical, or an accessibility-equivalent primitive that preserves native checkbox semantics.
- The accessible state MUST expose checked/unchecked and indeterminate state correctly.
- Space activation MUST toggle the control when it is enabled and focused.
- A visible label MAY enlarge the hit area through platform-appropriate label association, but the checkbox primitive does not own label content.
- Disabled checkboxes MUST remain perceivable and MUST NOT toggle.
- Invalid state MUST remain distinguishable without relying only on color.

## Tactile law

- Contact MUST acknowledge immediately.
- Hover/proximity MAY compress toward the resting surface but MUST NOT increase apparent elevation.
- Press MUST compress toward the surface before or as the state mark resolves.
- Checked and indeterminate marks MUST resolve immediately and remain unambiguous after release.
- State change and physical feedback are coordinated; the mark MUST NOT lag behind the user action with decorative delay.

## Target sizing

The visible checkbox box may be smaller than `size.control.minimum`, but its effective interactive hit target MUST meet or exceed `size.control.minimum`. Adapters MUST NOT infer that the visual glyph size is permission to shrink the usable target.

## Accessibility and resilience

- `focus-visible` is distinct from hover and MUST remain visible.
- Touch interaction MUST provide pressed feedback without requiring hover.
- RTL MUST preserve meaning; check/indeterminate state is not direction-dependent.
- Reduced motion removes non-essential travel/rebound while preserving immediate contact and state feedback.
- Forced colors MUST preserve the control boundary, focus indication, and checked/indeterminate distinction.

## State contract

```text
rest
hover
focus-visible
pressed
unchecked
checked
indeterminate
invalid
disabled
```

`checked`, `unchecked`, and `indeterminate` describe logical/presentational selection state and may coexist with interaction states such as `focus-visible` or `pressed`.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family behavior: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly requires checkbox/radio contact compression and immediate, unambiguous selection feedback.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` lists checkbox among Core primitives and applies the full conformance state/resilience gate.
- Rivet implementation evidence: `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` — `components/ui/checkbox.tsx` demonstrates a generic checkable primitive, used only as knowledge evidence because repository licensing is not declared in metadata.

Maturity remains `contract-only` until NeoSmartUI-owned implementation evidence exists.
