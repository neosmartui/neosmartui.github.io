const controllers = new WeakMap();

const assertAccordion = (root) => {
  if (!(root instanceof Element) || !root.classList.contains('ns-accordion')) {
    throw new TypeError('core.accordion web adapter requires an .ns-accordion root.');
  }
};

const triggersFor = (root) => [...root.querySelectorAll('.ns-accordion-trigger')].filter((trigger) => trigger.closest('.ns-accordion') === root);
const isDisabled = (trigger) => trigger.disabled;

const panelFor = (root, trigger) => {
  const id = trigger.getAttribute('aria-controls');
  if (!id) throw new TypeError('core.accordion triggers require aria-controls.');
  const panel = trigger.ownerDocument.getElementById(id);
  if (!panel || !root.contains(panel) || !panel.classList.contains('ns-accordion-panel')) {
    throw new TypeError(`core.accordion could not resolve controlled panel ${id}.`);
  }
  return panel;
};

const validateTrigger = (root, trigger) => {
  if (trigger.tagName !== 'BUTTON' || trigger.type !== 'button') {
    throw new TypeError('core.accordion triggers must be real <button type="button"> controls.');
  }
  if (!trigger.id) throw new TypeError('core.accordion triggers require stable ids.');
  const expanded = trigger.getAttribute('aria-expanded');
  if (!['true', 'false'].includes(expanded)) throw new TypeError('core.accordion triggers require boolean aria-expanded.');
  const panel = panelFor(root, trigger);
  if (panel.getAttribute('aria-labelledby') !== trigger.id) {
    throw new TypeError(`core.accordion panel ${panel.id} must aria-labelledby ${trigger.id}.`);
  }
  return panel;
};

export function syncAccordionItem(root, trigger, open = trigger?.getAttribute('aria-expanded') === 'true') {
  assertAccordion(root);
  if (!trigger || !root.contains(trigger) || trigger.closest('.ns-accordion') !== root) {
    throw new TypeError('core.accordion state sync requires a trigger owned by the root.');
  }
  const panel = validateTrigger(root, trigger);
  const nextOpen = Boolean(open);
  trigger.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
  trigger.dataset.state = isDisabled(trigger) ? 'disabled' : nextOpen ? 'open' : 'closed';
  panel.hidden = !nextOpen;
  panel.dataset.state = nextOpen ? 'open' : 'closed';
  return nextOpen;
}

export function setAccordionItemOpen(root, trigger, open, { expansion = root?.dataset.expansion || 'multiple' } = {}) {
  assertAccordion(root);
  if (!['single', 'multiple'].includes(expansion)) throw new TypeError('core.accordion expansion must be single or multiple.');
  if (!trigger || !root.contains(trigger) || trigger.closest('.ns-accordion') !== root || isDisabled(trigger)) {
    throw new TypeError('core.accordion disclosure changes require an enabled trigger owned by the root.');
  }

  if (open && expansion === 'single') {
    for (const candidate of triggersFor(root)) {
      if (candidate !== trigger && candidate.getAttribute('aria-expanded') === 'true') syncAccordionItem(root, candidate, false);
    }
  }

  return syncAccordionItem(root, trigger, open);
}

export function bindAccordion(root, { expansion = root?.dataset.expansion || 'multiple' } = {}) {
  assertAccordion(root);
  if (!['single', 'multiple'].includes(expansion)) throw new TypeError('core.accordion expansion must be single or multiple.');
  if (controllers.has(root)) controllers.get(root)();

  const triggers = triggersFor(root);
  if (!triggers.length) throw new TypeError('core.accordion requires at least one trigger.');
  root.dataset.expansion = expansion;

  let initiallyOpen = 0;
  for (const trigger of triggers) {
    validateTrigger(root, trigger);
    if (trigger.getAttribute('aria-expanded') === 'true') initiallyOpen += 1;
  }
  if (expansion === 'single' && initiallyOpen > 1) {
    throw new TypeError('core.accordion single expansion allows at most one initially open item.');
  }

  const handlers = new Map();
  for (const trigger of triggers) {
    syncAccordionItem(root, trigger);
    const onClick = () => {
      if (isDisabled(trigger)) return;
      const nextOpen = trigger.getAttribute('aria-expanded') !== 'true';
      setAccordionItemOpen(root, trigger, nextOpen, { expansion });
    };
    trigger.addEventListener('click', onClick);
    handlers.set(trigger, onClick);
  }

  const destroy = () => {
    for (const [trigger, handler] of handlers) trigger.removeEventListener('click', handler);
    if (controllers.get(root) === destroy) controllers.delete(root);
  };
  controllers.set(root, destroy);
  return destroy;
}
