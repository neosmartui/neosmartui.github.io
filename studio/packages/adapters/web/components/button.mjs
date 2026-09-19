export function bindAsyncButton(button, action) {
  if (!button || button.tagName !== 'BUTTON') throw new TypeError('core.button web adapter requires a real <button>.');
  if (typeof action !== 'function') throw new TypeError('core.button action must be a function.');

  let pending = false;
  const onClick = async (event) => {
    if (pending || button.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }
    pending = true;
    button.dataset.loading = 'true';
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-disabled', 'true');
    try {
      await action(event);
    } finally {
      pending = false;
      button.dataset.loading = 'false';
      button.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
    }
  };

  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
