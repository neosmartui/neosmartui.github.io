const assertGroup = (group) => {
  if (!group || group.getAttribute('role') !== 'group') {
    throw new TypeError('core.segmented-control web adapter requires an element with role="group".');
  }
};

const segmentsFor = (group) => [...group.querySelectorAll('.ns-segmented-control-segment')];

const assertSegment = (group, segment) => {
  if (!segment || !group.contains(segment) || segment.tagName !== 'BUTTON' || segment.type !== 'button') {
    throw new TypeError('core.segmented-control segments must be real <button type="button"> elements owned by the group.');
  }
  const pressed = segment.getAttribute('aria-pressed');
  if (!['true', 'false'].includes(pressed)) {
    throw new TypeError('core.segmented-control segments require aria-pressed="true" or aria-pressed="false".');
  }
};

export function syncSegmentedControl(group) {
  assertGroup(group);
  const segments = segmentsFor(group);
  if (!segments.length) throw new TypeError('core.segmented-control requires at least one segment.');
  for (const segment of segments) assertSegment(group, segment);

  const selected = segments.filter((segment) => segment.getAttribute('aria-pressed') === 'true');
  if (selected.length !== 1) throw new TypeError('core.segmented-control requires exactly one aria-pressed="true" segment.');

  for (const segment of segments) {
    if (segment.disabled) segment.dataset.state = segment === selected[0] ? 'selected-disabled' : 'disabled';
    else segment.dataset.state = segment === selected[0] ? 'selected' : 'rest';
  }
  group.dataset.selectedSegment = selected[0].id || '';
  return selected[0];
}

export function selectSegment(group, segment) {
  assertGroup(group);
  assertSegment(group, segment);
  if (segment.disabled) throw new TypeError('core.segmented-control cannot select a disabled segment through activation.');

  for (const candidate of segmentsFor(group)) {
    assertSegment(group, candidate);
    candidate.setAttribute('aria-pressed', candidate === segment ? 'true' : 'false');
  }
  return syncSegmentedControl(group);
}

export function bindSegmentedControl(group) {
  assertGroup(group);
  const segments = segmentsFor(group);
  if (!segments.length) throw new TypeError('core.segmented-control requires at least one segment.');
  syncSegmentedControl(group);

  const clickHandlers = new Map();
  for (const segment of segments) {
    const onClick = () => {
      if (segment.disabled) return;
      if (segment.getAttribute('aria-pressed') === 'true') {
        syncSegmentedControl(group);
        return;
      }
      selectSegment(group, segment);
    };
    segment.addEventListener('click', onClick);
    clickHandlers.set(segment, onClick);
  }

  return () => {
    for (const [segment, handler] of clickHandlers) segment.removeEventListener('click', handler);
  };
}
