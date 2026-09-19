import { compileJsonSchemaSubset } from './json-schema-subset.mjs';
import { canonicalResolvedTokenIds, canonicalThemeScope, validateThemePackageSemantic } from './theme-package-semantic.mjs';

export const THEME_PACKAGE_FILENAMES = Object.freeze(['theme.json', 'resolution.json', 'tokens.json']);

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
};

const orderedObject = (source, order) => {
  const entries = [];
  for (const key of order) if (Object.hasOwn(source, key)) entries.push([key, stableValue(source[key])]);
  return Object.fromEntries(entries);
};

const failure = (errors) => ({ ok: false, errors });
const issue = (code, path, message) => ({ code, path, message });

export function createThemePackageValidators({ themeSchema, resolutionSchema, bundleSchema }) {
  return Object.freeze({
    theme: compileJsonSchemaSubset(themeSchema),
    resolution: compileJsonSchemaSubset(resolutionSchema),
    bundle: compileJsonSchemaSubset(bundleSchema)
  });
}

export function importThemePackage(files, { validators, authorities }) {
  if (!isObject(files)) return failure([issue('package.files', '$', 'Theme import must provide a filename-to-text object')]);
  const names = Object.keys(files).sort();
  const expected = [...THEME_PACKAGE_FILENAMES].sort();
  if (names.length !== expected.length || names.some((name, index) => name !== expected[index])) {
    return failure([issue('package.files', '$', 'Theme import requires exactly theme.json, resolution.json, and tokens.json')]);
  }

  const parsed = {};
  const fileToKey = { 'theme.json': 'theme', 'resolution.json': 'resolution', 'tokens.json': 'bundle' };
  for (const filename of THEME_PACKAGE_FILENAMES) {
    if (typeof files[filename] !== 'string') return failure([issue('package.file-type', '$/' + filename, 'Theme package file content must be text')]);
    try { parsed[fileToKey[filename]] = JSON.parse(files[filename]); }
    catch (error) { return failure([issue('json.parse', '$/' + filename, error.message)]); }
  }

  const schemaErrors = [];
  for (const key of ['theme', 'resolution', 'bundle']) {
    const validator = validators?.[key];
    if (typeof validator !== 'function') return failure([issue('schema.configuration', '$/' + key, 'schema validator is missing')]);
    const candidate = cloneJson(parsed[key]);
    const before = JSON.stringify(candidate);
    let result;
    try { result = validator(candidate); }
    catch (error) {
      schemaErrors.push(issue('schema.exception', '$/' + key, error.message));
      continue;
    }
    if (JSON.stringify(candidate) !== before) {
      schemaErrors.push(issue('schema.mutation', '$/' + key, 'schema validation must not mutate or coerce imported data'));
      continue;
    }
    if (!result || result.valid !== true) {
      const errors = Array.isArray(result?.errors) ? result.errors : [{ path: '$', message: 'schema validation failed' }];
      for (const error of errors) schemaErrors.push(issue('schema.invalid', '$/' + key + (error.path === '$' ? '' : error.path.slice(1)), error.message || 'schema validation failed'));
    }
  }
  if (schemaErrors.length) return failure(schemaErrors);

  let semantic;
  try { semantic = validateThemePackageSemantic(parsed, authorities); }
  catch (error) { return failure([issue('semantic.exception', '$', error.message)]); }
  if (!semantic.valid) return failure(semantic.errors);

  return { ok: true, value: deepFreeze(cloneJson(parsed)) };
}

function canonicalizePackage(themePackage, authorities) {
  const scope = canonicalThemeScope(authorities);
  const tokenOrder = canonicalResolvedTokenIds(authorities);
  const values = new Map(themePackage.bundle.values.map((entry) => [entry.id, entry]));
  const theme = orderedObject(themePackage.theme, [
    '$schema', 'schema', 'name', 'family', 'category', 'color', 'typography', 'geometry', 'border', 'shadow', 'spacing', 'density', 'motion', 'interaction', 'icons'
  ]);
  const resolution = orderedObject({ ...themePackage.resolution, scope }, ['$schema', 'schema', 'flavor', 'theme', 'bundle', 'scope']);
  const bundle = orderedObject({
    ...themePackage.bundle,
    scope,
    values: tokenOrder.map((id) => orderedObject(values.get(id), ['id', 'type', 'value']))
  }, ['$schema', 'schema', 'theme', 'flavor', 'scope', 'values']);
  return { theme, resolution, bundle };
}

export function exportThemePackage(themePackage, { authorities }) {
  let semantic;
  try { semantic = validateThemePackageSemantic(themePackage, authorities); }
  catch (error) { return failure([issue('semantic.exception', '$', error.message)]); }
  if (!semantic.valid) return failure(semantic.errors);

  const canonical = canonicalizePackage(cloneJson(themePackage), authorities);
  const files = {
    'theme.json': JSON.stringify(canonical.theme, null, 2) + '\n',
    'resolution.json': JSON.stringify(canonical.resolution, null, 2) + '\n',
    'tokens.json': JSON.stringify(canonical.bundle, null, 2) + '\n'
  };
  return { ok: true, value: { package: deepFreeze(cloneJson(canonical)), files: Object.freeze(files) } };
}
