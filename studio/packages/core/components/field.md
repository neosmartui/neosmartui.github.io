# `core.field`

`core.field` is NeoSmartUI's generic single-control form-field composition. It associates one primary form control with its visible label, optional description/help, requirement context, and validation message without absorbing the control's own editing, selection, activation, focus, or disabled behavior.

## Semantic boundary

A Field is composition around one primary labelable control such as `core.input`, `core.textarea`, or `core.select`. The control remains the semantic and interaction authority. Field MUST NOT recreate native input/select/textarea behavior, intercept activation, manufacture a second tab stop, or make the surrounding field container clickable.

The default simple Field does **not** add `role="group"`. A label plus one associated control already has an established native relationship; adding a generic group role can create redundant or misleading accessibility structure. Multiple related controls require an explicit grouping contract, normally native `<fieldset>`/`<legend>` or another semantically justified group pattern, rather than silently widening `core.field`.

The visible label MUST be programmatically associated with the primary control. On the Web this is normally an explicit `<label for>` + control `id`, or native label containment when containment is valid for the exact composition. Placeholder text, help copy, a card heading, or visual proximity MUST NOT substitute for an accessible label.

The canonical Web implementation is intentionally CSS-only. It uses semantic HTML supplied by composition plus CSS selectors that reflect the real control state; it does not install click, focus, validation, description, or live-region JavaScript and does not need a `field.mjs` binder.

## Description/help and validation relationships

Description/help text is supporting information, not part of the control's value. When it materially describes input requirements or consequences, the primary control SHOULD reference it with `aria-describedby` or an equivalent platform relationship.

An invalid Field is only honest when the primary control also exposes machine-readable invalidity through native constraint semantics and/or `aria-invalid="true"` as appropriate. Visible error text MUST be associated with the control using `aria-describedby`, `aria-errormessage`, or another valid mechanism supported by the chosen control semantics.

`role="alert"` is **not** the default for Field error text. A validation message already present when the user reaches the field is ordinary descriptive content. Dynamic announcement policy depends on when/how validation appears and belongs to composition; visual error styling alone MUST NOT create an assertive live region.

Field MUST NOT overwrite an author's existing `aria-describedby` relationship when adding help/error content. Multiple description IDs may be composed when all referenced text remains relevant.

The canonical CSS does not duplicate invalid state onto the Field. Instead, `:has([aria-invalid="true"])` allows the label treatment to reflect the primary control's machine-readable state while the error message remains ordinary associated text.

## Required, optional, disabled, and read-only meaning

Required/optional presentation is metadata about the primary control, not a fake Field interaction state. If a visible required marker is shown, native `required` or the appropriate `aria-required` semantic remains authoritative. Color or an asterisk alone MUST NOT be the only accessible indication when requirement meaning would otherwise be ambiguous.

`disabled` in the Field contract mirrors the state of the associated primary control for presentation only; the Field container does not disable anything itself. Likewise, read-only behavior belongs to controls that support it. A Field MUST NOT translate read-only into disabled, or disabled into read-only.

The canonical CSS reflects a real disabled descendant with `:has(:disabled)` and existing secondary-content color. It does not introduce a Field-level disabled attribute, opacity contract, or pointer blocker.

The initial contract exposes:

- `rest` — ordinary label/control/supporting-copy composition.
- `invalid` — the primary control is machine-readably invalid and associated validation text is available where needed.
- `disabled` — the primary control owns a disabled state; Field presentation may reflect that state without creating another disabled mechanism.

Required/optional, empty/filled, read-only, selected, checked, and focus-visible remain properties/states of the primary control or surrounding composition rather than independent Field states.

## Interaction law: composition is not a control

Field itself is not pressable. It MUST NOT lift, compress, translate, acquire pointer cursor, or synthesize hover/active/focus-visible states around the whole composition. Any tactile feedback belongs to the actual nested control or action.

A label may retain native label behavior that focuses/activates its associated control where the platform defines that behavior. Core MUST NOT reproduce that behavior with click handlers. Help links, password-reveal buttons, retry actions, or other nested controls remain independent components with their own semantics and target-size/pressure rules.

The canonical CSS has no Field hover/active/focus interaction selector, sets `transform: none` and `transition: none`, and leaves focus rendering entirely to the nested control.

## Keyboard and touch

The Field container does not enter the tab order. Keyboard navigation reaches the primary control and any genuine nested actions in ordinary document order. Labels and descriptions do not become focusable simply because they are part of a Field.

Touch users must receive the native label/control hit behavior provided by the actual associated control. Field MUST NOT place an invisible whole-row activation target over unrelated help links or actions.

## RTL, localization, and long content

Field layout uses logical directions and must tolerate long labels, descriptions, validation messages, identifiers, and translated text without clipping essential meaning or forcing horizontal overflow. Required/optional indicators must remain understandable when inline direction reverses.

Visual reordering MUST NOT separate label/help/error content from the reading order expected by keyboard and assistive-technology users. The canonical implementation uses grid flow, logical sizing, and `overflow-wrap: anywhere` rather than fixed physical direction assumptions.

## Reduced motion and forced colors

Field itself owns no spatial interaction, so reduced-motion mode has no Field-specific travel to suppress. Nested controls continue to follow their own reduced-motion contracts.

Forced-colors/high-contrast rendering must preserve readable label/help/error text. Invalid meaning cannot depend on custom red alone; machine-readable invalidity plus explicit validation text remain the authoritative channels. The canonical Field text resolves to `CanvasText` in forced-colors mode while the nested control retains its own high-contrast boundary/focus rules.

## Token boundary

Field introduces one value-free semantic spacing role: `space.field.gap`, the block-axis relationship between label, primary control, description/help, and validation message. It MUST NOT borrow `space.control.*` because those roles describe spacing **inside** controls, and it MUST NOT borrow Card surface or Badge annotation geometry merely because those values exist.

Rivet Light resolves `space.field.gap` directly from pinned Soft evidence as `clamp(0.5rem, 0.44rem + 0.18vw, 0.6875rem)`. This is the only new concrete resolved value in the Field implementation slice. Every previously resolved token value remains unchanged.

The remaining dependencies are existing text/status roles: primary and secondary readable content, error color, body/label typography, and regular/emphasis weights. Field does not own control border/radius/target-size, focus-ring, depth, press-translation, or motion tokens; those remain dependencies of the nested control that actually interacts.

## Migration knowledge provenance

This contract and implementation are clean NeoSmartUI definitions informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — shared accessibility, keyboard, touch, reduced-motion, semantic-token, and agent-readable laws apply while Field itself stays non-pressable and lets the real control own interaction.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists `label/help/invalid field` with input/textarea/select in Core.
- Soft implementation knowledge: the same pinned repository's `registry/default/field/field.tsx`, `src/components/input.css`, and `src/tokens.css` demonstrate label/control/help anatomy, invalid presentation, a dedicated field gap, and the exact fluid `--nbs-space-2` value. The legacy wrapper-label approach is not treated as universally correct for arbitrary composition; NeoSmartUI requires an explicit valid label/control relationship instead.
- Rivet implementation knowledge: `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` — `components/ui/field.tsx` provides Field/Label/Description/Error/fieldset/legend anatomy and orientation knowledge. Its generic `role="group"` field host and unconditional `role="alert"` FieldError are not adopted as defaults for one-control Field because those semantics must match actual grouping and announcement needs. Repository metadata declares no license, so this remains reference-only knowledge.

## Maturity

Maturity is `public-proof`. The canonical CSS-only Web implementation remains `packages/adapters/web/components/field.css`, with proof bound at `evidence/public/core.field.json` to merged source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`, merged-main Quality run `34677415919`, browser artifact `10292104339`, Pages commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, Pages tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`. Live verification uses the canonical GitHub Pages HTTPS endpoints and the deployed Field label/help/invalid/disabled markers without introducing a Field JavaScript binder, group role, or implicit live region.
