import { contrastRatio } from './color-contrast.mjs';
import { assertResolvedTokenValue } from './resolved-token-value.mjs';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

const authorityGet = (collection, key) => {
  if (collection instanceof Map) return collection.get(key);
  return collection && Object.hasOwn(collection, key) ? collection[key] : undefined;
};

const sameSet = (values, expected) => {
  if (!Array.isArray(values) || values.length !== expected.length || new Set(values).size !== values.length) return false;
  const wanted = new Set(expected);
  return values.every((value) => wanted.has(value));
};

const px = (value) => {
  if (typeof value !== 'string') return null;
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
  return match ? Number(match[1]) : null;
};

const addJsonSafetyErrors = (value, path, errors, seen) => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) errors.push({ code: 'data.number', path, message: 'number must be finite' });
    return;
  }
  if (typeof value !== 'object') {
    errors.push({ code: 'data.type', path, message: 'Theme package must contain JSON data only' });
    return;
  }
  if (seen.has(value)) {
    errors.push({ code: 'data.cycle', path, message: 'Theme package must not contain cycles' });
    return;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) addJsonSafetyErrors(value[index], path + '/' + index, errors, seen);
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) errors.push({ code: 'data.prototype', path, message: 'Theme package objects must be plain JSON objects' });
    for (const [key, child] of Object.entries(value)) {
      if (unsafeKeys.has(key)) errors.push({ code: 'data.key', path: path + '/' + key, message: 'unsafe object key is forbidden' });
      addJsonSafetyErrors(child, path + '/' + key, errors, seen);
    }
  }
  seen.delete(value);
};

function buildPlan(authorities) {
  const tokenContracts = authorities?.tokenContracts;
  const registry = authorities?.componentRegistry;
  if (tokenContracts?.schema !== 'neosmartui/token-contracts@1' || !Array.isArray(tokenContracts.contracts)) {
    throw new TypeError('[theme-package-semantic] invalid token contract authority');
  }
  if (registry?.schema !== 'neosmartui/component-registry@1' || registry.domain !== 'core' || !Array.isArray(registry.components)) {
    throw new TypeError('[theme-package-semantic] invalid Core registry authority');
  }

  const entries = registry.components.filter((entry) => entry.maturity !== 'contract-only');
  const scope = entries.map((entry) => entry.id);
  const dependencies = new Set();
  for (const entry of entries) {
    const contract = authorityGet(authorities.componentContracts, entry.id);
    if (!contract || contract.schema !== 'neosmartui/component@1' || contract.id !== entry.id || !Array.isArray(contract.dependencies)) {
      throw new TypeError('[theme-package-semantic] missing canonical component contract for ' + entry.id);
    }
    for (const dependency of contract.dependencies) dependencies.add(dependency);
  }

  const contractById = new Map(tokenContracts.contracts.map((entry) => [entry.id, entry]));
  const orderedTokenIds = tokenContracts.contracts.filter((entry) => dependencies.has(entry.id)).map((entry) => entry.id);
  if (orderedTokenIds.length !== dependencies.size) throw new TypeError('[theme-package-semantic] component dependency is missing from token authority');
  return { scope, dependencies, contractById, orderedTokenIds };
}

export function canonicalThemeScope(authorities) {
  return [...buildPlan(authorities).scope];
}

export function canonicalResolvedTokenIds(authorities) {
  return [...buildPlan(authorities).orderedTokenIds];
}

export function validateThemePackageSemantic(themePackage, authorities) {
  const errors = [];
  const add = (code, path, message) => errors.push({ code, path, message });

  addJsonSafetyErrors(themePackage, '$', errors, new WeakSet());
  if (!isObject(themePackage) || !isObject(themePackage.theme) || !isObject(themePackage.resolution) || !isObject(themePackage.bundle)) {
    add('package.shape', '$', 'Theme package must expose theme, resolution, and bundle objects');
    return { valid: false, errors };
  }

  let plan;
  try { plan = buildPlan(authorities); }
  catch (error) {
    add('authority.invalid', '$', error.message);
    return { valid: false, errors };
  }

  const { theme, resolution, bundle } = themePackage;
  if (theme.schema !== 'neosmartui/theme@1') add('identity.theme-schema', '$/theme/schema', 'Theme schema identity is invalid');
  if (resolution.schema !== 'neosmartui/theme-resolution@1') add('identity.resolution-schema', '$/resolution/schema', 'resolution schema identity is invalid');
  if (bundle.schema !== 'neosmartui/resolved-token-bundle@1') add('identity.bundle-schema', '$/bundle/schema', 'bundle schema identity is invalid');
  if (resolution.theme !== theme.name || bundle.theme !== theme.name) add('identity.theme', '$', 'Theme name must match across all three files');
  if (resolution.flavor !== bundle.flavor) add('identity.flavor', '$', 'Flavor identity must match between resolution and bundle');
  if (resolution.bundle !== 'tokens.json') add('identity.bundle', '$/resolution/bundle', 'resolution.bundle must be tokens.json');

  const flavor = authorityGet(authorities?.flavors, resolution.flavor);
  if (!flavor || flavor.schema !== 'neosmartui/flavor@1' || flavor.id !== resolution.flavor) {
    add('identity.flavor-authority', '$/resolution/flavor', 'Flavor is not present in canonical authority');
  } else {
    const expectedCategory = flavor.id.slice('flavor.'.length);
    if (theme.category !== expectedCategory) add('identity.category', '$/theme/category', 'Theme category must match canonical Flavor identity');
    if (theme.motion?.model !== flavor.interactionModel || theme.interaction?.model !== flavor.interactionModel) {
      add('identity.interaction', '$/theme', 'Theme motion and interaction models must match the Flavor interaction model');
    }
  }

  if (!['light', 'dark'].includes(theme.color?.mode)) add('theme.mode', '$/theme/color/mode', 'Theme color.mode must be light or dark');
  if (!sameSet(resolution.scope, plan.scope)) add('scope.resolution', '$/resolution/scope', 'resolution scope must exactly match current implemented/public-proof Core scope');
  if (!sameSet(bundle.scope, plan.scope)) add('scope.bundle', '$/bundle/scope', 'bundle scope must exactly match current implemented/public-proof Core scope');

  const values = new Map();
  if (!Array.isArray(bundle.values)) {
    add('tokens.values', '$/bundle/values', 'bundle values must be an array');
  } else {
    for (let index = 0; index < bundle.values.length; index += 1) {
      const entry = bundle.values[index];
      const path = '$/bundle/values/' + index;
      if (!isObject(entry) || typeof entry.id !== 'string') {
        add('token.entry', path, 'resolved token entry is invalid');
        continue;
      }
      if (values.has(entry.id)) {
        add('token.duplicate', path + '/id', 'duplicate resolved token ' + entry.id);
        continue;
      }
      const contract = plan.contractById.get(entry.id);
      if (!contract) {
        add('token.unknown', path + '/id', 'unknown resolved token ' + entry.id);
        continue;
      }
      if (!plan.dependencies.has(entry.id)) add('token.padding', path + '/id', 'resolved token is outside the exact component dependency union');
      if (entry.type !== contract.type) add('token.type', path + '/type', 'token type does not match canonical authority for ' + entry.id);
      try { assertResolvedTokenValue(entry.type, entry.value, { id: entry.id }); }
      catch (error) { add('token.value', path + '/value', error.message); }
      values.set(entry.id, entry.value);
    }
  }

  for (const dependency of plan.dependencies) {
    if (!values.has(dependency)) add('token.missing', '$/bundle/values', 'missing required token ' + dependency);
  }
  if (values.size !== plan.dependencies.size) add('token.union', '$/bundle/values', 'resolved tokens must equal the exact dependency union');

  for (const axis of ['x', 'y']) {
    const ids = ['depth.rest.', 'depth.hover.', 'depth.active.', 'press.hover.', 'press.active.'].map((prefix) => prefix + axis);
    if (ids.every((id) => values.has(id))) {
      const [rest, hover, active, hoverPress, activePress] = ids.map((id) => px(values.get(id)));
      if ([rest, hover, active, hoverPress, activePress].some((value) => value === null)) {
        add('pressure.unit', '$/bundle/values', 'Pressure depth/travel roles must resolve to px dimensions on axis ' + axis);
      } else {
        if (!(rest >= hover && hover >= active && active >= 0)) add('pressure.monotonic', '$/bundle/values', 'Pressure depth must compress monotonically on axis ' + axis);
        if (Math.abs(rest - (hover + hoverPress)) > 1e-9 || Math.abs(rest - (active + activePress)) > 1e-9) {
          add('pressure.coherence', '$/bundle/values', 'Pressure depth and travel must conserve resting distance on axis ' + axis);
        }
      }
    }
  }

  if (values.has('size.control.minimum')) {
    const minimum = px(values.get('size.control.minimum'));
    if (minimum === null || minimum < 44) add('accessibility.target', '$/bundle/values', 'size.control.minimum must be at least 44px');
  }
  if (values.has('opacity.disabled')) {
    const opacity = values.get('opacity.disabled');
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) add('accessibility.opacity', '$/bundle/values', 'opacity.disabled must remain within 0..1');
  }

  if (bundle.scope?.includes('core.badge')) {
    const pairs = [
      ['neutral', 'color.content.primary', 'color.surface.panel'],
      ['info', 'color.content.primary', 'color.state.info'],
      ['success', 'color.content.primary', 'color.state.success'],
      ['warning', 'color.content.primary', 'color.state.warning'],
      ['error', 'color.content.inverse', 'color.state.error']
    ];
    for (const [tone, foregroundId, backgroundId] of pairs) {
      const foreground = values.get(foregroundId);
      const background = values.get(backgroundId);
      if (typeof foreground !== 'string' || typeof background !== 'string') continue;
      try {
        const ratio = contrastRatio(foreground, background);
        if (ratio < 4.5) add('contrast.badge', '$/bundle/values', tone + ' Badge authored text contrast is below 4.5:1');
      } catch (error) {
        add('contrast.color', '$/bundle/values', error.message);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertThemePackageSemantic(themePackage, authorities) {
  const result = validateThemePackageSemantic(themePackage, authorities);
  if (!result.valid) {
    const error = new TypeError('[theme-package-semantic] ' + result.errors.map((item) => item.code + ': ' + item.message).join('; '));
    error.issues = result.errors;
    throw error;
  }
  return themePackage;
}
