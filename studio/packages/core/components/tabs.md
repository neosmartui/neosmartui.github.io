# `core.tabs`

`core.tabs` is the generic peer-panel navigation primitive. It lets one tab from a local set be selected at a time and exposes the corresponding panel without turning the interaction into route navigation or business-domain workflow.

## Semantics

- A tab set MUST expose one `role="tablist"` containing peer `role="tab"` controls.
- Each tab MUST expose accurate `aria-selected`, MUST identify its controlled panel with `aria-controls`, and its associated `role="tabpanel"` MUST reference the tab with `aria-labelledby`.
- Exactly one panel is active/visible for a valid single-select tab set unless a higher-level loading boundary temporarily withholds panel content.
- Disabled tabs MUST remain identifiable as unavailable and MUST be skipped by roving keyboard navigation.
- Tab labels and panel contents are composition; `core.tabs` owns the relationships, selection model, focus model, and tactile state feedback.

## Focus and keyboard contract

- The tablist uses roving focus: exactly one enabled tab participates in the page Tab order with `tabIndex=0`; other enabled tabs use `tabIndex=-1`.
- Horizontal sets use Left/Right according to logical inline direction. Moving toward logical inline-end selects/focuses the next enabled tab; moving toward logical inline-start selects/focuses the previous enabled tab. RTL therefore reverses the physical Left/Right mapping without reversing logical next/previous order.
- Vertical sets use Down for next and Up for previous enabled tabs.
- Home moves to the first enabled tab; End moves to the last enabled tab.
- Navigation wraps unless a future explicit variant says otherwise; disabled tabs are skipped.
- Tab does not cycle inside the tablist. It enters/leaves the composite according to normal document focus order.

## Activation modes

A tab set MUST use one explicit activation mode.

### Automatic activation

- Moving focus with the tab navigation keys also selects the focused tab and reveals its panel.
- Automatic activation is appropriate only when panel switching is immediate and does not introduce noticeable latency, destructive consequences, or remote work.

### Manual activation

- Arrow/Home/End move focus without changing the selected panel.
- Space or Enter activates the focused tab.
- Manual activation SHOULD be used when selection triggers work that is not effectively immediate.

The chosen mode MUST remain consistent within a tab set and MUST be documented by an adapter or higher-level contract.

## Tactile and selected-state law

- Unselected tab triggers may acknowledge hover/contact through the shared compression model: movement is toward the resting surface, never generic upward lift.
- Press feedback MUST begin immediately and structural shadow/depth SHOULD compress coherently with translation.
- A selected tab SHOULD feel seated/locked into its rail rather than elevated above neighboring tabs.
- Persistent selected state MUST remain distinguishable after transient press feedback ends.
- Selection styling MUST NOT increase apparent elevation as a generic reward for selection.
- Panel switching MAY use subtle state transition, but trigger motion MUST NOT imply that the tab floated upward.

## Target sizing

Each interactive tab target MUST meet or exceed `size.control.minimum` in its effective hit area. Text length and localization MUST NOT reduce the usable target or hide focus indication.

## Accessibility and resilience

- `focus-visible` MUST remain distinct from hover and selected state.
- Touch activation MUST not depend on hover.
- RTL changes horizontal physical arrow mapping and logical layout, but not selected-state meaning.
- Reduced motion MUST keep selection/focus meaning while removing non-essential travel or panel animation.
- Forced colors MUST preserve tab boundaries, current selection, disabled state, and keyboard focus without relying only on authored color.

## State contract

```text
rest
hover
focus-visible
pressed
unselected
selected
disabled
```

`selected` and `unselected` are mutually exclusive persistent tab states. `focus-visible` and `pressed` are transient and may coexist with either persistent state where platform interaction allows it.

## Composition boundary

`core.tabs` owns tablist/tab/tabpanel relationships, one-selected-panel state, composite focus/navigation, activation mode, and tactile trigger behavior. Tab labels, icons, badges, panel contents, remote data loading, routing, persistence, analytics, and business consequences belong to higher-level composition.

## Migration knowledge provenance

This contract is a clean NeoSmartUI definition informed by pinned legacy evidence; no legacy implementation code is copied.

- Family behavior: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — `COMPONENTS.md` explicitly says selected tabs SHOULD feel seated/locked into their rail rather than elevated and applies the shared keyboard/touch/reduced-motion family laws.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` lists Tabs as reusable Core and documents a keyboard-complete RTL-aware React Tabs distribution path.
- Soft implementation knowledge: the same pinned Soft snapshot contains `packages/react/src/index.js` with `Tabs`, `TabList`, `Tab`, and `TabPanel`, including roving focus, Arrow/Home/End behavior, disabled-tab skipping, RTL-aware horizontal navigation, and ARIA roles. Repository metadata declares no license evidence in the migration inventory, so this is reference-only knowledge and no source code is copied.
- No tabs-specific Rivet implementation artifact is claimed for the pinned Rivet snapshot `bb4b641d35bc77c958b7345a3b7c0a134c7d802d`; the reviewed `components/ui/` tree contains no `tabs.tsx`.

Maturity is `public-proof`: the unchanged canonical Web adapter is bound to exact merged-main Chromium evidence and the same exact-SHA GitHub Pages deployment cohort as the other public Core primitives. Structural proof validation recomputes the Tabs adapter/CSS Git blob IDs, and live verification requires the deployed source SHA plus explicit automatic/manual Tabs markers before the claim is accepted.
