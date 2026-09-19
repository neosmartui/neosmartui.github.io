const requireTarget = (root) => {
  const target = root.querySelector('#tooltip-target');
  if (!target) throw new TypeError('core.tooltip preview requires #tooltip-target');
  return target;
};
export function applyPreviewState({ root, state, helpers }) {
  const target = requireTarget(root);
  if (state === 'open' || state === 'dismissed') { helpers.syncTooltipState(target, state); return; }
  throw new Error(`core.tooltip preview cannot realize controller state ${state}`);
}
