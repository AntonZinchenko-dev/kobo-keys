import { builderOptions } from '@mocks/db/catalog';

import { decodeBuild, DEFAULT_BUILD, encodeBuild, priceBuild } from './build-code';

describe('custom build code', () => {
  it('round-trips a build through the share code', () => {
    const build = { ...DEFAULT_BUILD, layout: 'tkl' as const, engraving: 'Hello. 工房 & co' };
    expect(decodeBuild(encodeBuild(build))).toEqual(build);
  });

  it('rejects broken or foreign codes', () => {
    expect(decodeBuild(null)).toBeNull();
    expect(decodeBuild('nonsense')).toBeNull();
    expect(decodeBuild('99.milk.sakura.silk-linear.wave.')).toBeNull();
    expect(decodeBuild('65.milk.sakura.silk-linear.disco.')).toBeNull();
  });

  it('prices a build from its parts (engraving costs extra)', () => {
    const options = builderOptions('en');
    const plain = priceBuild({ ...DEFAULT_BUILD, engraving: '' }, options);
    const engraved = priceBuild({ ...DEFAULT_BUILD, engraving: 'KOBO' }, options);
    expect(plain?.parts.switches).toBe(45 * 68);
    expect(engraved && plain && engraved.total - plain.total).toBe(options.engraving.price);
  });

  it('returns null for unknown parts', () => {
    expect(priceBuild({ ...DEFAULT_BUILD, case: 'gold' }, builderOptions('en'))).toBeNull();
  });
});
