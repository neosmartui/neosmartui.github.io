const scalarDimension = '(?:0|\\d+(?:\\.\\d+)?(?:px|rem|vw))';
const dimensionPattern = new RegExp('^(?:' + scalarDimension + '|clamp\\(' + scalarDimension + ', ' + scalarDimension + '(?: [+-] ' + scalarDimension + ')?, ' + scalarDimension + '\\))$');
const durationPattern = /^(?:\d+(?:\.\d+)?)ms$/;
const colorPattern = /^#[0-9a-f]{6}$/;
const fontFamilyPart = "(?:\"[A-Za-z0-9 _-]+\"|'[A-Za-z0-9 _-]+'|[A-Za-z][A-Za-z0-9 _-]*)";
const fontFamilyPattern = new RegExp('^' + fontFamilyPart + '(?:,\\s*' + fontFamilyPart + ')*$');

const tokenError = (type, value, id, detail) => {
  const label = id ? id + ' (' + type + ')' : type;
  throw new TypeError('[resolved-token-value] invalid ' + label + ': ' + detail + '; got ' + JSON.stringify(value));
};

export function assertResolvedTokenValue(type, value, { id = '' } = {}) {
  if (type === 'color') {
    if (typeof value !== 'string' || !colorPattern.test(value)) tokenError(type, value, id, 'expected canonical lowercase #rrggbb');
    return value;
  }

  if (type === 'dimension') {
    if (typeof value !== 'string' || !dimensionPattern.test(value)) tokenError(type, value, id, 'expected safe px/rem/vw scalar or simple clamp()');
    return value;
  }

  if (type === 'duration') {
    if (typeof value !== 'string' || !durationPattern.test(value) || Number.parseFloat(value) < 0) tokenError(type, value, id, 'expected non-negative milliseconds');
    return value;
  }

  if (type === 'cubicBezier') {
    if (!Array.isArray(value) || value.length !== 4 || value.some((part) => typeof part !== 'number' || !Number.isFinite(part))) {
      tokenError(type, value, id, 'expected four finite numbers');
    }
    if (value[0] < 0 || value[0] > 1 || value[2] < 0 || value[2] > 1) tokenError(type, value, id, 'x control points must remain within 0..1');
    return value;
  }

  if (type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) tokenError(type, value, id, 'expected finite number');
    return value;
  }

  if (type === 'fontFamily') {
    if (typeof value !== 'string' || !fontFamilyPattern.test(value) || /(?:url|var|env|attr)\s*\(/i.test(value)) {
      tokenError(type, value, id, 'expected local comma-separated font family names without CSS functions');
    }
    return value;
  }

  if (type === 'fontWeight') {
    if (!Number.isInteger(value) || value < 1 || value > 1000) tokenError(type, value, id, 'expected integer 1..1000');
    return value;
  }

  tokenError(type, value, id, 'unsupported token type');
}

export function serializeResolvedTokenValue(type, value, options = {}) {
  assertResolvedTokenValue(type, value, options);
  if (type === 'cubicBezier') return 'cubic-bezier(' + value.join(', ') + ')';
  return String(value);
}
