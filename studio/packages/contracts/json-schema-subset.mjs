const supportedKeywords = new Set([
  '$schema', '$id', 'title', 'description',
  'type', 'additionalProperties', 'required', 'properties', 'const',
  'minLength', 'pattern', 'minItems', 'uniqueItems', 'items', 'enum'
]);

const allowedTypes = new Set(['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const escapePointer = (value) => String(value).replaceAll('~', '~0').replaceAll('/', '~1');
const jsonEqual = (first, second) => JSON.stringify(first) === JSON.stringify(second);

const schemaError = (message) => {
  throw new TypeError('[json-schema-subset] ' + message);
};

function inspectSchema(schema, path) {
  if (!isObject(schema)) schemaError('schema at ' + path + ' must be an object');
  for (const key of Object.keys(schema)) {
    if (!supportedKeywords.has(key)) schemaError('unsupported keyword ' + key + ' at ' + path);
  }

  if (Object.hasOwn(schema, 'type') && (typeof schema.type !== 'string' || !allowedTypes.has(schema.type))) {
    schemaError('unsupported type at ' + path);
  }
  if (Object.hasOwn(schema, 'additionalProperties') && typeof schema.additionalProperties !== 'boolean') {
    schemaError('additionalProperties must be boolean at ' + path);
  }
  if (Object.hasOwn(schema, 'required')) {
    if (!Array.isArray(schema.required) || schema.required.some((item) => typeof item !== 'string') || new Set(schema.required).size !== schema.required.length) {
      schemaError('required must be a unique string array at ' + path);
    }
  }
  if (Object.hasOwn(schema, 'properties')) {
    if (!isObject(schema.properties)) schemaError('properties must be an object at ' + path);
    for (const [key, child] of Object.entries(schema.properties)) inspectSchema(child, path + '/properties/' + escapePointer(key));
  }
  if (Object.hasOwn(schema, 'minLength') && (!Number.isInteger(schema.minLength) || schema.minLength < 0)) {
    schemaError('minLength must be a non-negative integer at ' + path);
  }
  if (Object.hasOwn(schema, 'pattern')) {
    if (typeof schema.pattern !== 'string') schemaError('pattern must be a string at ' + path);
    try { new RegExp(schema.pattern); } catch { schemaError('pattern is invalid at ' + path); }
  }
  if (Object.hasOwn(schema, 'minItems') && (!Number.isInteger(schema.minItems) || schema.minItems < 0)) {
    schemaError('minItems must be a non-negative integer at ' + path);
  }
  if (Object.hasOwn(schema, 'uniqueItems') && typeof schema.uniqueItems !== 'boolean') {
    schemaError('uniqueItems must be boolean at ' + path);
  }
  if (Object.hasOwn(schema, 'items')) inspectSchema(schema.items, path + '/items');
  if (Object.hasOwn(schema, 'enum') && (!Array.isArray(schema.enum) || schema.enum.length === 0)) {
    schemaError('enum must be a non-empty array at ' + path);
  }
}

const matchesType = (type, value) => {
  if (type === 'object') return isObject(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'null') return value === null;
  return true;
};

function validateNode(schema, value, path, errors) {
  if (schema.type && !matchesType(schema.type, value)) {
    errors.push({ path, keyword: 'type', message: 'expected ' + schema.type });
    return;
  }

  if (Object.hasOwn(schema, 'const') && !jsonEqual(value, schema.const)) {
    errors.push({ path, keyword: 'const', message: 'value does not match const' });
  }
  if (schema.enum && !schema.enum.some((candidate) => jsonEqual(value, candidate))) {
    errors.push({ path, keyword: 'enum', message: 'value is not in enum' });
  }

  if (typeof value === 'string') {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      errors.push({ path, keyword: 'minLength', message: 'string is shorter than ' + schema.minLength });
    }
    if (typeof schema.pattern === 'string' && !(new RegExp(schema.pattern)).test(value)) {
      errors.push({ path, keyword: 'pattern', message: 'string does not match pattern' });
    }
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push({ path, keyword: 'minItems', message: 'array has fewer than ' + schema.minItems + ' items' });
    }
    if (schema.uniqueItems === true) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push({ path, keyword: 'uniqueItems', message: 'array contains duplicate items' });
          break;
        }
        seen.add(key);
      }
    }
    if (schema.items) {
      for (let index = 0; index < value.length; index += 1) validateNode(schema.items, value[index], path + '/' + index, errors);
    }
  }

  if (isObject(value)) {
    const properties = schema.properties || {};
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.hasOwn(value, key)) errors.push({ path: path + '/' + escapePointer(key), keyword: 'required', message: 'required property is missing' });
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) errors.push({ path: path + '/' + escapePointer(key), keyword: 'additionalProperties', message: 'unknown property' });
      }
    }
    for (const [key, child] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) validateNode(child, value[key], path + '/' + escapePointer(key), errors);
    }
  }
}

export function compileJsonSchemaSubset(schema) {
  inspectSchema(schema, '#');
  return (value) => {
    const errors = [];
    validateNode(schema, value, '$', errors);
    return { valid: errors.length === 0, errors };
  };
}
