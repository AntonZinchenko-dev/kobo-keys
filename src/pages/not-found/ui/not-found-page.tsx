import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { playSwitchSound } from '@/shared/lib';
import { Button, ButtonLink, Picture } from '@/shared/ui';

import styles from './not-found-page.module.css';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const SECONDS = 30;

/** 404 with a typing-speed mini game on a virtual keyboard — something to do instead of leaving. */
export const NotFoundPage = () => {
  const { t } = useTranslation('account');
  const lang = useLang();
  const words = useMemo(() => t('game.words').split(' '), [t]);
  const [text, setText] = useState('');
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const target = words.join(' ');

  const elapsed = started ? Math.min(SECONDS, (now - started) / 1000) : 0;
  const finished = started !== null && (elapsed >= SECONDS || text.length >= target.length);
  const correct = Array.from(text).filter((ch, i) => ch === target[i]).length;
  const wpm = elapsed > 0 ? Math.round(correct / 5 / (elapsed / 60)) : 0;
  const accuracy = text.length ? Math.round((correct / text.length) * 100) : 100;

  useEffect(() => {
    if (!started || finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [started, finished]);

  const restart = () => {
    setText('');
    setStarted(null);
    input.current?.focus();
  };

  return (
    <div className={`container ${styles.page}`}>
      <title>{`404 — KŌBŌ Keys`}</title>
      <div className={styles.head}>
        <div className={styles.mascot}>
          <Picture slot="mascot/not-found" alt="" ratio={1} sizes="120px" />
        </div>
        <div>
          <p className={styles.code}>404</p>
          <h1>{t('game.title')}</h1>
          <p className={styles.muted}>{t('game.lead')}</p>
          <ButtonLink to={paths.home(lang)} variant="secondary" icon="house">
            {t('game.home')}
          </ButtonLink>
        </div>
      </div>

      <section className={styles.game} aria-labelledby="game-title">
        <h2 id="game-title">{t('game.gameTitle')}</h2>
        <p className={styles.target} aria-hidden="true">
          {Array.from(target).map((ch, i) => (
            <span
              key={i}
              className={clsx(
                i < text.length && (text[i] === ch ? styles.ok : styles.bad),
                i === text.length && styles.caret,
              )}
            >
              {ch}
            </span>
          ))}
        </p>
        <input
          ref={input}
          className={styles.input}
          value={text}
          disabled={finished}
          aria-label={t('game.inputLabel', { text: target })}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onKeyDown={(e) => {
            setPressed(e.key.toLowerCase());
            if (e.key.length === 1) playSwitchSound('linear');
          }}
          onKeyUp={() => setPressed(null)}
          onChange={(e) => {
            if (!started) {
              setStarted(Date.now());
              setNow(Date.now());
            }
            setText(e.target.value.slice(0, target.length));
          }}
          placeholder={t('game.placeholder')}
        />
        <div className={styles.keyboard} aria-hidden="true">
          {ROWS.map((row) => (
            <div key={row} className={styles.row}>
              {Array.from(row).map((k) => (
                <span
                  key={k}
                  className={clsx(
                    styles.key,
                    pressed === k && styles.down,
                    target[text.length] === k && styles.next,
                  )}
                >
                  {k}
                </span>
              ))}
            </div>
          ))}
          <div className={styles.row}>
            <span
              className={clsx(
                styles.key,
                styles.space,
                pressed === ' ' && styles.down,
                target[text.length] === ' ' && styles.next,
              )}
            />
          </div>
        </div>
        <div className={styles.stats} aria-live="polite">
          <span>
            {t('game.time')}: <strong>{Math.ceil(SECONDS - elapsed)}</strong>
          </span>
          <span>
            WPM: <strong>{wpm}</strong>
          </span>
          <span>
            {t('game.accuracy')}: <strong>{accuracy}%</strong>
          </span>
        </div>
        {finished && (
          <div className={styles.result}>
            <p>{t('game.result', { wpm, accuracy })}</p>
            <Button icon="refresh-cw" onClick={restart}>
              {t('game.again')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
