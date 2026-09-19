# `core.alert`

`core.alert` is NeoSmartUI's prominent inline message/callout primitive. It groups explanatory, informational, success, warning, or error content without importing business meaning and without assuming that every visually emphasized message is urgent, interactive, or newly announced.

## Semantic boundary

The default Alert is not a live region. A static callout that is already present in the document is ordinary content and MUST NOT receive `role="alert"`, `role="status"`, `aria-live`, or a tab stop merely because its visual treatment is prominent.

`role="alert"` is not a visual variant. It represents an assertive announcement contract for important, time-sensitive content that is dynamically introduced or changed. Composition may opt into that semantic only when the message actually needs immediate assistive-technology announcement. A non-urgent dynamic update may instead use an appropriate status/live-region pattern owned by composition; Core does not guess announcement urgency from color.

A neutral semantic host such as `div`, `section`, or another document-appropriate container is selected by composition. A title may be ordinary strong text or an appropriate heading chosen from the surrounding document hierarchy; Core MUST NOT invent a heading level.

The Alert itself is not an action. Core MUST NOT make the whole surface clickable, focusable, dismissible, selectable, or navigational by attaching `tabindex`, `role="button"`, click handlers, or keyboard activation. A dismiss action is a separate button with its own accessible name, target size, focus, disabled behavior, and pressure feedback.

The canonical Web implementation is intentionally CSS-only. It does not install pointer, click, keyboard, live-region, dismissal, timer, or state-synchronization listeners and does not need a JavaScript binder merely to qualify as implemented.

## State and tone model

The initial contract exposes:

- `rest` — the Alert surface has no interaction state.
- `neutral` — prominent explanatory content without a semantic status tone.
- `info` — informational message treatment.
- `success` — positive/completed message treatment.
- `warning` — caution/attention message treatment.
- `error` — failure/error message treatment.

These are presentation/message classifications, not hover, focus, pressed, open, closed, dismissed, or timeout states. Visibility lifecycle, auto-removal, persistence, stacking, and toast behavior belong to a controller/composition rather than this static Core surface.

Tone MUST NOT be the sole carrier of meaning. Message text, accessible naming, an appropriate visible label, or another non-color cue must communicate the purpose when custom colors are unavailable or indistinguishable.

The canonical implementation keeps the readable panel surface constant across tones and uses the semantic tone as the structural border. This preserves the existing high-contrast text model, avoids inventing a second foreground-token matrix, and keeps visible text—not color—the authoritative meaning channel.

## Interaction law: message surfaces remain stable

A static Alert is informational, not pressable. It MUST NOT translate, lift, compress, deepen its shadow, show a pointer cursor, or manufacture focus-visible styling on hover or direct contact. Structural resting depth may describe the surface, but that depth remains unchanged by pointer proximity and touch.

The canonical CSS has no hover/active/focus interaction selectors, sets `transform: none` and `transition: none`, and keeps the same structural resting shadow through hover and direct pointer contact.

Nested controls remain independent controls. If an Alert contains a link, retry button, details disclosure, or dismiss button, only those actual controls receive their own interaction semantics and tactile feedback. The Alert container MUST NOT borrow control pressure tokens to make the surrounding message feel clickable.

## Anatomy and content

Common anatomy may include an optional icon, title, description/body, and an action area. These names describe composition slots rather than automatic accessibility roles.

A decorative icon that repeats the written tone/message should be hidden from assistive technology. An icon that carries unique meaning requires an accessible text equivalent. Icon presence is optional and MUST NOT be required to understand the Alert.

The canonical Foundry examples deliberately need no icon: explicit tone words in the title make neutral/info/success/warning/error meaning readable without color. `.ns-alert-title` uses strong typography while `.ns-alert-body` uses the existing secondary readable foreground.

Alert content may contain multiple sentences, lists, links, or controls when the message requires them. Core MUST NOT force one-line truncation or a fixed height that hides essential localized or validation content. The canonical CSS uses logical padding and `overflow-wrap: anywhere` so long localized content can reflow rather than forcing horizontal overflow.

## Dismissal, timing, and async updates

Core Alert does not own dismissal state, auto-dismiss timers, countdown progress, persistence, queuing, stacking, or notification history. Those behaviors materially affect focus, announcement, interruption, and recovery and require explicit higher-level contracts.

If composition adds a dismiss control, removing the message MUST NOT strand keyboard focus or silently remove information a user still needs. If content changes asynchronously, composition—not visual tone—chooses whether and how that update is announced.

## Keyboard and touch

The Alert container itself does not enter the tab order and has no keyboard activation model. Keyboard navigation reaches any nested interactive descendants in normal document order.

Touching the non-interactive surface performs no action and receives no fake pressed response. Nested controls retain their own minimum target and touch behavior.

## RTL, localization, and long content

Alert layout uses logical inline/block geometry and inherits text direction from composition. Optional icon/content/action placement must remain coherent in RTL without reversing semantic tone meaning.

Long titles, descriptions, identifiers, translated strings, mixed-direction text, and nested content must wrap without forcing horizontal overflow or silently clipping essential message meaning.

## Reduced motion and forced colors

The static Alert has no state-driven travel to suppress, so reduced-motion mode preserves the same stable surface. A future controller that animates insertion/removal owns reduced-motion behavior for that lifecycle.

Forced-colors/high-contrast rendering preserves readable system text and a perceivable message boundary. The canonical CSS resolves the panel to `Canvas`, text to `CanvasText`, removes non-essential structural shadow, and keeps the border visible. Tone meaning cannot disappear when custom backgrounds or status colors are overridden because non-color content remains authoritative.

## Token boundary

Alert is a grouped message surface, not a control and not a compact Badge. It therefore reuses existing generic surface roles (`space.surface.*`, `border.surface.width`, `radius.surface`, resting depth) and semantic state colors rather than inventing Alert-specific geometry or borrowing `space.control.*`, `border.control.width`, `radius.control`, press translation, hover/active depth, focus-ring, target-size, or annotation-pill roles.

The implementation introduces no new token contracts and no new Rivet Light values. Theme scope expands to `core.alert`, but every dependency was already present in the exact resolved-token union. Existing values remain unchanged: 1rem logical surface padding, 3px surface border, 6px surface radius, 5px resting depth, the established panel/content colors, strong weight 800, and the existing info/success/warning/error semantic colors.

## Migration knowledge provenance

This contract and implementation are clean NeoSmartUI definitions informed by pinned legacy evidence; no legacy implementation code is copied.

- Family conformance: `NeoBrutalism-shop/spec@fbf499397f4e9a52d6e25c13921fd5377799c626` — shared laws provide semantic-token/state documentation, accessibility, RTL, reduced-motion, forced-colors, and the rule that static informational surfaces do not mimic interactive hover/press behavior.
- Soft capability evidence: `NeoBrutalism-shop/NeoBrutal-Soft@dfed77bd159ac5c38081f7a4ca5c2229b61ffb8a` — `COMPONENTS.md` explicitly classifies alerts as Core. `registry/default/alert/alert.tsx` uses generic tone variants and applies `role="alert"` only to its danger tone, which is useful evidence that visual Alert treatment and announcement semantics are separable; NeoSmartUI makes that separation explicit rather than inferring urgency from tone.
- Soft visual knowledge: the same pinned repository's `src/components/alert.css` provides reference-only evidence for a stable grouped message surface with icon/title/body anatomy and info/success/warning/danger treatments. No source code is copied.
- Rivet implementation knowledge: `NeoBrutalRivet/NeoBrutal-Rivet@bb4b641d35bc77c958b7345a3b7c0a134c7d802d` — `components/ui/alert.tsx` provides generic Alert/title/description anatomy and default/destructive presentation knowledge. Its unconditional `role="alert"` is not adopted as a Core default because announcement urgency is a semantic decision, not a visual-style decision. Repository metadata declares no license, so this remains reference-only knowledge.

## Maturity

Maturity is `public-proof`. The canonical CSS-only Web implementation is bound through `evidence/public/core.alert.json` and exact blob SHA `8d4e4aafae799a347a4d02e19e8eadfe139ca979` to merged-main Quality run `34677415919` and artifact `10292104339`. That exact artifact is published byte-for-byte to native GitHub Pages at deployment commit `bbd5696b4b0e24ab1fd4d5c8c0b6e462608667fa`, tree `dd1bdf23838ffe5f79d6085b0d0544f5f03adff4`, Pages run `34678037957`, with live deployment source `f4fdf3fbf3924b1598e1ee5be4dda22edcbf73e6`.
