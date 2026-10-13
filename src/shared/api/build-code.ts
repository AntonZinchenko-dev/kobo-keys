import type { BuilderOptions, KeyboardBuild } from './contracts';

/**
 * A custom keyboard build is encoded into a short string. The same string is used as
 * the cart variant key and in the share link (/builder?b=…), so a build can be sent to a friend.
 */
const SEP = '.';
const LIGHTING = ['off', 'static', 'breathing', 'wave'] as const;
const LAYOUTS = ['60', '65', '75', 'tkl'] as const;

export const DEFAULT_BUILD: KeyboardBuild = {
  layout: '65',
  case: 'milk',
  keycaps: 'sakura',
  switch: 'silk-linear',
  lighting: 'wave',
  engraving: '',
};

export const encodeBuild = (b: KeyboardBuild) =>
  [
    b.layout,
    b.case,
    b.keycaps,
    b.switch,
    b.lighting,
    encodeURIComponent(b.engraving).replaceAll('.', '%2E'),
  ].join(SEP);

export const decodeBuild = (code: string | null | undefined): KeyboardBuild | null => {
  if (!code) return null;
  const [layout, caseId, keycaps, sw, lighting, engraving = ''] = code.split(SEP);
  if (!layout || !caseId || !keycaps || !sw || !lighting) return null;
  if (!(LAYOUTS as readonly string[]).includes(layout)) return null;
  if (!(LIGHTING as readonly string[]).includes(lighting)) return null;
  let text = '';
  try {
    text = decodeURIComponent(engraving);
  } catch {
    return null;
  }
  return {
    layout: layout as KeyboardBuild['layout'],
    case: caseId,
    keycaps,
    switch: sw,
    lighting: lighting as KeyboardBuild['lighting'],
    engraving: text.slice(0, 32),
  };
};

/** Same formula on the client (live price) and in the mock backend (authoritative quote). */
export const priceBuild = (b: KeyboardBuild, o: BuilderOptions) => {
  const layout = o.layouts.find((l) => l.id === b.layout);
  const caseOpt = o.cases.find((c) => c.id === b.case);
  const caps = o.keycaps.find((k) => k.id === b.keycaps);
  const sw = o.switches.find((s) => s.id === b.switch);
  const light = o.lighting.find((l) => l.id === b.lighting);
  if (!layout || !caseOpt || !caps || !sw || !light) return null;
  const parts = {
    layout: layout.price,
    case: caseOpt.price,
    keycaps: caps.price,
    switches: sw.pricePerKey * layout.keys,
    lighting: light.price,
    engraving: b.engraving.trim() ? o.engraving.price : 0,
  };
  return { parts, total: Object.values(parts).reduce((a, b) => a + b, 0) };
};
