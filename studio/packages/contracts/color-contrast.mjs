const hexPattern = /^#([0-9a-f]{6})$/i;
const rgbFunctionPattern = /^rgba?\((.*)\)$/i;

const fail = (value) => {
  throw new TypeError(`unsupported opaque sRGB color: ${value}`);
};

export function parseSrgbColor(value) {
  if (typeof value !== 'string') fail(value);
  const input = value.trim();
  const hex = hexPattern.exec(input);
  if (hex) {
    const channels = hex[1].match(/.{2}/g).map((pair) => Number.parseInt(pair, 16));
    return channels.map((channel) => channel / 255);
  }

  const functional = rgbFunctionPattern.exec(input);
  if (!functional) fail(value);
  const normalized = functional[1].replace(/\s*\/\s*/g, ',');
  const parts = normalized.split(/[\s,]+/).filter(Boolean).map(Number);
  if (parts.length !== 3 && parts.length !== 4) fail(value);
  if (parts.slice(0, 3).some((channel) => !Number.isFinite(channel) || channel < 0 || channel > 255)) fail(value);
  if (parts.length === 4 && (!Number.isFinite(parts[3]) || parts[3] !== 1)) fail(value);
  return parts.slice(0, 3).map((channel) => channel / 255);
}

export function relativeLuminance(value) {
  const [red, green, blue] = parseSrgbColor(value).map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const high = Math.max(first, second);
  const low = Math.min(first, second);
  return (high + 0.05) / (low + 0.05);
}
