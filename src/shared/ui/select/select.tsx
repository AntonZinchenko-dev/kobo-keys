import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../icon/icon';
import type { IconName } from '../icon/names';

import styles from './select.module.css';

export interface SelectOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Plain text for type-ahead when `label` is not a string */
  text?: string;
  /** What the closed trigger shows (defaults to `label`) */
  short?: ReactNode;
  /** Small badge before the label: a symbol, a language code… */
  lead?: ReactNode;
  /** Secondary text on the right */
  hint?: ReactNode;
  lang?: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name (visually hidden) */
  label: string;
  icon?: IconName;
  /** Which edge of the trigger the list is aligned to */
  align?: 'start' | 'end';
  className?: string;
}

const GAP = 6;
const EDGE = 8;

const supportsPopover = () => typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

/**
 * Select-only combobox (WAI-ARIA APG pattern): focus stays on the trigger, the highlighted option is
 * announced through aria-activedescendant. The list lives in the top layer (Popover API), so the
 * header's backdrop-filter and overflow: hidden parents cannot clip it.
 */
export const Select = <T extends string>({
  value,
  options,
  onChange,
  label,
  icon,
  align = 'start',
  className,
}: SelectProps<T>) => {
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-opt-${String(index)}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', timer: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    const rect = trigger.getBoundingClientRect();
    list.style.minWidth = `${String(rect.width)}px`;
    const { offsetWidth: width, offsetHeight: height } = list;
    const below = rect.bottom + GAP;
    const fitsBelow = below + height <= window.innerHeight - EDGE;
    const fitsAbove = rect.top - GAP - height >= EDGE;
    const top = !fitsBelow && fitsAbove ? rect.top - GAP - height : below;
    const preferred = align === 'end' ? rect.right - width : rect.left;
    const left = Math.min(Math.max(EDGE, preferred), window.innerWidth - width - EDGE);
    list.style.top = `${String(top)}px`;
    list.style.left = `${String(left)}px`;
    setPlacement(!fitsBelow && fitsAbove ? 'top' : 'bottom');
  }, [align]);

  // Show / hide the popover and keep it glued to the trigger while the page scrolls
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (supportsPopover()) {
      const shown = list.matches(':popover-open');
      if (open && !shown) list.showPopover();
      if (!open && shown) list.hidePopover();
    }
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener('scroll', onMove, { capture: true, passive: true });
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, { capture: true });
      window.removeEventListener('resize', onMove);
    };
  }, [open, place]);

  // Click outside closes the list (manual popover: no light dismiss fighting the trigger's own click)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // optionId is derived from a stable useId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const show = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    setOpen(false);
    triggerRef.current?.focus();
    if (option && option.value !== value) onChange(option.value);
  };

  const textOf = (o: SelectOption<T>) =>
    (o.text ?? (typeof o.label === 'string' ? o.label : o.value)).toLowerCase();

  const typeAhead = (char: string) => {
    window.clearTimeout(typed.current.timer);
    typed.current.text += char.toLowerCase();
    typed.current.timer = window.setTimeout(() => (typed.current.text = ''), 600);
    const from = open ? active : selectedIndex;
    const ordered = [...options.slice(from + 1), ...options.slice(0, from + 1)];
    const match = ordered.find((o) => textOf(o).startsWith(typed.current.text));
    if (match) show(options.indexOf(match));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        show(e.key === 'Home' ? 0 : last);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typeAhead(e.key);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) choose(active);
        else setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
      case 'PageUp':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
      case 'PageDown':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
    }
  };

  // Portalled to <body>: page styles (a footer's `ul { display: grid }`, a card's `form` rules…) can't reach it,
  // and the Popover API puts it in the top layer above every stacking context.
  // Options are picked with the mouse here; the keyboard path goes through the combobox.
  const list = createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      aria-labelledby={labelId}
      popover="manual"
      hidden={!open && !supportsPopover()}
      className={styles.list}
      data-placement={placement}
      data-open={open ? '' : undefined}
      // Keep focus on the combobox while clicking an option
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        const index = Number((e.target as HTMLElement).closest('[data-index]')?.getAttribute('data-index'));
        if (Number.isInteger(index)) choose(index);
      }}
    >
      {options.map((o, i) => (
        <li
          key={o.value}
          id={optionId(i)}
          role="option"
          aria-selected={o.value === value}
          data-index={i}
          data-active={open && i === active ? '' : undefined}
          className={styles.option}
          lang={o.lang}
          onPointerMove={() => setActive(i)}
        >
          {o.lead !== undefined && <span className={styles.lead}>{o.lead}</span>}
          <span className={styles.label}>{o.label}</span>
          {o.hint !== undefined && <span className={styles.hint}>{o.hint}</span>}
          <Icon name="check" size={16} className={styles.check} />
        </li>
      ))}
    </ul>,
    document.body,
  );

  return (
    <div className={`${styles.select} ${className ?? ''}`}>
      <span id={labelId} className="visually-hidden">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className={styles.trigger}
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        {icon && <Icon name={icon} size={18} className={styles.icon} />}
        <span className={styles.value} lang={selected?.lang}>
          {selected?.short ?? selected?.label}
        </span>
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </button>
      {list}
    </div>
  );
};
