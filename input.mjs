const supportedTypes = new Set(['text', 'email', 'password', 'search', 'tel', 'url']);

const assertInput = (input) => {
  if (!input || input.tagName !== 'INPUT' || !supportedTypes.has(input.type)) {
    throw new TypeError('core.input web adapter requires a real text-like <input>.');
  }
};

export function syncInputState(input) {
  assertInput(input);
  const state = input.value.length === 0 ? 'empty' : 'filled';
  input.dataset.state = state;
  return state;
}

export function bindInput(input) {
  assertInput(input);
  syncInputState(input);
  const onValueChange = () => syncInputState(input);
  input.addEventListener('input', onValueChange);
  input.addEventListener('change', onValueChange);
  return () => {
    input.removeEventListener('input', onValueChange);
    input.removeEventListener('change', onValueChange);
  };
}
