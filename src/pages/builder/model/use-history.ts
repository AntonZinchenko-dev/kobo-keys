import { useCallback, useEffect, useState } from 'react';

/** Undo / redo for the builder; Ctrl+Z and Ctrl+Shift+Z (or Ctrl+Y) work anywhere on the page. */
export const useHistory = <T>(initial: T) => {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });

  const set = useCallback(
    (next: T) => setState((s) => ({ past: [...s.past.slice(-49), s.present], present: next, future: [] })),
    [],
  );
  const undo = useCallback(
    () =>
      setState((s) =>
        s.past.length === 0
          ? s
          : { past: s.past.slice(0, -1), present: s.past.at(-1) as T, future: [s.present, ...s.future] },
      ),
    [],
  );
  const redo = useCallback(
    () =>
      setState((s) =>
        s.future.length === 0
          ? s
          : { past: [...s.past, s.present], present: s.future[0] as T, future: s.future.slice(1) },
      ),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea')) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return {
    value: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
};
