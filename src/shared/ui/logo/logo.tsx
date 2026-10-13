import styles from './logo.module.css';

/** The 工 ("craft") glyph sitting on a keycap — the brand mark. Placeholder until the real logo.svg. */
export const Logo = ({ compact }: { compact?: boolean }) => (
  <span className={styles.logo}>
    <svg viewBox="0 0 40 40" className={styles.mark} aria-hidden="true">
      <rect x="2" y="5" width="36" height="33" rx="9" className={styles.capEdge} />
      <rect x="2" y="2" width="36" height="31" rx="9" className={styles.cap} />
      <path d="M12 11h16M20 11v13M10 24h20" className={styles.glyph} />
    </svg>
    {!compact && (
      <span className={styles.word}>
        KŌBŌ<span className={styles.keys}>Keys</span>
      </span>
    )}
  </span>
);
