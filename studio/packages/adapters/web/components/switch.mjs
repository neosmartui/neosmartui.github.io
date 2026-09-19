const assertSwitch = (switchInput) => {
  if (!switchInput || switchInput.tagName !== 'INPUT' || switchInput.type !== 'checkbox') {
    throw new TypeError('core.switch web adapter requires a real <input type="checkbox"> base.');
  }
};

export function syncSwitchState(switchInput) {
  assertSwitch(switchInput);
  switchInput.setAttribute('role', 'switch');
  if (switchInput.indeterminate) switchInput.indeterminate = false;
  const state = switchInput.checked ? 'on' : 'off';
  switchInput.dataset.state = state;
  return state;
}

export function bindSwitch(switchInput) {
  assertSwitch(switchInput);
  syncSwitchState(switchInput);
  const onChange = () => syncSwitchState(switchInput);
  switchInput.addEventListener('change', onChange);
  return () => switchInput.removeEventListener('change', onChange);
}
