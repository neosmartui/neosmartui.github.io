const requireSelect = (root) => {
  const select = root.querySelector('#select-demo');
  if (!select || select.tagName !== 'SELECT') throw new TypeError('core.select preview requires #select-demo');
  return select;
};
export function applyPreviewState({ root, state }) {
  const select = requireSelect(root);
  if (state === 'invalid') { select.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'disabled') { select.disabled = true; return; }
  throw new Error(`core.select preview cannot realize controller state ${state}`);
}
