# `core.combobox`

`core.combobox` is NeoSmartUI's generic editable single-selection suggestion primitive. It combines a text-editing control with a related popup list of options so a user can type a query, inspect matching suggestions, move an active option, and commit one selected value without importing search-domain, commerce, SaaS, or application-specific meaning.

## Semantic boundary

Combobox is not a styled native Select. `core.select` preserves a browser-owned single-select popup and does not expose a portable open state. Combobox deliberately owns an editable query plus a programmatically related suggestion popup, so its keyboard, active-option, filtering, open/close, and committed-selection semantics require an explicit composite contract.

Combobox is also not Command Menu. A command surface chooses an action to execute; Combobox chooses one value. It is not Tabs, Menu, Dialog, Tooltip, or a generic Popover. The suggestion popup exists only as part of this editable value-selection relationship and MUST NOT become an arbitrary container for buttons, forms, menus, or unrelated rich interaction.

The initial Core contract is **single-selection only**. Multi-select, removable chips/tags, tokenized input, freeform value creation, async request policy, virtualization, remote pagination, business filtering, recent-item ranking, and application-specific search logic remain outside this slice. Those behaviors may be composed or separately contracted later rather than silently widening the primitive.

On the Web, the editable control MUST expose combobox semantics and an accessible name. The controlled popup is a listbox-compatible suggestion collection whose options expose one active/highlighted option and, when applicable, one committed selected value. `aria-expanded`, `aria-controls`, `aria-autocomplete`, `aria-activedescendant`, option selection semantics, or equivalent platform relationships must reflect real state rather than decorative styling.

## Query text and committed value are different authorities

The editable query is not automatically the committed selection. Typing changes query text and may change which suggestions are visible, but it MUST NOT silently claim a new selected value before an option is intentionally committed.

A committed option may populate the editable text according to the chosen implementation model. If the user edits that text afterward, the implementation must distinguish the new query from the previously committed value rather than pretending the typed substring is still an exact selection when it is not.

The Core state model therefore includes both query state (`query-empty`, `query-filled`) and persistent `selected` state. Implementations and agent-readable metadata MUST keep those concepts distinguishable.

## Popup and active option model

`closed` means the suggestion popup is not exposed as an active list. `open` means the controlled suggestion list is available and its relationship to the editable control is machine-readable.

`highlighted` represents the current active suggestion during navigation. Highlight is transient navigation state, not the same as committed selection. A highlighted option may become selected after an explicit commit action such as Enter or pointer/touch activation, but moving highlight alone MUST NOT silently submit or persist the value.

For the Web composite, DOM focus SHOULD remain on the editable combobox control while keyboard navigation moves the active option through `aria-activedescendant` or an equivalent established pattern. The popup MUST NOT create a second roving Tab stop for every suggestion merely because options are visually interactive.

The popup is not a modal. It MUST NOT trap focus, mark surrounding content inert, create a backdrop, or require Dialog semantics. Normal Tab navigation must be able to leave the Combobox.

## Keyboard behavior

When the editable control is focused and the popup is open, the interaction contract is:

- Printable text, Backspace/Delete, selection shortcuts, clipboard operations, IME/composition, and ordinary text editing remain native editing behavior.
- ArrowDown and ArrowUp may move the active suggestion while preserving DOM focus on the editable control.
- Enter commits the active enabled suggestion when one exists; without an active suggestion, Core MUST NOT invent a business-specific submit action.
- Escape closes the suggestion popup and clears transient highlight without moving focus away from the editable control. Escape MUST NOT erase a committed value merely because it closes the popup.
- Tab and Shift+Tab retain ordinary document focus traversal. Combobox MUST NOT trap Tab inside the popup.
- Home/End and Left/Right remain text-editing keys by default. Core MUST NOT steal them for list navigation simply to imitate a different composite widget.
- Disabled options are skipped by active-option navigation and cannot be committed.

If a platform accessibility pattern requires a narrowly different mapping, the implementation must document and test that mapping explicitly rather than silently overriding native text-editing behavior.

## Pointer, touch, and trigger behavior

Typing/focusing the editable field may open suggestions according to implementation policy. An optional disclosure trigger may also open or close the list. If a trigger exists, it is a real button-like control; the trigger follows the family pressure law: hover/contact moves it toward the resting surface, never upward, direct press acknowledges immediately, and release restores its structural depth.

The editable text surface itself remains an editing surface, not a pressable button. Pointer contact used to place a caret, select text, or edit content MUST NOT translate the input as though the entire field were a button.

Touch users must be able to open, inspect, and choose suggestions without depending on hover. Suggestion targets and any disclosure/clear controls must remain comfortably operable. Core MUST NOT require long-press or hover-only discovery for value selection.

## Interaction law: trigger compresses; popup establishes hierarchy

Family conformance explicitly states that menu/popover-style triggers follow tactile compression while their revealed surfaces may animate for hierarchy without making the trigger float upward. Combobox adopts that physical distinction.

The optional disclosure trigger may use existing structural depth and pressure tokens. The editable input does not acquire press translation. The popup may use the existing panel surface and a subtle non-spatial or hierarchy reveal, but its appearance MUST NOT translate the trigger away from the page or imply that the whole editable field levitated.

Highlighted and selected options need persistent, non-color-only distinction. Transient pointer hover cannot be the only indication of the active option, and committed selection must remain understandable after pointer contact ends.

## Invalid, disabled, and empty-result behavior

`invalid` belongs to the value/control semantics and must remain machine-readable. Visible validation copy belongs to `core.field` or another composition and cannot be replaced by a red popup border alone.

`disabled` makes the Combobox unavailable for query editing, popup interaction, trigger activation, and selection. Core MUST NOT leave an active popup trigger or active suggestion list attached to an otherwise disabled editable control.

An open query may have zero matching options. The initial contract allows a non-interactive empty-result message inside the popup but does not add an `empty-result` state because result availability is derived from the suggestion collection rather than a separate control mode. Empty-result content MUST NOT pretend to be a selectable option.

## Accessibility and accessible naming

The editable control requires an accessible name supplied by a visible label or another valid mechanism. Placeholder text is not a substitute for that name.

The popup relationship, expanded state, active option, selected option, disabled options, and invalid state must remain exposed to assistive technology through the appropriate platform semantics. Visual highlight or checkmarks cannot be the sole authority.

Because DOM focus remains on the editable control during list navigation, assistive technology must be able to determine which suggestion is active without forcing focus into each option. Closing the list returns the composite to ordinary editable-control semantics without creating a hidden focus destination.

## RTL, localization, and long content

Editable text preserves native directionality, caret movement, selection, IME, and mixed-direction input. Popup positioning and internal layout use logical rather than physical left/right assumptions.

Long localized option labels, descriptions, and typed values must not force page-level horizontal overflow or collapse the editable control below its minimum usable size. The popup may constrain inline size and scroll vertically where needed, but essential option text must remain available rather than silently clipped to an unreadable shape.

ArrowDown/ArrowUp active-option navigation does not reverse in RTL because it follows list order, while text-editing Left/Right behavior remains platform-native and direction-aware.

## Reduced motion and forced colors

Reduced-motion mode preserves immediate open/close, highlight, selection, and press meaning while removing non-essential popup travel or long release transitions. Functionality and semantic relationships remain unchanged.

Forced-colors/high-contrast mode must preserve a visible editable-control boundary, explicit keyboard focus, popup boundary, active-option distinction, selected-option distinction, disabled state, and invalid meaning. Active/selected meaning must not depend only on custom background color.

## Token boundary

The contract introduces **no new semantic token contracts**. It reuses the already-established roles required by its three semantic parts:

- editable control: interactive surface, readable content, border, minimum size, focus ring, invalid and disabled roles;
- optional disclosure trigger: existing control geometry plus structural depth/press/release roles;
- suggestion popup/options: panel surface, readable content, strong/default border, selected action surface/content, standard non-spatial motion, and emphasis typography.

This implementation does not require new Combobox-specific geometry, popup-shadow, highlight-color, search, ranking, or business-filter tokens. Rivet Light resolution scope now includes `core.combobox`, but every declared dependency already exists in the resolved bundle. Semantic token contracts therefore remain 63, every concrete Theme value remains unchanged, and the exact implemented/public dependency union remains 55.

## Canonical Web implementation

The canonical Web implementation is `packages/adapters/web/components/combobox.css` plus `packages/adapters/web/components/combobox.mjs`.

The adapter requires a real `<input role="combobox">` with `aria-autocomplete="list"` or `both`, a stable `aria-controls` relationship to an owned `role="listbox"`, stable option IDs, explicit boolean `aria-selected`, and single-selection state. It refuses multiple selected options rather than silently normalizing an invalid composite.

Filtering is local and deliberately generic: typed query text controls which supplied options are visible, while application-owned remote fetching, ranking, pagination, virtualization, and domain filtering remain outside Core. Typing after a committed choice clears the stale committed-selection claim when the text no longer exactly represents that selected value.

ArrowDown/ArrowUp update only `aria-activedescendant` and active-option metadata while DOM focus remains on the input. Disabled options are skipped. Enter commits the enabled active option and closes the list; Escape closes and clears transient highlight without erasing the committed value. No Home/End, Left/Right, Tab, printable-key, clipboard, selection, or IME remapping is installed.

Pointer movement may update the active option and pointer activation commits it before returning focus to the editable control. The optional disclosure control is validated as a real `<button type="button">`. Opening through it may seed the first enabled visible option; closing through it keeps the button focused so the input focus handler cannot immediately reopen the popup.

The CSS keeps `.ns-combobox-input` at `transform: none` through hover, focus, and active editing contact. Only `.ns-combobox-trigger` uses the established 0→2→5px pressure model. The popup uses generic surface spacing/border/radius/resting depth and opacity-only standard motion. Options remain outside normal Tab order, highlighted and selected states have explicit non-color boundaries, long content wraps, RTL uses logical geometry, reduced motion collapses transitions, and forced colors maps boundaries/focus/selection to system colors.

Foundry binds this exact adapter to a labelled editable Combobox with four supplied options, one disabled option, a non-option empty-result message, and a separate disclosure trigger. Five additive Chromium cases verify semantics/token geometry, active-descendant keyboard navigation with disabled-option skipping, query-versus-selection separation, input immobility plus trigger pressure/close stability, and RTL/long-content/reduced-motion/forced-colors resilience. The previous 85 browser cases remain unchanged, for 90 total.

## Migration knowledge provenance

This implementation is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — shared explicit-state, focus, keyboard, touch, reduced-motion, fluid-token, agent-readable, and pressure-not-levitation laws apply. The family Menus/Popovers rule provides the physical distinction that a trigger compresses while a revealed hierarchical surface may appear without making the trigger float upward.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists `Combobox surfaces` under Navigation + discovery and separately identifies keyboard-complete production Combobox behavior as high-value unfinished work. NeoSmartUI therefore uses Soft only as capability/boundary evidence and does **not** overclaim a completed Soft Combobox runtime.
- Rivet implementation knowledge: `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` — `components/ui/combobox.tsx` provides reference-only anatomy for editable input, disclosure trigger, clear action, positioned popup, list, items, groups, labels, empty state, separators, selection indicator, and optional chips. The initial NeoSmartUI implementation deliberately narrows that knowledge to single selection and excludes chips/multi-select. Repository metadata declares no license, so no source code is copied.

## Maturity

Maturity is `public-proof`. Canonical implementation evidence remains `packages/adapters/web/components/combobox.mjs`, paired visual evidence remains `packages/adapters/web/components/combobox.css`, and canonical public proof is `evidence/public/core.combobox.json`.

The singleton public-proof cohort binds merged source `e492fc06fd14d22087c0b428d2788d3d9824212a`, merged-main Quality run `34681815707`, browser artifact `10294780025`, deployment commit `3d20426f83cb2a30431c36300f4f842efdbe3de9`, deployment tree `ce8daa808c0195dbf90a88bd7335bb9a8baec6ca`, and native Pages run `34682319293`. Structural proof validation recomputes both canonical Combobox implementation blobs, and live verification requires the deployed editable Combobox/listbox marker contract. All seventeen public-proof Core components share this singleton cohort while retaining their own implementation blob bindings.
