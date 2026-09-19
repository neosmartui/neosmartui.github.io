export function applyPreviewState({ root, state, helpers }) {
  const accordion = root.querySelector('#accordion-single-demo');
  const trigger = root.querySelector('#accordion-single-trigger-b');
  if (!accordion || !trigger) throw new TypeError('core.accordion preview requires canonical single-expansion fixture');
  if (state === 'open') { helpers.setAccordionItemOpen(accordion, trigger, true, { expansion: 'single' }); return; }
  throw new Error(`core.accordion preview cannot realize controller state ${state}`);
}
