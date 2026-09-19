# `core.tooltip`

`core.tooltip` is NeoSmartUI's concise supplemental-description primitive. It reveals short, non-interactive explanatory text for a target when pointer hover or keyboard focus needs additional context, without changing the target's own semantics or turning the description into a popup action surface.

## Semantic boundary

Tooltip content is supplemental, not essential. A user must not need a Tooltip as the only way to discover a control's accessible name, required instructions, validation message, safety warning, or other information necessary to complete a task. Essential content belongs inline, in `core.field` help/error composition, or in another persistent semantic surface.

The tooltip surface uses `role="tooltip"`. The described target references that tooltip with `aria-describedby` or an equivalent platform relationship. Tooltip MUST NOT use `role="dialog"`, `role="menu"`, `aria-haspopup`, `aria-expanded`, or another popup/composite semantic merely because it appears above surrounding content.

Tooltip content itself is non-interactive and does not enter the tab order. It MUST NOT contain buttons, links, inputs, menus, dismiss controls, or other focusable descendants. If the revealed surface contains interaction, richer structure, or user-controlled persistence, use a Popover/Dialog-class capability instead of Tooltip.

Core does not make an arbitrary non-interactive target focusable solely so it can own a tooltip. If keyboard users need the supplemental information, composition should attach it to an already focusable semantic target or present the information persistently.

## State model

The contract exposes exactly:

- `closed` — supplemental content is not visually shown.
- `open` — supplemental content is visually shown because the target is hovered or focused and has not been dismissed for the current interaction session.
- `dismissed` — Escape has closed the visible tooltip while the originating hover/focus condition still exists; it MUST NOT immediately reopen until that originating interaction ends and a new hover/focus session begins.

The Tooltip does not expose `hover`, `focus-visible`, `pressed`, `selected`, or `disabled` as surface states. Those states belong to the target, if the target's own semantic component supports them.

The canonical Web adapter mirrors only this three-state authority through `data-state` on the tooltip and `data-tooltip-state` on the target. It does not add or replace the target's role, tab index, activation, accessible name, or other component state.

## Open, hover, focus, and persistence behavior

A Tooltip MUST be available from pointer hover and from keyboard focus when its target is focusable. Pointer users must be able to move from the target onto the tooltip surface without causing the content to disappear immediately; the tooltip remains open while the pointer is over either target or tooltip.

Keyboard focus does not move into the Tooltip. Focus stays on the described target. Leaving the target with normal keyboard navigation closes the tooltip unless another legitimate open condition remains.

Tooltip MUST NOT auto-dismiss on a short timer while the target remains hovered/focused. Content remains available until the triggering hover/focus ends, the user explicitly dismisses it, or the target is removed/disabled by surrounding application logic.

The Web adapter uses only a short pointer-transfer grace period when the pointer leaves one member of the target/tooltip pair, allowing it to arrive on the other without collapsing the surface between adjacent pointer events. That grace period is not an auto-dismiss timer while either surface remains active.

## Escape dismissal

When a Tooltip is open, Escape dismisses it without moving focus from the target and without activating or changing the target. The Tooltip then remains dismissed for the current uninterrupted hover/focus session so the same condition does not immediately reopen it.

A later genuine interaction session—such as leaving and re-entering with the pointer, or moving focus away and back—may reveal it again.

Tooltip MUST NOT trap focus and MUST NOT intercept Tab, Shift+Tab, Enter, Space, Arrow keys, Home, or End for target behavior. The canonical adapter installs a document `keydown` listener only to observe Escape while an owned Tooltip is open; it neither stops propagation nor remaps any target key.

## Interaction law: explanation must not manufacture affordance

Pinned family conformance is explicit: Tooltips MUST NOT introduce movement that makes the target appear actionable when it is not.

Showing or hiding Tooltip content therefore MUST NOT translate, lift, compress, scale, deepen, or otherwise animate the target itself. A non-interactive target does not become pressable because a Tooltip is attached. An interactive target keeps only the pressure/focus behavior defined by its own component contract.

The canonical Tooltip CSS animates only Tooltip opacity through `motion.standard.duration`. The surface keeps `transform: none`; no selector in the Tooltip implementation translates or changes structural depth on the described target.

The Tooltip surface itself is informational and non-pressable. Pointer contact with it does not create hover lift, press compression, pointer cursor, or click behavior.

## Touch behavior

Touch devices do not provide a dependable hover model. Core Tooltip therefore MUST NOT make essential information touch-only or require long-press as the sole discovery mechanism.

The canonical adapter listens to `pointerenter`, `pointerleave`, focus, blur, and Escape only. It installs no click, touchstart, touchend, contextmenu, or long-press handler and therefore MUST NOT hijack tap, long-press, context-menu, text-selection, or native activation behavior merely to force a desktop tooltip pattern onto touch.

If the target's meaning needs persistent explanation for touch users, composition must expose that information through visible text or a touch-appropriate disclosure capability. This graceful non-interference is the Tooltip's touch support contract.

## Positioning, RTL, localization, and overflow

Tooltip visual placement is presentation, not reading-order semantics. The described target remains in normal document order; the Tooltip may be rendered elsewhere in the DOM only if the explicit description relationship remains correct.

Placement uses logical block/inline properties rather than hard-coded physical left/right assumptions. RTL changes visual placement where appropriate but does not change the descriptive relationship.

Long translated strings wrap within a bounded readable surface and MUST NOT force page-level horizontal overflow. Tooltips are intended to remain concise; long instructions or structured content belong in a persistent help surface or richer disclosure component.

## Reduced motion and forced colors

Reduced-motion mode removes non-essential reveal/close animation while preserving immediate visibility, dismissal, and description semantics. Because Tooltip never moves its target, reduced-motion support does not change target geometry.

Forced-colors/high-contrast mode preserves readable tooltip text and a perceivable boundary between tooltip content and surrounding surfaces using system colors. Meaning does not depend on custom shadow or color alone.

## Token boundary

Tooltip is a compact informational annotation surface, not a control and not a full grouped Card. The implementation reuses exactly the contract's existing roles:

- `color.surface.panel`
- `color.content.primary`
- `color.border.strong`
- `space.annotation.inline`
- `space.annotation.block`
- `border.annotation.width`
- `radius.annotation`
- resting structural depth only
- `motion.standard.duration` for non-spatial opacity timing
- body typography roles

Tooltip deliberately does not depend on target-size, focus-ring, press translation, hover/active depth, press/release motion, action surface, disabled opacity, or control geometry. Those belong to the described target or another interactive primitive.

Rivet Light resolution now includes `core.tooltip`, but every Tooltip dependency already existed in the implemented/public Core dependency union. The exact dependency union therefore remains 55, and every concrete Theme token value remains byte-for-value unchanged; only resolution scope expands.

## Canonical Web implementation

The canonical implementation is split by responsibility:

- `packages/adapters/web/components/tooltip.css` owns the bounded informational surface, logical placement, opacity-only visibility transition, wrapping, reduced-motion behavior, and forced-colors resilience.
- `packages/adapters/web/components/tooltip.mjs` validates a real `aria-describedby` relationship to a `role="tooltip"` surface, rejects focusable/interactive Tooltip content, maintains `closed`/`open`/`dismissed`, preserves target focus and semantics, supports pointer transfer between target and Tooltip, and observes Escape dismissal.

The adapter never manufactures a target role or tab stop and installs no click/touch/long-press behavior. The Tooltip element itself remains outside the tab order.

## Migration knowledge provenance

This implementation is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly states that Tooltips must not introduce movement that makes the target appear actionable when it is not, alongside the shared keyboard, touch, reduced-motion, RTL, semantic-token, and agent-readable laws.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists Tooltip under reusable Navigation + discovery capability.
- Soft semantic/anatomy evidence: the same pinned repository's `components.html` demonstrates a real target using `aria-describedby` to reference a distinct `role="tooltip"` surface.
- Soft visual evidence: `src/components/navigation.css` demonstrates a compact bounded tooltip surface with annotation-like spacing, border/radius, readable text, and stable structural depth. NeoSmartUI treats those values as reference-only visual knowledge and keeps semantic token ownership in the new architecture.
- Rivet provenance review: the complete pinned `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` tree was inspected and contains no `components/ui/tooltip.tsx`. NeoSmartUI therefore claims no Rivet Tooltip implementation provenance.

## Maturity

Maturity is `public-proof`. Canonical implementation evidence is `packages/adapters/web/components/tooltip.mjs` with presentation in `packages/adapters/web/components/tooltip.css`, and canonical proof is `evidence/public/core.tooltip.json`. Its singleton cohort binds merged source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`, merged-main Quality run `34677415919`, browser artifact `10292104339`, deployment commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, deployment tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`; structural proof validation recomputes both Tooltip implementation blobs and live verification requires the deployed Tooltip marker contract.
