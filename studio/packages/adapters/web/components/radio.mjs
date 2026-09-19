const assertRadio = (radio) => {
  if (!radio || radio.tagName !== 'INPUT' || radio.type !== 'radio') {
    throw new TypeError('core.radio web adapter requires a real <input type="radio">.');
  }
};

const radioGroupPeers = (radio) => {
  assertRadio(radio);
  if (!radio.name) return [radio];
  const root = radio.getRootNode();
  if (!root || typeof root.querySelectorAll !== 'function') return [radio];
  return [...root.querySelectorAll('input[type="radio"]')].filter((peer) => peer.name === radio.name && peer.form === radio.form);
};

export function syncRadioState(radio) {
  assertRadio(radio);
  const state = radio.checked ? 'checked' : 'unchecked';
  radio.dataset.state = state;
  return state;
}

export function syncRadioGroup(radio) {
  const peers = radioGroupPeers(radio);
  for (const peer of peers) syncRadioState(peer);
  return peers.length;
}

export function bindRadio(radio) {
  const peers = radioGroupPeers(radio);
  const onChange = () => {
    for (const peer of peers) syncRadioState(peer);
  };
  for (const peer of peers) peer.addEventListener('change', onChange);
  onChange();
  return () => {
    for (const peer of peers) peer.removeEventListener('change', onChange);
  };
}
