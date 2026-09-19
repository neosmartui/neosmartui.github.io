const requireSwitch = (root) => {
  const input = root.querySelector('#switch-demo');
  if (!input || input.type !== 'checkbox') throw new TypeError('core.switch preview requires #switch-demo');
  return input;
};
export function applyPreviewState({ root, state, helpers }) {
  const input = requireSwitch(root);
  if (state === 'on') { input.checked = true; helpers.syncSwitchState(input); return; }
  if (state === 'invalid') { input.setAttribute('aria-invalid', 'true'); return; }
  if (state === 'disabled') { input.disabled = true; return; }
  throw new Error(`core.switch preview cannot realize controller state ${state}`);
}
