# `core.accordion`

`core.accordion` is a generic disclosure composite for showing and hiding related content sections. It is not Tabs, navigation, a menu, or a business-domain workflow.

## Semantic boundary

An Accordion is composed from repeated items. Each item has a heading, a real button trigger, and one controlled content panel.

The trigger MUST remain a real `<button>` with ordinary button keyboard and focus behavior. The canonical Web implementation requires `<button type="button">` so disclosure activation cannot accidentally submit an enclosing form. Each trigger exposes `aria-expanded="true|false"` and references its panel through `aria-controls`. The controlled panel has a stable ID and is associated back to its trigger with `aria-labelledby`.

The root does not receive a synthetic widget role merely because multiple disclosure items are grouped together. A panel MAY use `role="region"` when the surrounding information architecture benefits from a landmark, but Core MUST NOT make every Accordion panel a region by default when that would create landmark noise.

Accordion supports explicit `single` and `multiple` expansion policies through `data-expansion`. That policy changes how peer items coordinate; it does not change the trigger/panel semantics of an individual item.

## State authority

The contract exposes exactly:

- `rest`
- `hover`
- `focus-visible`
- `pressed`
- `closed`
- `open`
- `disabled`

`open` and `closed` describe disclosure state. They are not selection, navigation-current, or tab-selection states.

`aria-expanded` remains the semantic disclosure authority. The adapter mirrors agent-readable `data-state` on each trigger and panel. Closed panels use the native `hidden` attribute, so their descendants are removed from rendering and normal focus traversal instead of remaining operable behind a visual mask.

A disabled item keeps a real disabled button and cannot be toggled by the user. Disabled presentation is never the only thing preventing activation.

## Keyboard and focus

Tab and Shift+Tab retain ordinary document focus traversal. Accordion triggers stay in normal Tab order rather than using a roving-tabindex model.

Space and Enter toggle the focused trigger through native button click activation. The canonical adapter installs **no `keydown` handler**. Core Accordion does not remap ArrowUp, ArrowDown, Home, End, Tab, or Shift+Tab merely to imitate Tabs.

Opening a panel does not move focus into the panel automatically. Closing a panel does not move focus away from its trigger. Focusable descendants inside an open panel participate in normal document order; once that panel is closed with `hidden`, those descendants are no longer reachable as though visible.

## Pressure and motion

The trigger is a real pressable control and follows the NeoSmartUI pressure law:

- rest keeps structural 5px depth;
- hover/proximity compresses by the existing 2px press vector;
- direct press reaches the existing 5px active compression;
- release restores resting depth in a short controlled motion;
- hover MUST NOT increase apparent elevation.

Disclosure state persists after the transient press ends. An open trigger returns to resting depth instead of staying seated like a selected Tab. The decorative disclosure indicator rotates to communicate expanded state without becoming a separate focus target or duplicating the trigger's accessible name.

The panel itself is a grouped content surface, not a pressable control. It uses existing surface spacing, border, radius, panel color, and body typography roles. The indicator uses `motion.standard.*`; trigger compression uses existing press/release motion roles. No broad `transition: all` behavior is used.

With reduced motion enabled, trigger and indicator transitions collapse to 1ms while preserving the same open/closed semantics and tactile state distinctions.

## Touch, RTL, localization, and forced colors

The trigger's effective target meets or exceeds `size.control.minimum`. Touch activation receives native button contact behavior and does not depend on hover.

Layout uses logical inline/block geometry so RTL does not reverse disclosure meaning. Trigger text and panel content wrap under long localization rather than forcing page-level horizontal overflow. The indicator occupies logical inline-end through flex layout rather than physical left/right positioning.

Forced-colors rendering uses system Canvas/CanvasText/ButtonText/Highlight colors while preserving visible trigger and panel boundaries, focus, disabled meaning, and the rotated expanded indicator.

## Token contract

Accordion uses existing Core roles only. Trigger geometry and pressure use control, target-size, depth, press, focus, disabled-opacity, and press/release motion roles. Panel content uses existing panel/surface spacing, border, radius, body typography, and standard motion roles.

The implementation introduces no Accordion-specific token and no new Rivet Light token value. Adding `core.accordion` to Rivet Light changes Theme scope only; the semantic token-contract count remains 63 and the exact implemented/public dependency union remains 55.

Accordion does not borrow annotation or navigation typography/spacing roles merely because an indicator or heading is present.

## Canonical Web implementation

The canonical implementation is:

- `packages/adapters/web/components/accordion.css`
- `packages/adapters/web/components/accordion.mjs`

The adapter exports `syncAccordionItem`, `setAccordionItemOpen`, and `bindAccordion`. It validates a real `.ns-accordion` root, direct-owned real `<button type="button">` triggers, stable IDs, strict boolean `aria-expanded`, valid `aria-controls`, and matching panel `aria-labelledby` relationships. It supports only `single` or `multiple` expansion policy.

The binder installs click handlers only. It does not install a `keydown` listener, does not create a roving tabindex model, does not manufacture `role="tablist"`, `role="tab"`, or `role="tabpanel"`, and does not call `preventDefault()` or `stopPropagation()` for native keyboard behavior.

The CSS gives the trigger the existing 0→2→5px pressure model, keeps open state at resting depth after release, rotates the decorative indicator, uses `hidden` for closed panels, and preserves reduced-motion and forced-colors behavior.

Foundry demonstrates one single-expansion root with an initially open panel, one disabled trigger, and one multiple-expansion root. Five additive Chromium cases verify semantic anatomy and both policies, native focus/Space/Enter behavior with no roving keys, exact pressure geometry plus resting open state, RTL/long-content containment, and reduced-motion/forced-colors behavior. The previous 90 browser cases remain unchanged, for 95 total.

## Migration provenance

The pinned family `COMPONENTS.md` provides the shared interactive laws used here: explicit state modeling, pressure-not-levitation, keyboard focus, touch acknowledgement, reduced-motion behavior, semantic tokens, and agent-readable metadata. That family snapshot does not contain a separate Accordion-specific interaction law, so NeoSmartUI does not claim one.

The pinned Soft snapshot does not list or implement Accordion as a reusable capability. No Soft Accordion provenance is claimed.

Pinned Rivet contains `components/ui/accordion.tsx`, which provides reference-only anatomy for root, item, heading/trigger, content, open/closed state, disabled handling, focus treatment, and a disclosure indicator. Rivet repository metadata declares no license, so NeoSmartUI copies no source implementation.

## Lifecycle

Maturity is `public-proof`.

Implementation evidence is `packages/adapters/web/components/accordion.mjs`, paired CSS is `packages/adapters/web/components/accordion.css`, and canonical proof is `evidence/public/core.accordion.json`.

The singleton proof cohort binds deployed source `57dc766ece8eca13b8c60b6f14615692ecdb51e8`, merged-main Quality run `34699170996`, browser artifact `10300390087`, Pages commit `f5caac25c16aa012222edeeb3b0e85c6b1bfbd11`, Pages tree `b0f9ec75170566945b8bf00af9a5c8b1b3136555`, and native Pages run `34700103133`. Structural proof validation recomputes both Accordion implementation blobs, while live proof validation requires the deployed Accordion disclosure markers. All eighteen public-proof Core components share this singleton deployment/browser cohort while retaining their own implementation blob bindings.
