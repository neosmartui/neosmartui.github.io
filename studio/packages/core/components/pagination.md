# `core.pagination`

`core.pagination` is NeoSmartUI's generic paged-navigation primitive. It helps a user move among discrete pages in one ordered result or content collection without importing table, search, commerce, router, API, or application-specific meaning.

## Semantic boundary

Pagination is navigation, not a row of arbitrary buttons. When an item represents a real destination, the Web default MUST preserve a real anchor with a real `href`. Core MUST NOT replace link destinations with click handlers, `role="link"` spans, or buttons merely to obtain styling or state control.

A Pagination region SHOULD be exposed through an appropriately labelled navigation landmark such as `<nav aria-label="Pagination">`. Page-number items, previous/next destinations, and optional first/last destinations belong to that navigation model. Pagination does not own route construction, URL/query serialization, data fetching, cache invalidation, total-count discovery, page-size selection, virtual scrolling, infinite scroll, or application history policy.

Pagination is also not Tabs. Tabs switch peer panels inside one composite widget and own a roving-focus/selected-panel model. Pagination follows ordinary document navigation: reachable destinations participate in normal Tab order and activation follows native anchor behavior.

## Current page

Exactly one visible item SHOULD identify the current page when the collection is paged. Machine-readable authority is `aria-current="page"`.

The default current item SHOULD be non-interactive text rather than a redundant self-link. If composition has a legitimate reason to retain a current-page link, it MUST still expose `aria-current="page"`; that exception does not make `aria-disabled="true"` the current-page semantic.

Current meaning MUST remain visible without custom color alone. Surface treatment, border, text, or another non-color cue may reinforce it, while `aria-current` remains the accessibility authority.

## Previous, next, boundaries, and disabled meaning

Previous/next labels describe relative navigation, not physical left/right movement. Text or accessible names SHOULD communicate “Previous” and “Next” even when an arrow icon is used visually.

At a collection boundary, an unavailable previous/next item MUST NOT remain an apparently actionable link with a fake destination. Composition may omit it or expose a non-interactive unavailable control. If an actual button-backed paging workflow is used because the operation is not URL navigation, native `disabled` is preferred where applicable.

`aria-disabled="true"` alone does not suppress anchor activation or remove a destination from the tab order. Core MUST NOT treat that attribute as a substitute for genuinely disabling an otherwise active link.

## Ellipsis and omitted ranges

An ellipsis may communicate that page numbers are omitted from the visible range. A passive ellipsis is not an action, receives no tab stop, and SHOULD be hidden from assistive technology when it contributes no unique meaning.

If an ellipsis opens a page chooser or menu, that trigger is a separately contracted interactive capability. Pagination MUST NOT silently turn a decorative omission marker into a popup control.

## State model

The initial contract exposes:

- `rest` — a reachable page destination is available normally.
- `hover` — pointer proximity may compress a reachable compact navigation item toward the resting surface.
- `focus-visible` — keyboard-visible focus remains explicit and independent from hover/current treatment.
- `pressed` — direct pointer/touch contact acknowledges immediately by moving the reachable item toward the surface.
- `current` — exactly one page is identified with `aria-current="page"`; by default it is not an activation target.
- `disabled` — a boundary control is unavailable and non-operable; this state MUST NOT be simulated by leaving an active anchor in place.

Loading, error, empty, selected-row, page-size, filter, sort, and result-count states belong to the paged collection or surrounding composition rather than Pagination itself.

## Interaction law: compact navigation is pressable

Unlike Breadcrumb's inline ancestor links, Pagination destinations are intentionally compact control-like navigation surfaces. Reachable items therefore follow the family pressure law: structural rest depth is visible, hover moves toward the surface, direct press reaches or approaches active compression, and release restores depth. Hover MUST NOT increase apparent elevation.

Pressure feedback belongs only to actual reachable destinations. Current, disabled, and passive ellipsis items MUST NOT manufacture hover/press behavior that implies activation.

A real anchor keeps native open-in-new-context, modifier-key, context-menu, copy-link, visited-history, and browser-navigation behavior. Tactile styling MUST NOT call `preventDefault()` or recreate navigation solely to control animation timing.

## Keyboard and touch

Pagination does not use Arrow-key roving focus. Keyboard users reach genuine links or separately justified controls in ordinary document order. Enter follows a focused anchor; Space MUST NOT be remapped to activate an ordinary link.

Current, disabled, and passive ellipsis items do not enter the tab order by default. Focus-visible treatment on reachable items MUST remain distinct from hover/current styling and MUST NOT be removed without an accessible replacement.

Compact pagination controls are standalone touch targets rather than inline prose links. Their effective target MUST meet or exceed `size.control.minimum`, including previous/next and numeric destinations. Touch receives immediate pressure feedback without depending on hover.

## RTL, localization, and long labels

Pagination uses logical layout and MUST remain usable in RTL. DOM/navigation order remains semantically coherent with the document direction; visual previous/next arrows MAY mirror when needed, but accessible “Previous” and “Next” meaning MUST NOT be inferred from arrow direction alone.

Localized previous/next labels, large page numbers, and translated accessible names must not collapse the target below the minimum hit area or create horizontal page overflow. The container may wrap when space is constrained.

## Reduced motion and forced colors

Reduced-motion mode preserves immediate press/current meaning while removing or reducing non-essential travel and release animation. Functionality, destination order, current-page semantics, and target size remain unchanged.

Forced-colors/high-contrast mode must retain a visible boundary for reachable items, explicit keyboard focus, and a non-color distinction for the current page. Disabled/unavailable items must remain distinguishable without relying only on opacity or custom color.

## Token boundary

Pagination introduces no new token contracts. It deliberately combines two already-established semantic families:

- navigation rhythm/typography through `space.navigation.gap` and `font.size.navigation`;
- compact pressable-control geometry/physics through `space.control.*`, `border.control.width`, `radius.control`, `size.control.minimum`, structural depth, press translation, press/release motion, and focus-ring roles.

Readable foreground, interactive surface, strong border, primary action surface/content, disabled opacity, body typography, and emphasis weight are existing roles. Reusing these roles is semantically honest because Pagination destinations are compact standalone controls, unlike Breadcrumb's inline text links.

Implementation expands Rivet Light scope to `core.pagination` but changes no token value. Every dependency was already resolved by earlier public-proof Core components, so the exact implemented/public dependency union remains 55 and the token-contract count remains 63.

## Web implementation

The canonical Web implementation is `packages/adapters/web/components/pagination.css`. It is intentionally CSS-only: real anchors provide native destination, focus, modifier-key, context-menu, and Enter activation behavior, so no `pagination.mjs` binder exists.

Reachable `.ns-pagination-link` items resolve the existing 44px minimum target, control padding/border/radius, structural resting depth, 2px hover compression, 5px active compression, focus ring, and press/release motion tokens. The current, unavailable, and passive ellipsis forms are non-interactive and explicitly keep `transform: none` and `transition: none`; they do not borrow tactile affordance from reachable links.

Foundry renders one labelled Pagination navigation region with a non-operable previous boundary, real page links, one non-focusable `aria-current="page"` item, a passive hidden ellipsis, and a real Next destination. Five additive Chromium cases cover semantic anatomy and exact 44px targets, native Tab/Enter behavior without roving focus, exact pressure compression only on reachable links, RTL plus long-label wrapping, and reduced-motion/forced-colors resilience. The existing 70 browser cases remain unchanged, for 75 total.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — shared pressure-not-levitation, focus-visible, touch, reduced-motion, fluid-token, and agent-readable laws apply to reachable compact pagination controls.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly lists pagination under reusable Navigation + discovery capability.
- Soft implementation knowledge: the same pinned repository's `components.html` demonstrates a labelled pagination region with previous/current/number/next items, while `src/components/navigation.css` supplies wrapping compact-control anatomy, tactile 2px resting depth, inward hover/active compression, current treatment, and disabled presentation. NeoSmartUI keeps the useful physical model while strengthening semantic defaults around real destinations, current-page self-navigation, and the existing 44px minimum target.
- Rivet provenance review: the pinned `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` tree contains no `components/ui/pagination.tsx`, so NeoSmartUI claims no Rivet Pagination implementation evidence.

## Maturity

Maturity is `public-proof`. Canonical implementation evidence remains `packages/adapters/web/components/pagination.css` with exact blob SHA `998c8776f14cf509b1833fe4f978b5aee7eaa848` and canonical proof `evidence/public/core.pagination.json`. The proof is bound to merged source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`, merged-main Quality run `34677415919`, browser artifact `10292104339`, Pages commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, Pages tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, and Pages run `34678037957`. Live verification uses the deployed native Pagination markers and canonical GitHub Pages HTTPS endpoints; no Pagination JavaScript binder or runtime mutation is introduced by proof promotion.
