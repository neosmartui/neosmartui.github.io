const requireTextarea = (root) => {
  const textarea = root.querySelector('#textarea-demo');
  if (!textarea || textarea.tagName !== 'TEXTAREA') throw new TypeError('core.textarea preview requires #textarea-demo');
  return textarea;
};
export function applyPreviewState({ root, state, helpers }) {
  const textarea = requireTextarea(root);
  if (state === 'filled') { textarea.value = 'Preview value'; helpers.syncTextareaState(textarea); return; }
  if (state === 'invalid') { textarea.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'read-only') { textarea.readOnly = true; return; }
  if (state === 'disabled') { textarea.disabled = true; return; }
  throw new Error(`core.textarea preview cannot realize controller state ${state}`);
}
