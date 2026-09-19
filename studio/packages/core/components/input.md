# `core.input`

`core.input` is NeoSmartUI's generic single-line text-like data-entry primitive. It owns the editable control itself, not the surrounding field composition.

## Semantic boundary

The canonical Web implementation MUST preserve a real native `<input>` for text-like entry. The initial Core contract covers `text`, `email`, `password`, `search`, `tel`, and `url` semantics. Controls with materially different native behavior—checkbox, radio, range, file, color, date/time pickers, buttons, and multiline text—belong to separate Core capabilities.

A label, help text, validation message, prefix/suffix action, password-reveal control, or form layout is composition around the primitive and MUST NOT be smuggled into `core.input` itself.

A placeholder MAY provide an example or hint, but MUST NOT substitute for an accessible name.

## State model

- `rest` — editable and not focused.
- `hover` — pointer proximity may strengthen border/surface affordance but MUST NOT imply press or elevation.
- `focus-visible` — keyboard-visible focus is explicit and distinct from hover.
- `empty` — the current value is empty; placeholder rendering may apply when supplied.
- `filled` — the current value is non-empty; value readability remains primary.
- `invalid` — invalidity is exposed semantically (for example `aria-invalid`) and MUST NOT rely on color alone when composed with explanatory feedback.
- `read-only` — the value cannot be edited but remains distinguishable from disabled; native read-only selection/focus behavior is preserved where the platform provides it.
- `disabled` — native disabled behavior prevents editing/activation and the visual state remains unambiguous.

## Interaction law: interactive, not pressable

`core.input` is interactive because it accepts focus and editing, but it is not an ordinary pressable control. Hover, pointer down, and focus MUST NOT translate the field toward or away from the surface merely to imitate button physics. Generic hover lift is forbidden, and button-style pressure compression is also forbidden for the input surface.

A Theme MAY change border, surface, focus ring, or other non-spatial state cues. Any transition is secondary to immediate editing/focus acknowledgement and must consume semantic motion roles rather than local timing values.

## Accessibility and keyboard

- The implementation MUST preserve native text editing, selection, copy/paste, undo/redo, IME, autocomplete, and platform keyboard behavior rather than recreating them in JavaScript.
- Consumers MUST provide an accessible name through field composition or an equivalent ARIA mechanism.
- `focus-visible` MUST remain perceptible and MUST NOT be removed without an accessible replacement.
- Invalid state must remain machine-readable and compatible with described-by error/help content supplied by field composition.
- Read-only and disabled are not interchangeable states.

## Touch and sizing

The effective control height MUST meet or exceed `size.control.minimum`. Touch users receive the same focus/editing semantics without depending on hover.

## RTL and international text

Layout direction is inherited from composition. The native editing surface MUST preserve browser bidi behavior, cursor movement, selection, IME, and user-entered text direction rather than forcing Latin assumptions into Core.

## Reduced motion and forced colors

Reduced motion removes or shortens non-essential visual transitions without changing focus, invalid, read-only, disabled, empty, or filled meaning. Forced-colors mode must retain a visible boundary, readable value/placeholder treatment, and explicit focus.

## Migration provenance

The contract adapts knowledge from the pinned family conformance specification and uses the pinned Soft/Rivet input capabilities as evidence that single-line input belongs in reusable Core. Legacy repositories without declared license metadata are knowledge references only; no legacy implementation code is copied into NeoSmartUI.

## Maturity

This slice is `contract-only`. No Web adapter, Theme-resolution expansion, or public proof is claimed until matching implementation and browser evidence exist in a later repository state.
