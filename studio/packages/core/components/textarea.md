# `core.textarea`

`core.textarea` is NeoSmartUI's generic multiline text-entry primitive. It owns the editable textarea surface itself, not the surrounding field composition, formatting workflow, or business meaning of the content.

## Semantic boundary

The canonical Web implementation MUST preserve a real native `<textarea>`. Multiline text is intentionally separate from `core.input`: line breaks, multi-line selection, scrolling, native resize affordances, and larger editing geometry materially change the platform behavior and user expectations.

A label, help text, validation message, character counter, prefix/suffix control, formatting toolbar, auto-save state, or form layout is composition around the primitive and MUST NOT be smuggled into `core.textarea` itself.

A placeholder MAY provide an example or hint, but MUST NOT substitute for an accessible name.

## State model

- `rest` — editable and not focused.
- `hover` — pointer proximity may strengthen border/surface affordance but MUST NOT imply press or elevation.
- `focus-visible` — keyboard-visible focus is explicit and distinct from hover.
- `empty` — the current value is empty.
- `filled` — the current value contains one or more characters, including line breaks.
- `invalid` — invalidity is exposed semantically and MUST NOT rely on color alone when explanatory feedback is composed around the primitive.
- `read-only` — content cannot be edited but remains selectable/focusable according to native platform behavior.
- `disabled` — native disabled behavior prevents editing and the visual state remains unambiguous.

## Interaction law: interactive, not pressable

`core.textarea` is interactive because it accepts focus, editing, selection, scrolling, and potentially native resizing, but it is not an ordinary pressable control. Hover, pointer down, focus, text selection, scrollbar use, and resize interaction MUST NOT translate the textarea toward or away from the surface merely to imitate button physics.

Generic hover lift is forbidden. Button-style pressure compression is also forbidden for the textarea surface. A Theme MAY change border, surface, focus ring, invalid treatment, or other non-spatial state cues using semantic tokens.

## Native multiline editing contract

The Web adapter MUST preserve native multiline behavior rather than recreating editing in JavaScript. This includes line breaks, text selection, clipboard operations, undo/redo, IME/composition, spellcheck/autocorrect where enabled by the platform, scrolling, directionality, and browser-native form participation.

Author-supplied `rows`, `maxlength`, `minlength`, `wrap`, `name`, `required`, and related native attributes remain authoritative when applicable. NeoSmartUI MAY expose agent-readable empty/filled state metadata, but that metadata MUST mirror the native value rather than replace it.

## Resize and geometry

User resizing is part of native textarea behavior where the platform exposes it. Core MUST NOT globally disable resize merely for visual neatness. A future explicit variant MAY constrain resize only when its contract preserves usability and content access.

The effective control block size MUST meet or exceed `size.control.minimum`, but a multiline textarea SHOULD visibly communicate that more than one line can be entered. Theme or composition may provide a larger initial block size without inventing a second semantic control-minimum token in this contract slice.

Long content MUST scroll or reflow without making the control unusable. Resizing or content growth MUST NOT hide focus indication or break surrounding layout assumptions that are owned by composition.

## Accessibility and keyboard

- Consumers MUST provide an accessible name through field composition or an equivalent ARIA mechanism.
- `focus-visible` MUST remain perceptible and MUST NOT be removed without an accessible replacement.
- Invalid state must remain machine-readable and compatible with described-by error/help content supplied by composition.
- Read-only and disabled are not interchangeable states.
- Tab, Shift+Tab, native text-navigation keys, selection shortcuts, and platform editing shortcuts MUST retain their native meaning. Core MUST NOT introduce a composite-widget keyboard model around ordinary textarea editing.

## Touch, RTL, and international text

Touch editing MUST work without hover and MUST preserve platform selection handles, scrolling, virtual-keyboard behavior, and text insertion semantics.

Direction is inherited from composition or native content behavior. The control MUST preserve browser bidi editing, cursor movement, selection, IME, user-entered line breaks, and mixed-direction content rather than forcing Latin assumptions into Core.

## Reduced motion and forced colors

Reduced motion removes or shortens non-essential visual transitions without changing focus, invalid, read-only, disabled, empty, or filled meaning. Forced-colors mode must retain a visible boundary, readable content/placeholder treatment, resize/scroll usability where exposed by the platform, and explicit keyboard focus.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` supplies the generic state, keyboard, touch, reduced-motion, fluid-sizing, and agent-readable laws. Because textarea is an editing surface rather than an ordinary pressable control, NeoSmartUI applies those laws without importing the press-compression model.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists `textarea` among reusable Core primitives next to input/select/field capability and requires RTL/high-contrast/state resilience across components.
- No textarea-specific Rivet implementation artifact is claimed for `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d`; the pinned `components/ui/textarea.tsx` path does not exist.

## Maturity

Maturity is `public-proof`: the native Web adapter remains implementation-blob-bound to the same current singleton cohort as every public Core primitive—merged-main Quality run `34677415919`, artifact `10292104339`, deployment commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`. Live HTTPS verification binds `core.textarea` to source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6` while checking the canonical multiline, non-pressable, and resize markers.
