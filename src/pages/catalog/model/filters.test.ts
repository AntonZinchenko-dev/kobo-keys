import { activeCount, parseFilters, serializeFilters, toQuery } from './filters';

describe('catalog filters in the URL', () => {
  it('parses only known values', () => {
    const f = parseFilters(
      new URLSearchParams(
        'layout=65,99&switch=tactile&color=pink,plaid&min=5000&stock=1&sort=price-asc&q=sakura',
      ),
    );
    expect(f).toEqual({
      layout: ['65'],
      switchType: ['tactile'],
      color: ['pink'],
      priceMin: 5000,
      priceMax: undefined,
      inStock: true,
      sort: 'price-asc',
      q: 'sakura',
    });
    expect(activeCount(f)).toBe(5);
  });

  it('round-trips through the URL and omits defaults', () => {
    const f = parseFilters(new URLSearchParams('color=black&sort=new'));
    expect(serializeFilters(f).toString()).toBe('color=black&sort=new');
    expect(serializeFilters(parseFilters(new URLSearchParams())).toString()).toBe('');
    expect(serializeFilters(f, 3).get('pages')).toBe('3');
  });

  it('turns "show more" pages into a bigger limit', () => {
    expect(toQuery(parseFilters(new URLSearchParams()), 'keycaps', 2)).toMatchObject({
      category: 'keycaps',
      limit: 24,
      page: 1,
    });
  });
});
