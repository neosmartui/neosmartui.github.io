const cloneJson = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
};
const normalizeCleanup = (result) => {
  if (typeof result === 'function') return result;
  if (result && typeof result.destroy === 'function') return () => result.destroy();
  return () => {};
};
export async function mountPreviewBindings({ root, manifest, moduleResolver }) {
  if (!root || typeof root.querySelector !== 'function') throw new TypeError('preview root must support querySelector');
  if (manifest?.schema !== 'neosmartui/component-preview@1') throw new TypeError('preview manifest identity is invalid');
  if (typeof moduleResolver !== 'function') throw new TypeError('preview moduleResolver must be a function');
  const cleanups = [];
  const helpers = {};
  const modules = new Map();
  try {
    for (const binding of manifest.renderers.web.bindings) {
      let namespace = modules.get(binding.module);
      if (!namespace) {
        namespace = await moduleResolver(binding.module);
        if (!namespace || typeof namespace !== 'object') throw new TypeError(`preview moduleResolver returned no namespace for ${binding.module}`);
        modules.set(binding.module, namespace);
        for (const [name, value] of Object.entries(namespace)) {
          if (typeof value !== 'function') continue;
          if (Object.hasOwn(helpers, name) && helpers[name] !== value) throw new Error(`preview helper export collision: ${name}`);
          helpers[name] = value;
        }
      }
      const target = root.querySelector(binding.selector);
      if (!target) throw new Error(`preview binding target missing: ${binding.selector}`);
      const bind = namespace[binding.export];
      if (typeof bind !== 'function') throw new Error(`preview binding export missing: ${binding.export}`);
      const options = binding.options === undefined ? undefined : deepFreeze(cloneJson(binding.options));
      const result = options === undefined ? bind(target) : bind(target, options);
      cleanups.push(normalizeCleanup(result));
    }
  } catch (error) {
    for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    throw error;
  }
  let destroyed = false;
  return {
    helpers: Object.freeze(helpers),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const cleanup of cleanups.reverse()) cleanup();
    }
  };
}
export function applyPreviewController({ root, manifest, state, controller, helpers }) {
  if (manifest?.stateRealization?.[state]?.mode !== 'controller') throw new Error(`state ${state} is not controller-realized`);
  if (!controller || typeof controller.applyPreviewState !== 'function') throw new TypeError('preview controller must export applyPreviewState');
  return controller.applyPreviewState({ root, state, helpers: helpers ?? Object.freeze({}) });
}
