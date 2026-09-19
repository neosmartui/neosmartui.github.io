const requireRadio = (root) => {
  const radio = root.querySelector('#radio-beta');
  if (!radio || radio.type !== 'radio') throw new TypeError('core.radio preview requires #radio-beta');
  return radio;
};
export function applyPreviewState({ root, state }) {
  const radio = requireRadio(root);
  if (state === 'invalid') { radio.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'disabled') { radio.disabled = true; return; }
  throw new Error(`core.radio preview cannot realize controller state ${state}`);
}
