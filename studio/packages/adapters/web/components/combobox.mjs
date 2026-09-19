const controllers = new WeakMap();

const isDisabledOption = (option) => option.getAttribute('aria-disabled') === 'true';
const isVisibleOption = (option) => !option.hidden;

const assertCombobox = (root) => {
  if (!root || !(root instanceof root.ownerDocument.defaultView.HTMLElement)) {
    throw new TypeError('core.combobox web adapter requires a real HTMLElement root.');
  }

  const input = root.querySelector('[role="combobox"]');
  if (!input || input.tagName !== 'INPUT') {
    throw new TypeError('core.combobox requires a real <input role="combobox">.');
  }
  if (!['list', 'both'].includes(input.getAttribute('aria-autocomplete'))) {
    throw new TypeError('core.combobox requires aria-autocomplete="list" or "both".');
  }
  const listId = input.getAttribute('aria-controls');
  if (!listId) throw new TypeError('core.combobox input requires aria-controls.');
  const list = root.ownerDocument.getElementById(listId);
  if (!list || !root.contains(list) || list.getAttribute('role') !== 'listbox') {
    throw new TypeError('core.combobox aria-controls must resolve to an owned role="listbox".');
  }
  const popup = list.closest('.ns-combobox-popup');
  if (!popup || !root.contains(popup)) throw new TypeError('core.combobox listbox requires an owned popup surface.');
  const options = [...list.querySelectorAll('[role="option"]')];
  if (!options.length) throw new TypeError('core.combobox requires at least one role="option" suggestion.');
  for (const option of options) {
    if (!option.id) throw new TypeError('core.combobox options require stable ids.');
    if (option.getAttribute('aria-selected') !== 'true' && option.getAttribute('aria-selected') !== 'false') {
      throw new TypeError('core.combobox options require boolean aria-selected state.');
    }
    if (!option.hasAttribute('data-value')) throw new TypeError('core.combobox options require data-value.');
  }
  const selected = options.filter((option) => option.getAttribute('aria-selected') === 'true');
  if (selected.length > 1) throw new TypeError('core.combobox single-selection contract allows at most one selected option.');

  const trigger = root.querySelector('.ns-combobox-trigger');
  if (trigger && (trigger.tagName !== 'BUTTON' || trigger.type !== 'button')) {
    throw new TypeError('core.combobox disclosure trigger must be a real <button type="button">.');
  }
  const empty = root.querySelector('.ns-combobox-empty');
  return { input, list, popup, options, trigger, empty };
};

const normalize = (value) => value.toLocaleLowerCase().trim();
const optionValue = (option) => option.dataset.value ?? option.textContent?.trim() ?? '';

const setExpanded = ({ root, input, popup, trigger }, expanded) => {
  root.dataset.state = expanded ? 'open' : 'closed';
  input.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (trigger) trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  popup.hidden = !expanded;
};

const clearActive = ({ root, input, options }) => {
  input.removeAttribute('aria-activedescendant');
  root.dataset.activeValue = '';
  for (const option of options) option.dataset.active = 'false';
};

const setActive = (parts, option) => {
  clearActive(parts);
  if (!option) return null;
  option.dataset.active = 'true';
  parts.input.setAttribute('aria-activedescendant', option.id);
  parts.root.dataset.activeValue = optionValue(option);
  option.scrollIntoView({ block: 'nearest' });
  return option;
};

const enabledVisibleOptions = ({ options }) => options.filter((option) => isVisibleOption(option) && !isDisabledOption(option));

const selectedOption = ({ options }) => options.find((option) => option.getAttribute('aria-selected') === 'true') ?? null;

const syncSelectedMetadata = (parts) => {
  const selected = selectedOption(parts);
  parts.root.dataset.selectedValue = selected ? optionValue(selected) : '';
  parts.root.dataset.selectionState = selected ? 'selected' : 'unselected';
};

const filterOptions = (parts) => {
  const query = normalize(parts.input.value);
  parts.root.dataset.queryState = query ? 'query-filled' : 'query-empty';
  for (const option of parts.options) {
    const searchText = normalize(`${optionValue(option)} ${option.textContent || ''}`);
    option.hidden = Boolean(query) && !searchText.includes(query);
  }
  const visible = parts.options.filter(isVisibleOption);
  if (parts.empty) parts.empty.hidden = visible.length !== 0;
  const activeId = parts.input.getAttribute('aria-activedescendant');
  if (activeId && !enabledVisibleOptions(parts).some((option) => option.id === activeId)) clearActive(parts);
  return visible;
};

export function syncComboboxState(root) {
  const parts = { root, ...assertCombobox(root) };
  if (!['true', 'false'].includes(parts.input.getAttribute('aria-expanded'))) {
    parts.input.setAttribute('aria-expanded', parts.popup.hidden ? 'false' : 'true');
  }
  const expanded = parts.input.getAttribute('aria-expanded') === 'true';
  setExpanded(parts, expanded && !parts.input.disabled);
  filterOptions(parts);
  syncSelectedMetadata(parts);
  if (!expanded || parts.input.disabled) clearActive(parts);
  if (parts.trigger) parts.trigger.disabled = parts.input.disabled;
  return {
    expanded: parts.input.getAttribute('aria-expanded') === 'true',
    query: parts.input.value,
    selectedValue: parts.root.dataset.selectedValue || '',
    activeValue: parts.root.dataset.activeValue || ''
  };
}

export function selectComboboxOption(root, option, { close = true } = {}) {
  const parts = { root, ...assertCombobox(root) };
  if (!option || !parts.list.contains(option) || option.getAttribute('role') !== 'option' || isDisabledOption(option) || option.hidden) {
    throw new TypeError('core.combobox selection requires an enabled visible owned option.');
  }

  for (const candidate of parts.options) candidate.setAttribute('aria-selected', candidate === option ? 'true' : 'false');
  const value = optionValue(option);
  parts.input.value = value;
  parts.root.dataset.queryState = value ? 'query-filled' : 'query-empty';
  syncSelectedMetadata(parts);
  clearActive(parts);
  if (close) setExpanded(parts, false);
  return option;
}

export function bindCombobox(root) {
  const parts = { root, ...assertCombobox(root) };
  controllers.get(root)?.();

  parts.input.setAttribute('aria-expanded', parts.popup.hidden ? 'false' : 'true');
  syncComboboxState(root);

  const open = ({ active = false } = {}) => {
    if (parts.input.disabled) return;
    filterOptions(parts);
    setExpanded(parts, true);
    if (active) setActive(parts, enabledVisibleOptions(parts)[0] ?? null);
  };

  const close = () => {
    setExpanded(parts, false);
    clearActive(parts);
  };

  const moveActive = (direction) => {
    const available = enabledVisibleOptions(parts);
    if (!available.length) {
      clearActive(parts);
      return;
    }
    const activeId = parts.input.getAttribute('aria-activedescendant');
    const currentIndex = available.findIndex((option) => option.id === activeId);
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : available.length - 1)
      : (currentIndex + direction + available.length) % available.length;
    setActive(parts, available[nextIndex]);
  };

  const reconcileTypedSelection = () => {
    const selected = selectedOption(parts);
    if (selected && parts.input.value !== optionValue(selected)) {
      selected.setAttribute('aria-selected', 'false');
      syncSelectedMetadata(parts);
    }
  };

  const onInput = () => {
    reconcileTypedSelection();
    filterOptions(parts);
    if (!parts.input.disabled) setExpanded(parts, true);
  };

  const onFocus = () => open();

  const onKeyDown = (event) => {
    if (parts.input.disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (parts.input.getAttribute('aria-expanded') !== 'true') open();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (parts.input.getAttribute('aria-expanded') !== 'true') open();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      const activeId = parts.input.getAttribute('aria-activedescendant');
      const active = activeId ? parts.options.find((option) => option.id === activeId) : null;
      if (!active || parts.input.getAttribute('aria-expanded') !== 'true') return;
      event.preventDefault();
      selectComboboxOption(root, active);
      return;
    }
    if (event.key === 'Escape' && parts.input.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      close();
    }
  };

  const onRootFocusOut = (event) => {
    const next = event.relatedTarget;
    if (!next || !root.contains(next)) close();
  };

  const optionHandlers = new Map();
  for (const option of parts.options) {
    const onPointerMove = () => {
      if (!isDisabledOption(option) && !option.hidden) setActive(parts, option);
    };
    const onClick = () => {
      if (isDisabledOption(option) || option.hidden) return;
      selectComboboxOption(root, option);
      parts.input.focus();
    };
    option.addEventListener('pointermove', onPointerMove);
    option.addEventListener('click', onClick);
    optionHandlers.set(option, { onPointerMove, onClick });
  }

  let releaseTrigger = null;
  const onTriggerClick = parts.trigger ? () => {
    const expanded = parts.input.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      close();
      return;
    }
    open({ active: true });
    parts.input.focus();
  } : null;
  const onTriggerPointerDown = parts.trigger ? () => { parts.trigger.dataset.pressed = 'true'; } : null;
  const releasePressed = parts.trigger ? () => { parts.trigger.dataset.pressed = 'false'; } : null;
  if (parts.trigger) {
    parts.trigger.addEventListener('click', onTriggerClick);
    parts.trigger.addEventListener('pointerdown', onTriggerPointerDown);
    parts.trigger.addEventListener('pointercancel', releasePressed);
    parts.trigger.addEventListener('blur', releasePressed);
    parts.input.ownerDocument.defaultView?.addEventListener('pointerup', releasePressed);
    releaseTrigger = () => parts.input.ownerDocument.defaultView?.removeEventListener('pointerup', releasePressed);
  }

  parts.input.addEventListener('input', onInput);
  parts.input.addEventListener('focus', onFocus);
  parts.input.addEventListener('keydown', onKeyDown);
  root.addEventListener('focusout', onRootFocusOut);

  const dispose = () => {
    parts.input.removeEventListener('input', onInput);
    parts.input.removeEventListener('focus', onFocus);
    parts.input.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('focusout', onRootFocusOut);
    for (const [option, handlers] of optionHandlers) {
      option.removeEventListener('pointermove', handlers.onPointerMove);
      option.removeEventListener('click', handlers.onClick);
    }
    if (parts.trigger) {
      parts.trigger.removeEventListener('click', onTriggerClick);
      parts.trigger.removeEventListener('pointerdown', onTriggerPointerDown);
      parts.trigger.removeEventListener('pointercancel', releasePressed);
      parts.trigger.removeEventListener('blur', releasePressed);
      releaseTrigger?.();
    }
    if (controllers.get(root) === dispose) controllers.delete(root);
  };

  controllers.set(root, dispose);
  return dispose;
}
