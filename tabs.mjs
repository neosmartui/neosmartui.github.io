const assertTabList = (tabList) => {
  if (!tabList || tabList.getAttribute('role') !== 'tablist') {
    throw new TypeError('core.tabs web adapter requires an element with role="tablist".');
  }
};

const tabsFor = (tabList) => [...tabList.querySelectorAll('[role="tab"]')];
const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true';

const panelFor = (tab) => {
  const id = tab.getAttribute('aria-controls');
  if (!id) throw new TypeError('core.tabs tabs require aria-controls.');
  const panel = tab.ownerDocument.getElementById(id);
  if (!panel || panel.getAttribute('role') !== 'tabpanel') {
    throw new TypeError(`core.tabs could not resolve role="tabpanel" for ${id}.`);
  }
  return panel;
};

const setRovingTab = (tabList, tab, { focus = false } = {}) => {
  for (const candidate of tabsFor(tabList)) candidate.tabIndex = candidate === tab && !isDisabled(candidate) ? 0 : -1;
  if (focus) tab.focus();
};

export function selectTab(tabList, tab, { moveFocus = false } = {}) {
  assertTabList(tabList);
  if (!tab || !tabList.contains(tab) || tab.getAttribute('role') !== 'tab' || isDisabled(tab)) {
    throw new TypeError('core.tabs selection requires an enabled tab owned by the tablist.');
  }

  for (const candidate of tabsFor(tabList)) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
    candidate.dataset.state = selected ? 'selected' : 'unselected';
    const panel = panelFor(candidate);
    panel.hidden = !selected;
    panel.dataset.state = selected ? 'active' : 'inactive';
  }

  if (moveFocus) setRovingTab(tabList, tab, { focus: true });
  return tab;
}

export function bindTabs(tabList, { activation = tabList?.dataset.activation || 'automatic' } = {}) {
  assertTabList(tabList);
  if (!['automatic', 'manual'].includes(activation)) throw new TypeError('core.tabs activation must be automatic or manual.');

  const tabs = tabsFor(tabList);
  const enabled = tabs.filter((tab) => !isDisabled(tab));
  if (!enabled.length) throw new TypeError('core.tabs requires at least one enabled tab.');

  tabList.dataset.activation = activation;
  if (!tabList.hasAttribute('aria-orientation')) tabList.setAttribute('aria-orientation', 'horizontal');

  for (const tab of tabs) {
    if (!tab.id) throw new TypeError('core.tabs tabs require stable ids.');
    const panel = panelFor(tab);
    if (panel.getAttribute('aria-labelledby') !== tab.id) throw new TypeError(`core.tabs panel ${panel.id} must aria-labelledby ${tab.id}.`);
  }

  let selected = enabled.find((tab) => tab.getAttribute('aria-selected') === 'true') || enabled[0];
  selectTab(tabList, selected);
  setRovingTab(tabList, selected);

  const clickHandlers = new Map();
  for (const tab of tabs) {
    const onClick = () => {
      if (isDisabled(tab)) return;
      selected = tab;
      selectTab(tabList, tab);
      setRovingTab(tabList, tab);
    };
    tab.addEventListener('click', onClick);
    clickHandlers.set(tab, onClick);
  }

  const onKeyDown = (event) => {
    const current = event.target.closest?.('[role="tab"]');
    if (!current || !tabList.contains(current) || isDisabled(current)) return;

    const available = tabsFor(tabList).filter((tab) => !isDisabled(tab));
    const index = available.indexOf(current);
    if (index < 0) return;

    const orientation = tabList.getAttribute('aria-orientation') || 'horizontal';
    const dir = tabList.closest('[dir]')?.dir || tabList.ownerDocument.documentElement.dir || 'ltr';
    const nextKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const previousKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let target = null;

    if (event.key === 'Home') target = available[0];
    else if (event.key === 'End') target = available[available.length - 1];
    else if (orientation === 'vertical' && event.key === 'ArrowDown') target = available[(index + 1) % available.length];
    else if (orientation === 'vertical' && event.key === 'ArrowUp') target = available[(index - 1 + available.length) % available.length];
    else if (orientation === 'horizontal' && event.key === nextKey) target = available[(index + 1) % available.length];
    else if (orientation === 'horizontal' && event.key === previousKey) target = available[(index - 1 + available.length) % available.length];
    else if (activation === 'manual' && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      selected = current;
      selectTab(tabList, current);
      setRovingTab(tabList, current);
      return;
    } else return;

    event.preventDefault();
    setRovingTab(tabList, target, { focus: true });
    if (activation === 'automatic') {
      selected = target;
      selectTab(tabList, target);
      setRovingTab(tabList, target, { focus: true });
    }
  };

  tabList.addEventListener('keydown', onKeyDown);
  return () => {
    tabList.removeEventListener('keydown', onKeyDown);
    for (const [tab, handler] of clickHandlers) tab.removeEventListener('click', handler);
  };
}
