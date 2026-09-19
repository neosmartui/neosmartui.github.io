const requireInput = (root) => {
  const input = root.querySelector('#input-demo');
  if (!input || input.tagName !== 'INPUT') throw new TypeError('core.input preview requires #input-demo');
  return input;
};
export function applyPreviewState({ root, state, helpers }) {
  const input = requireInput(root);
  if (state === 'filled') { input.value = 'Preview value'; helpers.syncInputState(input); return; }
  if (state === 'invalid') { input.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'read-only') { input.readOnly = true; return; }
  if (state === 'disabled') { input.disabled = true; return; }
  throw new Error(`core.input preview cannot realize controller state ${state}`);
}
