const assertSelect = (select) => {
  if (!select || select.tagName !== 'SELECT' || select.multiple || select.size > 1) {
    throw new TypeError('core.select web adapter requires a real native single-select <select>.');
  }
};

export function syncSelectState(select) {
  assertSelect(select);
  select.dataset.state = 'selected';
  select.dataset.selectedValue = select.value;
  select.dataset.selectedIndex = String(select.selectedIndex);
  return { value: select.value, selectedIndex: select.selectedIndex };
}

export function bindSelect(select) {
  assertSelect(select);
  syncSelectState(select);

  const ownerWindow = select.ownerDocument.defaultView;
  const onValueChange = () => syncSelectState(select);
  const onPointerDown = () => { select.dataset.pressed = 'true'; };
  const releasePress = () => { select.dataset.pressed = 'false'; };

  select.addEventListener('input', onValueChange);
  select.addEventListener('change', onValueChange);
  select.addEventListener('pointerdown', onPointerDown);
  select.addEventListener('pointercancel', releasePress);
  select.addEventListener('blur', releasePress);
  ownerWindow?.addEventListener('pointerup', releasePress);

  return () => {
    select.removeEventListener('input', onValueChange);
    select.removeEventListener('change', onValueChange);
    select.removeEventListener('pointerdown', onPointerDown);
    select.removeEventListener('pointercancel', releasePress);
    select.removeEventListener('blur', releasePress);
    ownerWindow?.removeEventListener('pointerup', releasePress);
  };
}
