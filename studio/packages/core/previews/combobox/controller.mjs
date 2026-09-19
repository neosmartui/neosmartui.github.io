const requireParts = (root) => {
  const combobox = root.querySelector('#combobox-demo');
  const input = root.querySelector('#combobox-input');
  if (!combobox || !input) throw new TypeError('core.combobox preview requires canonical root and input');
  return { combobox, input };
};
const key = (input, value) => {
  const view = input.ownerDocument.defaultView;
  input.dispatchEvent(new view.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
};
export function applyPreviewState({ root, state, helpers }) {
  const { combobox, input } = requireParts(root);
  if (state === 'open') { input.setAttribute('aria-expanded', 'true'); helpers.syncComboboxState(combobox); return; }
  if (state === 'query-filled') { input.value = 'Re'; input.dispatchEvent(new input.ownerDocument.defaultView.Event('input', { bubbles: true })); return; }
  if (state === 'highlighted') { input.setAttribute('aria-expanded', 'true'); helpers.syncComboboxState(combobox); key(input, 'ArrowDown'); return; }
  if (state === 'selected') { input.setAttribute('aria-expanded', 'true'); helpers.syncComboboxState(combobox); key(input, 'ArrowDown'); key(input, 'Enter'); return; }
  if (state === 'invalid') { input.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'disabled') { input.disabled = true; helpers.syncComboboxState(combobox); return; }
  throw new Error(`core.combobox preview cannot realize controller state ${state}`);
}
