const assertTextarea = (textarea) => {
  if (!textarea || textarea.tagName !== 'TEXTAREA') {
    throw new TypeError('core.textarea web adapter requires a real <textarea>.');
  }
};

export function syncTextareaState(textarea) {
  assertTextarea(textarea);
  const state = textarea.value.length === 0 ? 'empty' : 'filled';
  textarea.dataset.state = state;
  return state;
}

export function bindTextarea(textarea) {
  assertTextarea(textarea);
  syncTextareaState(textarea);
  const onValueChange = () => syncTextareaState(textarea);
  textarea.addEventListener('input', onValueChange);
  textarea.addEventListener('change', onValueChange);
  return () => {
    textarea.removeEventListener('input', onValueChange);
    textarea.removeEventListener('change', onValueChange);
  };
}
