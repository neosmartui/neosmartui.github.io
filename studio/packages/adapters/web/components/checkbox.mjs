const assertCheckbox = (checkbox) => {
  if (!checkbox || checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
    throw new TypeError('core.checkbox web adapter requires a real <input type="checkbox">.');
  }
};

export function syncCheckboxState(checkbox) {
  assertCheckbox(checkbox);
  const state = checkbox.indeterminate ? 'indeterminate' : checkbox.checked ? 'checked' : 'unchecked';
  checkbox.dataset.state = state;
  return state;
}

export function setCheckboxIndeterminate(checkbox, indeterminate) {
  assertCheckbox(checkbox);
  checkbox.indeterminate = Boolean(indeterminate);
  syncCheckboxState(checkbox);
  return checkbox.indeterminate;
}

export function bindCheckbox(checkbox, { indeterminate = checkbox?.indeterminate ?? false } = {}) {
  assertCheckbox(checkbox);
  setCheckboxIndeterminate(checkbox, indeterminate);
  const onChange = () => syncCheckboxState(checkbox);
  checkbox.addEventListener('change', onChange);
  return () => checkbox.removeEventListener('change', onChange);
}
