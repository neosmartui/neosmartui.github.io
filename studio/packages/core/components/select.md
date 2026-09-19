# `core.select`

`core.select` is NeoSmartUI's generic single-choice option picker. It owns the collapsed native select control and its platform selection behavior, not the surrounding field composition, custom popup UI, search workflow, or business meaning of the options.

## Semantic boundary

The canonical Web implementation MUST preserve a real native single-select `<select>`. This initial Core contract covers the ordinary single-choice control with `multiple` absent/false and `size` absent or effectively one row.

A multi-select/listbox, searchable combobox, autocomplete, command palette, custom menu/listbox popup, async option loader, cascading picker, label, help text, validation message, or form layout is a different capability or higher-level composition and MUST NOT be smuggled into `core.select`.

Native `<option>` and `<optgroup>` semantics remain authoritative. The selected option and the select's native value are the source of truth; the Web adapter mirrors only selected value/index metadata and MUST NOT replace browser selection behavior.

## State model

- `rest` — enabled, closed/collapsed from the page's perspective, and not focused.
- `hover` — pointer proximity may compress the collapsed control toward the resting surface without being required for comprehension.
- `focus-visible` — keyboard-visible focus is explicit and independent from hover/press styling.
- `pressed` — direct contact with the collapsed choice trigger acknowledges immediately by moving toward the surface, never upward.
- `selected` — the native control exposes its current selected option/value; selection persists independently from transient press feedback.
- `invalid` — invalidity is machine-readable through native constraint/ARIA semantics and is not communicated by color alone when explanatory feedback is composed around the primitive.
- `disabled` — native disabled behavior prevents interaction and remains visually unambiguous.

The contract intentionally does not invent a portable `open` state. Browser/OS-native select popup visibility is not exposed consistently enough to make it a reliable Core state contract, and NeoSmartUI MUST NOT replace the native popup merely to obtain one.

## Interaction law: pressure, not levitation

Unlike `core.input` and `core.textarea`, a collapsed single-select is a choice trigger rather than a text-editing surface. Direct pointer/touch contact follows the family pressure model: rest depth reduces on hover/contact, press moves toward the surface, and release restores structural depth. Apparent elevation MUST NOT increase on hover.

The platform-owned option popup is not a lifted NeoSmartUI surface and MUST NOT be reimplemented in this primitive. Tactile feedback belongs to the collapsed trigger only; the browser/OS continues to own popup presentation and option interaction.

The adapter mirrors pointer contact only as visual pressed metadata and never calls `preventDefault()` or synthesizes popup behavior. Keyboard-triggered selection/opening therefore preserves native platform behavior instead of being recreated solely to force pressure timing.

## Native choice contract

The Web adapter preserves native option selection, form participation, `name`, `required`, `disabled`, `autocomplete`, `value`, `<option disabled>`, `<optgroup>`, and browser/OS popup behavior. It rejects `multiple` controls and multi-row/listbox-style `size` values rather than silently changing their semantics.

Core MUST NOT synthesize its own keyboard navigation, type-ahead buffer, focus trap, or ARIA listbox for an ordinary native select. Arrow keys, typing/type-ahead, Space/Enter behavior, Escape behavior, option navigation, and popup modality remain platform semantics.

A first option with an empty value MAY be used by composition as a prompt for a required select, but HTML has no native select `placeholder` attribute. Core MUST NOT label such a convention as a native placeholder semantic.

## Accessibility and keyboard

- Consumers MUST provide an accessible name through a `<label>` or equivalent valid mechanism.
- Native select semantics and focusability MUST remain intact.
- `focus-visible` MUST remain perceptible and MUST NOT be removed without an accessible replacement.
- Disabled options remain distinct from a disabled select.
- Invalid state must remain machine-readable and compatible with described-by help/error content supplied by composition.
- Core MUST NOT add a custom composite-widget keyboard model around the native single-select.

## Touch and sizing

The effective collapsed control size MUST meet or exceed `size.control.minimum`. Touch interaction must not depend on hover, must acknowledge direct contact where the platform/CSS state permits it, and must leave the native picker modality intact.

## RTL and international options

Direction is inherited from composition/native browser behavior. The implementation preserves browser bidi rendering, option text direction, logical alignment, and platform popup behavior rather than forcing Latin or physical-left assumptions into Core.

Long or localized selected values must remain readable or predictably clipped/wrapped according to platform and composition constraints without breaking the control's hit target or focus indication.

## Reduced motion and forced colors

Reduced motion removes or shortens non-essential press/release travel while preserving immediate state meaning. Forced-colors mode retains a visible boundary, selected value, native picker affordance where the platform exposes one, and explicit keyboard focus.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` supplies generic state, pressure-not-levitation, keyboard, touch, reduced-motion, sizing, and agent-readable laws. Its menu/popover-trigger rule reinforces that a collapsed choice trigger compresses rather than floats, while NeoSmartUI keeps the native select popup browser-owned.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists `select` beside input and textarea among reusable Core primitives and requires RTL/high-contrast/state resilience.
- No select-specific Rivet implementation artifact is claimed for `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d`; the pinned `components/ui/select.tsx` path does not exist.

## Maturity

Maturity is `public-proof`. The canonical Web adapter remains independently implementation-blob-bound while its current singleton evidence cohort is merged-main Quality run `34677415919`, artifact `10292104339`, deployment commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`. Live verification requires source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6` and the canonical native single-select markers.
