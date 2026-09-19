const requireCheckbox = (root) => {
  const input = root.querySelector('#checkbox-demo');
  if (!input || input.type !== 'checkbox') throw new TypeError('core.checkbox preview requires #checkbox-demo');
  return input;
};
export function applyPreviewState({ root, state, helpers }) {
  const input = requireCheckbox(root);
  if (state === 'checked') { input.checked = true; input.indeterminate = false; helpers.syncCheckboxState(input); return; }
  if (state === 'invalid') { input.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'disabled') { input.disabled = true; return; }
  throw new Error(`core.checkbox preview cannot realize controller state ${state}`);
}
