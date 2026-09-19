const cloneJson = (value) => JSON.parse(JSON.stringify(value));
const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const failure = (code, message, workspace) => ({ ok: false, errors: [{ code, path: '$', message }], workspace });
const success = (value) => ({ ok: true, value });

export function createThemeWorkspace() {
  return deepFreeze({ light: null, dark: null, currentMode: null });
}

const modeFor = (themePackage) => themePackage?.theme?.color?.mode;
const compatible = (first, second) => (
  first.theme.family === second.theme.family &&
  first.theme.category === second.theme.category &&
  first.resolution.flavor === second.resolution.flavor
);

export function putThemePackage(workspace, themePackage) {
  const mode = modeFor(themePackage);
  if (!['light', 'dark'].includes(mode)) return failure('workspace.mode', 'Theme color.mode must be light or dark', workspace);
  const otherMode = mode === 'light' ? 'dark' : 'light';
  const other = workspace?.[otherMode];
  if (other && !compatible(other, themePackage)) {
    return failure('workspace.compatibility', 'Light and Dark workspace slots must share family, category, and Flavor identity', workspace);
  }

  const next = {
    light: workspace?.light ? cloneJson(workspace.light) : null,
    dark: workspace?.dark ? cloneJson(workspace.dark) : null,
    currentMode: mode
  };
  next[mode] = cloneJson(themePackage);
  return success(deepFreeze(next));
}

export function selectThemeMode(workspace, mode) {
  if (!['light', 'dark'].includes(mode)) return failure('workspace.mode', 'Workspace mode must be light or dark', workspace);
  if (!workspace?.[mode]) return failure('workspace.unavailable', 'Requested Theme mode is not loaded', workspace);
  return success(deepFreeze({
    light: workspace.light ? cloneJson(workspace.light) : null,
    dark: workspace.dark ? cloneJson(workspace.dark) : null,
    currentMode: mode
  }));
}

export function removeThemePackage(workspace, mode) {
  if (!['light', 'dark'].includes(mode)) return failure('workspace.mode', 'Workspace mode must be light or dark', workspace);
  const next = {
    light: workspace?.light ? cloneJson(workspace.light) : null,
    dark: workspace?.dark ? cloneJson(workspace.dark) : null,
    currentMode: workspace?.currentMode || null
  };
  next[mode] = null;
  if (next.currentMode === mode) {
    const otherMode = mode === 'light' ? 'dark' : 'light';
    next.currentMode = next[otherMode] ? otherMode : null;
  }
  return success(deepFreeze(next));
}
