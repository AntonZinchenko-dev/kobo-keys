import { type KeyboardEvent, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { suggestQuery } from '@/entities/product';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { useDebouncedValue } from '@/shared/lib';
import { Dialog, Icon, Kbd, Picture, Price, Spinner } from '@/shared/ui';

import styles from './search-dialog.module.css';

const RECENT_KEY = 'kobo-recent-searches';
const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};
const saveRecent = (q: string) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter((r) => r !== q)].slice(0, 5)));
  } catch {
    // ignore
  }
};

/** Ctrl/⌘+K search: suggestions while typing, arrow keys to move, Enter to open (ARIA combobox). */
export const SearchDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const listId = useId();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(q.trim(), 200);
  const { data, isFetching } = useQuery({ ...suggestQuery(lang, debounced), enabled: open });
  const results = data?.products ?? [];
  const recent = open ? readRecent() : [];

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);
  useEffect(() => setActive(0), [debounced]);

  const go = (slug?: string) => {
    if (q.trim()) saveRecent(q.trim());
    onClose();
    void navigate(
      slug ? paths.product(lang, slug) : `${paths.catalog(lang)}?q=${encodeURIComponent(q.trim())}`,
      {
        viewTransition: true,
      },
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(debounced ? results[active]?.slug : undefined);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t('search.title')} closeLabel={t('actions.close')} size="md">
      <div className={styles.field}>
        <Icon name="search" size={20} />
        <input
          className={styles.input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('search.placeholder')}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          aria-label={t('search.title')}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- focus moves into the field that just appeared (dialog / next step)
          autoFocus
        />
        {isFetching && <Spinner label={t('search.loading')} />}
      </div>

      {!q && recent.length > 0 && (
        <div className={styles.recent}>
          <span>{t('search.recent')}</span>
          {recent.map((r) => (
            <button key={r} type="button" className={styles.chip} onClick={() => setQ(r)}>
              {r}
            </button>
          ))}
        </div>
      )}

      <p className={styles.caption}>{debounced ? t('search.results') : t('search.popular')}</p>
      <ul id={listId} role="listbox" className={styles.list} aria-label={t('search.results')}>
        {results.map((p, i) => (
          // Options are driven from the combobox input (arrows + Enter); click is for the mouse
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={p.slug}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            className={clsx(styles.option, i === active && styles.active)}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(p.slug)}
          >
            <div className={styles.thumb}>
              {p.images[0] && <Picture slot={p.images[0]} alt="" ratio={1} sizes="56px" />}
            </div>
            <div className={styles.text}>
              <strong>{p.name}</strong>
              <span>{t(`categories.${p.category}`)}</span>
            </div>
            <Price value={p.price} size="sm" />
          </li>
        ))}
      </ul>
      {debounced && results.length === 0 && !isFetching && (
        <p className={styles.empty}>{t('search.nothing', { q: debounced })}</p>
      )}
      <p className={styles.hint} aria-hidden="true">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd> {t('search.hintMove')} · <Kbd>Enter</Kbd> {t('search.hintOpen')} · <Kbd>Esc</Kbd>{' '}
        {t('search.hintClose')}
      </p>
    </Dialog>
  );
};
