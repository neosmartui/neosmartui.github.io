# `core.badge`

`core.badge` is NeoSmartUI's compact informational metadata/status primitive. It can label a category, state, count, or concise condition without importing business meaning and without becoming an action merely because it looks prominent.

## Semantic boundary

The default Badge is non-interactive. The default `span` host is appropriate when the Badge is only visible metadata. Core MUST NOT add `tabindex`, `role="button"`, click handlers, keyboard activation, or link semantics to a Badge just to make a pill-shaped element feel interactive.

If the compact label truly navigates or performs an action, composition must use a real link/button semantic or a separately contracted interactive capability. Styling an `<a>` or `<button>` to resemble a Badge does not change the fact that the link/button component owns activation, focus, disabled behavior, and pressure physics.

`role="status"` is also NOT the Badge default. ARIA `status` creates a live region intended for meaningful dynamic updates; static text such as `Active`, `Beta`, or `3 items` must not be announced as a live region merely because it is visually a status badge. Composition may opt into appropriate live-region semantics when an actual asynchronous status change needs announcement.

The canonical Web implementation is intentionally CSS-only. It does not install pointer, click, keyboard, live-region, or state-synchronization listeners and does not need a JavaScript binder merely to qualify as implemented.

## State and tone model

The initial contract exposes:

- `rest` — the Badge itself has no interaction state.
- `neutral` — ordinary metadata/category treatment.
- `info` — informational status tone.
- `success` — positive/completed status tone.
- `warning` — caution/attention status tone.
- `error` — failure/error status tone.

The tone states are semantic presentation classifications, not hover/press states. They are mutually exclusive for one Badge instance unless a higher-level composition explicitly defines another model.

Tone MUST NOT be the sole carrier of meaning. Text, accessible naming, or another non-color cue must make the status understandable when color perception or custom colors are unavailable.

## Interaction law: informational means motionless

The Badge itself is not pressable. It MUST NOT translate, compress, lift, deepen its shadow, show a pointer cursor, or manufacture focus-visible treatment on hover/contact. Reduced motion therefore has no Badge-specific travel to suppress.

Pinned Rivet implementation knowledge reinforces this semantic split: the ordinary Badge host is a `span`, while hover rules in that legacy artifact are explicitly conditional on an anchor host. NeoSmartUI preserves the lesson, not the source code: interaction belongs to the actual semantic host, not to the visual Badge shape.

## Content and icon rules

Badge content should remain compact, but compact does not mean cryptic. Short localized text, numbers, and optional icons are allowed. A decorative icon that merely repeats adjacent text should be hidden from assistive technology; an icon carrying unique meaning requires an accessible text equivalent.

Counts must preserve their actual semantic meaning. Composition may abbreviate visually only when the accessible name/value still communicates the intended quantity. Core does not own notification counting, unread logic, or business-state calculation.

## Keyboard and touch

A non-interactive Badge does not enter the tab order and has no keyboard activation model. Touch contact on the Badge alone performs no action and receives no fake pressed response.

When a Badge is composed inside or alongside a real interactive control, that control owns target size, focus indication, activation, and tactile feedback. The Badge must not create a second nested interaction target accidentally.

## RTL, localization, and long content

Layout uses logical inline/block geometry. Direction is inherited from content/composition. Badge text and optional leading/trailing content remain understandable under RTL and mixed-direction text.

The canonical CSS does not silently truncate essential status text. Long localized labels may wrap instead of overflowing a constrained container, and Core avoids fixed physical-width assumptions that would make translated status meaning inaccessible.

## Forced colors and contrast

Forced-colors/high-contrast rendering keeps text readable and preserves a perceivable Badge boundary when Theme background/tone colors are overridden. Semantic status meaning cannot disappear when custom color is unavailable.

Status foreground/background pairings are mode-independent and follow the shipping adapter exactly. Neutral, info, success, and warning use `color.content.primary`; neutral sits on `color.surface.panel`, while info/success/warning sit on their corresponding `color.state.*` surfaces. Error uses `color.content.inverse` on `color.state.error`. Every concrete resolved Theme that includes `core.badge` MUST keep each of those authored text pairings at or above `4.5:1`.

## Token boundary

A Badge is neither an ordinary pressable control nor a grouped Card surface. It MUST NOT borrow `space.control.*`, `border.control.width`, `radius.control`, `space.surface.*`, `border.surface.width`, or `radius.surface` merely because those values are already resolved.

Badge owns compact annotation roles instead:

- `space.annotation.inline`
- `space.annotation.block`
- `border.annotation.width`
- `radius.annotation`

Rivet Light resolves those geometry roles from pinned Badge knowledge at `0.55rem` inline padding, `0.15rem` block padding, a `2px` annotation border, and a `999px` pill radius. Concrete status colors are Theme-owned values resolved in each `packages/themes/*/tokens.json` bundle; they may be re-ratified when necessary to preserve the shared Badge foreground contract and authored contrast. Legacy Soft/Rivet palette values remain migration knowledge only and are not current Theme authority. `color.content.inverse` remains the error-foreground role defined by the shared adapter.

## Migration knowledge provenance

This contract and implementation are clean NeoSmartUI definitions informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — shared laws prohibit generic hover lift, require semantic-token/state documentation, and explicitly require static surfaces not to mimic interactive motion. Badge applies those family laws as a non-interactive primitive.
- Soft capability and value evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` lists `Badge/status`; `src/components/badge.css` and `src/tokens.css` provide compact pill geometry and light status-palette migration knowledge. NeoSmartUI re-expresses that knowledge through its own semantic contracts and Theme-owned resolved values rather than copying source.
- Rivet implementation knowledge: `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` — `components/ui/badge.tsx` uses a neutral `span` host by default, pill geometry, and scopes hover styling to anchor-host usage; its destructive variant uses a white foreground. Repository metadata declares no license, so this is reference-only knowledge and no source code is copied.

## Maturity

Maturity is `public-proof`. The canonical CSS-only Web implementation remains bound by exact blob SHA `199f963cb712828c42e9b1ea9432e69feb02c001` to the current singleton cohort: merged-main Quality run `34677415919`, artifact `10292104339`, deployment commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, Pages run `34678037957`, and live deployment source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`.
