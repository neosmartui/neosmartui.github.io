const controllers = new WeakMap();

const fail = (message) => { throw new Error(`[core.tooltip] ${message}`); };

function describedTooltip(target, explicitTooltip) {
  if (!target || target.nodeType !== 1) fail('target must be an Element');
  if (explicitTooltip) return explicitTooltip;
  const ids = (target.getAttribute('aria-describedby') || '').trim().split(/\s+/).filter(Boolean);
  for (const id of ids) {
    const candidate = target.ownerDocument.getElementById(id);
    if (candidate?.getAttribute('role') === 'tooltip') return candidate;
  }
  fail('target must reference a role="tooltip" surface through aria-describedby');
}

function validateTooltip(target, tooltip) {
  if (!tooltip || tooltip.nodeType !== 1) fail('tooltip must be an Element');
  if (tooltip.getAttribute('role') !== 'tooltip') fail('tooltip surface must expose role="tooltip"');
  if (!tooltip.id) fail('tooltip surface must have an id');
  const describedBy = new Set((target.getAttribute('aria-describedby') || '').trim().split(/\s+/).filter(Boolean));
  if (!describedBy.has(tooltip.id)) fail('target aria-describedby must include the tooltip id');
  if (tooltip.tabIndex >= 0) fail('tooltip surface must not enter the tab order');
  if (tooltip.matches('button, a[href], input, select, textarea, [contenteditable="true"]') || tooltip.querySelector('button, a[href], input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])')) {
    fail('tooltip content must remain non-interactive');
  }
}

const numericStyle = (styles, property) => {
  const value = Number.parseFloat(styles[property]);
  return Number.isFinite(value) ? value : 0;
};

export function positionTooltip(target, explicitTooltip) {
  const tooltip = describedTooltip(target, explicitTooltip);
  validateTooltip(target, tooltip);
  if (tooltip.dataset.state !== 'open') return { target, tooltip };

  const view = target.ownerDocument.defaultView;
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipStyles = view.getComputedStyle(tooltip);
  const targetStyles = view.getComputedStyle(target);
  const inlineGutter = Math.max(
    numericStyle(tooltipStyles, 'paddingInlineStart'),
    numericStyle(tooltipStyles, 'borderInlineStartWidth'),
    1
  );
  const blockGap = Math.max(
    numericStyle(tooltipStyles, 'paddingBlockStart'),
    numericStyle(tooltipStyles, 'borderBlockStartWidth'),
    1
  );

  let left = targetStyles.direction === 'rtl'
    ? targetRect.right - tooltipRect.width
    : targetRect.left;
  const maxLeft = Math.max(inlineGutter, view.innerWidth - tooltipRect.width - inlineGutter);
  left = Math.min(Math.max(left, inlineGutter), maxLeft);

  let top = targetRect.bottom + blockGap;
  const above = targetRect.top - blockGap - tooltipRect.height;
  if (top + tooltipRect.height + blockGap > view.innerHeight && above >= blockGap) top = above;
  const maxTop = Math.max(blockGap, view.innerHeight - tooltipRect.height - blockGap);
  top = Math.min(Math.max(top, blockGap), maxTop);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.right = 'auto';
  tooltip.style.bottom = 'auto';
  return { target, tooltip, left, top };
}

export function syncTooltipState(target, state = 'closed', explicitTooltip) {
  const tooltip = describedTooltip(target, explicitTooltip);
  validateTooltip(target, tooltip);
  if (!['closed', 'open', 'dismissed'].includes(state)) fail(`unsupported state ${state}`);
  tooltip.dataset.state = state;
  target.dataset.tooltipState = state;
  return { target, tooltip, state };
}

export function bindTooltip(target, options = {}) {
  if (controllers.has(target)) return controllers.get(target);
  const tooltip = describedTooltip(target, options.tooltip);
  validateTooltip(target, tooltip);

  let targetHovered = false;
  let tooltipHovered = false;
  let targetFocused = target.ownerDocument.activeElement === target;
  let dismissed = false;
  let closeTimer = null;
  const view = target.ownerDocument.defaultView;

  const clearCloseTimer = () => {
    if (closeTimer !== null) {
      view.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const setState = (state) => {
    const result = syncTooltipState(target, state, tooltip);
    if (state === 'open') positionTooltip(target, tooltip);
    return result;
  };
  const sessionActive = () => targetHovered || tooltipHovered || targetFocused;

  const reconcile = () => {
    clearCloseTimer();
    if (dismissed) {
      if (sessionActive()) setState('dismissed');
      else {
        dismissed = false;
        setState('closed');
      }
      return;
    }
    setState(sessionActive() ? 'open' : 'closed');
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = view.setTimeout(reconcile, 80);
  };

  const onTargetPointerEnter = () => {
    targetHovered = true;
    clearCloseTimer();
    reconcile();
  };
  const onTargetPointerLeave = () => {
    targetHovered = false;
    scheduleClose();
  };
  const onTooltipPointerEnter = () => {
    tooltipHovered = true;
    clearCloseTimer();
    reconcile();
  };
  const onTooltipPointerLeave = () => {
    tooltipHovered = false;
    scheduleClose();
  };
  const onTargetFocus = () => {
    targetFocused = true;
    clearCloseTimer();
    reconcile();
  };
  const onTargetBlur = () => {
    targetFocused = false;
    scheduleClose();
  };
  const onDocumentKeyDown = (event) => {
    if (event.key !== 'Escape' || tooltip.dataset.state !== 'open') return;
    dismissed = true;
    clearCloseTimer();
    setState('dismissed');
  };
  const onViewportChange = () => {
    if (tooltip.dataset.state === 'open') positionTooltip(target, tooltip);
  };

  target.addEventListener('pointerenter', onTargetPointerEnter);
  target.addEventListener('pointerleave', onTargetPointerLeave);
  target.addEventListener('focus', onTargetFocus);
  target.addEventListener('blur', onTargetBlur);
  tooltip.addEventListener('pointerenter', onTooltipPointerEnter);
  tooltip.addEventListener('pointerleave', onTooltipPointerLeave);
  target.ownerDocument.addEventListener('keydown', onDocumentKeyDown);
  view.addEventListener('resize', onViewportChange);
  view.addEventListener('scroll', onViewportChange, true);
  setState(targetFocused ? 'open' : 'closed');

  const controller = {
    target,
    tooltip,
    dismiss() {
      if (!sessionActive()) return setState('closed');
      dismissed = true;
      clearCloseTimer();
      return setState('dismissed');
    },
    sync: reconcile,
    position() {
      return positionTooltip(target, tooltip);
    },
    destroy() {
      clearCloseTimer();
      target.removeEventListener('pointerenter', onTargetPointerEnter);
      target.removeEventListener('pointerleave', onTargetPointerLeave);
      target.removeEventListener('focus', onTargetFocus);
      target.removeEventListener('blur', onTargetBlur);
      tooltip.removeEventListener('pointerenter', onTooltipPointerEnter);
      tooltip.removeEventListener('pointerleave', onTooltipPointerLeave);
      target.ownerDocument.removeEventListener('keydown', onDocumentKeyDown);
      view.removeEventListener('resize', onViewportChange);
      view.removeEventListener('scroll', onViewportChange, true);
      controllers.delete(target);
      dismissed = false;
      setState('closed');
    }
  };

  controllers.set(target, controller);
  return controller;
}
