# `core.segmented-control`

`core.segmented-control` is NeoSmartUI's compact single-selection mode/view control. It presents a small set of peer actions as one visually connected group while keeping each segment a real button and keeping one persistent active mode distinguishable after transient press feedback ends.

## Semantic boundary

Segmented Control is a button-based mode selector, not a submitted form-value choice and not a tab-panel composite.

Use `core.radio` when the user is choosing one value that belongs to form data or another mutually-exclusive choice model with native radio semantics. A Segmented Control MUST NOT replace radios merely to obtain a more compact visual treatment.

Use `core.tabs` when selection controls which peer `tabpanel` is active and the composite requires tablist/tab/tabpanel relationships, roving focus, or Arrow/Home/End navigation. A Segmented Control MUST NOT expose `role="tablist"`, `role="tab"`, or `role="tabpanel"` and MUST NOT borrow the Tabs keyboard model.

The default Web semantic model is a labelled `role="group"` containing real `<button type="button">` segments. Each segment exposes persistent mode state with `aria-pressed="true"` or `aria-pressed="false"`. `aria-pressed="mixed"` is outside this single-selection contract.

A non-empty usable Segmented Control has exactly one selected segment. Activating a different enabled segment moves `aria-pressed="true"` to that segment and clears it from its peers. Activating the already selected segment MUST NOT silently deselect the group to zero active modes.

The group needs an accessible name when its purpose is not already unambiguous from surrounding semantics. The group container is not itself focusable or clickable; the real buttons own focus and activation.

## State model

The initial contract exposes:

- `rest` — an enabled unselected segment is available normally.
- `hover` — pointer proximity may compress an enabled segment toward the resting surface.
- `focus-visible` — keyboard-visible focus remains explicit on the real button and independent from selected state.
- `pressed` — direct pointer/touch or native keyboard activation acknowledges immediately through inward compression.
- `selected` — one segment persistently represents the active mode through `aria-pressed="true"` and a visible non-transient treatment.
- `disabled` — an unavailable segment uses native button disabled semantics and cannot become selected through activation.

Selected is persistent state, not the same thing as pressed. The selected treatment MUST remain distinguishable after contact/release feedback ends.

## Interaction law: pressable peers, persistent selection

Pinned family conformance is explicit: pressable chips/segmented controls follow tactile compression, and selected state remains distinguishable after release. Each enabled segment therefore follows the permanent pressure-not-levitation sequence: structural rest depth, inward hover compression where hover exists, deeper direct-contact compression, then release back to the segment's persistent selected or unselected resting treatment.

Hover MUST NOT raise a segment above its resting surface. The selected segment may look seated, filled, outlined, or otherwise locked into the group, but persistent selection MUST NOT be communicated only by the transient active transform or only by color.

The group frame is not itself a pressable surface. Pointer contact in gaps/padding around the actual segment buttons performs no action and receives no fake pressed feedback.

## Keyboard behavior

Each segment is a native button in ordinary document Tab order. Core does not create a roving-focus composite for this primitive.

- Tab and Shift+Tab follow normal document order through enabled segment buttons.
- Space and Enter use native button activation semantics.
- ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Home, and End MUST NOT be intercepted to manufacture a Tabs/radio-style composite keyboard model in this contract.
- Focus-visible treatment belongs to the actually focused button and remains visible even when that button is selected.
- Disabled native buttons do not activate and follow platform focus behavior.

If a product needs a single-tab-stop composite with Arrow-key selection, that is a different explicitly contracted interaction model rather than an implicit Segmented Control behavior.

## Touch and target size

Every enabled segment is a standalone compact control and its effective target MUST meet or exceed `size.control.minimum`. The existing Rivet Light minimum is 44px, so NeoSmartUI does not inherit the smaller legacy Soft `2.25rem` segment height as an accessibility target.

Touch activation must acknowledge contact immediately without depending on hover. Selection changes after real button activation and remains visually clear when the finger is removed.

## Disabled meaning

Unavailable segments use the native `disabled` attribute on their real button. Core MUST NOT leave an otherwise active button operable and rely on `aria-disabled="true"` alone as a substitute for disabled behavior.

Disabling one segment does not make the group itself disabled. If composition disables the entire mode selector, each interactive button must become genuinely unavailable while the current mode remains understandable. A currently selected segment may therefore also become disabled; its selected meaning remains represented until another enabled mode is deliberately activated.

## RTL, localization, and responsive layout

Segment order follows logical document order and must remain semantically coherent under RTL. The control MUST NOT infer previous/next meaning from physical left/right position because segments represent named peer modes rather than directional navigation.

Long translated labels and mixed-direction text must not collapse a segment below the minimum target or force page-level horizontal overflow. The group may wrap or move to an equal-width responsive grid when space is constrained, preserving DOM order and button semantics.

## Reduced motion and forced colors

Reduced-motion mode preserves immediate press and selected-state meaning while removing or reducing non-essential travel/release animation. Functionality, selection authority, focus order, and target size remain unchanged.

Forced-colors/high-contrast mode must retain visible button boundaries, explicit keyboard focus, native disabled meaning, and a non-color distinction for the selected segment. `aria-pressed` remains the machine-readable selection authority.

## Token boundary

Segmented Control introduces no new token contracts. It intentionally reuses existing generic roles for:

- group/segment readable surfaces and content;
- compact control padding, border, radius, and minimum target;
- structural depth and press translation for enabled buttons;
- press/release motion and focus ring;
- disabled opacity;
- label typography and emphasis;
- a small existing navigation gap for peer spacing.

The contract does not own form-field spacing, Card surface padding, Badge annotation geometry, error/status colors, or application-specific layout values.

Rivet Light resolution now includes `core.segmented-control`, but every declared dependency was already resolved by the existing implemented/public cohort. The exact dependency union therefore remains 55 and no existing Theme token value changes.

## Web implementation

The canonical Web runtime consists of `packages/adapters/web/components/segmented-control.css` plus `packages/adapters/web/components/segmented-control.mjs`.

The CSS keeps the group frame non-pressable and assigns pressure mechanics only to real segment buttons. Unselected segments rest at structural depth, compress to the existing hover depth, and seat at active depth on direct contact. The persistent selected segment uses the existing primary action surface/content roles, remains seated after release, and uses a double border as a non-color selected distinction. Enabled targets resolve `size.control.minimum`; native disabled buttons retain disabled meaning and use the existing opacity role. Narrow layouts become an equal-width grid without changing DOM order.

The binder validates a labelled-group-compatible `role="group"` host with real `<button type="button">` segment peers whose `aria-pressed` values are strictly `true` or `false`. It requires exactly one selected segment at bind/sync time, transfers selection only after native `click`, leaves reactivation of the already selected segment selected, and mirrors agent-readable `data-state` plus `data-selected-segment` metadata. It installs no `keydown` handler, so Tab/Shift+Tab, Space/Enter, Arrow keys, Home, and End remain native button/document behavior rather than a hidden Tabs model.

Five additive Chromium cases cover semantic anatomy and single-selection transfer, native keyboard behavior without roving focus, exact 0→2→5px pressure geometry plus persistent selected treatment, RTL/long-label responsive resilience, and reduced-motion/forced-colors behavior. Existing browser cases remain unchanged, taking the suite from 75 to 80 cases.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly states that chips/segmented controls follow tactile compression and that selected state must remain distinguishable after release, alongside the shared focus, touch, reduced-motion, fluid-token, and agent-readable laws.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists segmented control under reusable Navigation + discovery capability.
- Soft semantic/anatomy evidence: the same pinned repository's `components.html` demonstrates a labelled `role="group"` containing real buttons with mutually-exclusive `aria-pressed` state.
- Soft visual evidence: `src/components/navigation.css` demonstrates a connected group frame, compact peer buttons, inward hover/active travel, persistent active treatment, and responsive conversion to an equal-width grid. NeoSmartUI retains the useful physical/layout knowledge while enforcing the existing 44px minimum target instead of copying the smaller legacy height.
- Soft behavior evidence: `component-explorer.js` demonstrates single-selection transfer by setting exactly one peer button to `aria-pressed="true"` after activation. NeoSmartUI treats this as behavior knowledge only and does not copy source code.
- Rivet provenance review: pinned `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` contains `components/ui/button-group.tsx`, which provides generic grouped-button orientation/anatomy but no segmented selected-state behavior. NeoSmartUI therefore does not claim a Rivet Segmented Control implementation artifact.

## Maturity

Maturity is `public-proof`. Canonical implementation evidence remains `packages/adapters/web/components/segmented-control.mjs`, with canonical proof `evidence/public/core.segmented-control.json`. The proof binds the exact implementation files `packages/adapters/web/components/segmented-control.mjs` and `packages/adapters/web/components/segmented-control.css` to merged source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`, merged-main Quality run `34677415919`, browser artifact `10292104339`, Pages commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, Pages tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`. Live verification uses the already-deployed Segmented Control markers; proof promotion changes no runtime implementation, Theme token value, Foundry artifact, workflow, migration, schema, token contract, or browser test.
