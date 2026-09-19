const requireButton = (root) => {
  const button = root.querySelector('.ns-button');
  if (!button || button.tagName !== 'BUTTON') throw new TypeError('core.button preview requires .ns-button');
  return button;
};
export function applyPreviewState({ root, state }) {
  const button = requireButton(root);
  if (state === 'loading') { button.dataset.loading = 'true'; button.setAttribute('aria-busy', 'true'); button.setAttribute('aria-disabled', 'true'); return; }
  if (state === 'disabled') { button.disabled = true; return; }
  throw new Error(`core.button preview cannot realize controller state ${state}`);
}
