import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { useAddToCart } from '@/features/add-to-cart';
import { builderOptionsQuery, KeyboardPreview } from '@/entities/keyboard-build';
import {
  CUSTOM_BUILD_ID,
  decodeBuild,
  DEFAULT_BUILD,
  encodeBuild,
  type KeyboardBuild,
  priceBuild,
} from '@/shared/api';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { useMoney } from '@/shared/lib';
import { Button, Field, IconButton, Input, Skeleton, toast } from '@/shared/ui';

import { exportSvgAsPng } from '../lib/export-png';
import { useHistory } from '../model/use-history';

import styles from './builder-page.module.css';

const LIGHT_CLASS: Record<KeyboardBuild['lighting'], string | undefined> = {
  off: undefined,
  static: styles.lightStatic,
  breathing: styles.lightBreathing,
  wave: styles.lightWave,
};

const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <fieldset className={styles.step}>
    <legend>
      <span className={styles.stepN}>{n}</span>
      {title}
    </legend>
    {children}
  </fieldset>
);

export const BuilderPage = () => {
  const { t } = useTranslation('builder');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const money = useMoney();
  const [params, setParams] = useSearchParams();
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: options } = useQuery(builderOptionsQuery(lang));
  const history = useHistory<KeyboardBuild>(decodeBuild(params.get('b')) ?? DEFAULT_BUILD);
  const build = history.value;
  const addToCart = useAddToCart();
  const [today] = useState(() => Date.now());

  // Keep the share link in sync with the build
  const code = encodeBuild(build);
  useEffect(() => {
    setParams({ b: code }, { replace: true, preventScrollReset: true });
  }, [code, setParams]);

  if (!options) {
    return (
      <div className={`container ${styles.page}`}>
        <Skeleton style={{ height: 48, width: '50%' }} />
        <Skeleton style={{ aspectRatio: '16 / 7', marginTop: 24 }} />
      </div>
    );
  }

  const price = priceBuild(build, options);
  const update = (patch: Partial<KeyboardBuild>) => history.set({ ...build, ...patch });
  const caseLabel = options.cases.find((c) => c.id === build.case)?.label ?? '';
  const capsLabel = options.keycaps.find((k) => k.id === build.keycaps)?.label ?? '';
  const ready = new Date(today + options.buildDays * 86_400_000);

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    toast.success(tc('actions.copied'), { description: t('shareHint') });
  };

  const add = () => {
    if (!price) return;
    addToCart.mutate({
      productId: CUSTOM_BUILD_ID,
      variantKey: code,
      qty: 1,
      snapshot: {
        name: t('customBuild'),
        unitPrice: price.total,
        variantLabel: [build.layout.toUpperCase(), caseLabel, capsLabel].join(' · '),
      },
      source: null,
    });
  };

  const choice = (
    key: string,
    selected: boolean,
    onClick: () => void,
    children: ReactNode,
    style?: CSSProperties,
    label?: string,
  ) => (
    <button
      key={key}
      type="button"
      className={clsx(styles.choice, selected && styles.selected)}
      aria-pressed={selected}
      onClick={onClick}
      style={style}
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('title')} — KŌBŌ Keys`}</title>
      <meta name="description" content={t('lead')} />

      <header className={styles.head}>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>

      <div className={styles.layout}>
        <section className={styles.stage} aria-label={t('preview')}>
          <div className={styles.previewWrap}>
            <KeyboardPreview
              ref={svgRef}
              build={build}
              options={options}
              title={t('previewTitle', {
                layout: build.layout.toUpperCase(),
                caseName: caseLabel,
                caps: capsLabel,
              })}
            />
          </div>
          <div className={styles.toolbar}>
            <IconButton icon="undo-2" label={t('undo')} disabled={!history.canUndo} onClick={history.undo} />
            <IconButton icon="redo-2" label={t('redo')} disabled={!history.canRedo} onClick={history.redo} />
            <span className={styles.spacer} />
            <output className={styles.livePrice} aria-live="polite" aria-label={t('total')}>
              {price ? money(price.total) : '—'}
            </output>
            <IconButton icon="share-2" label={t('share')} onClick={() => void share()} />
            <IconButton
              icon="download"
              label={t('download')}
              onClick={() =>
                svgRef.current && void exportSvgAsPng(svgRef.current, `kobo-build-${build.layout}.png`)
              }
            />
          </div>
        </section>

        <div className={styles.panel}>
          <Step n={1} title={t('steps.layout')}>
            <div className={styles.grid4}>
              {options.layouts.map((l) =>
                choice(
                  l.id,
                  build.layout === l.id,
                  () => update({ layout: l.id }),
                  <>
                    <strong>{l.label}</strong>
                    <span>{t('keys', { count: l.keys })}</span>
                  </>,
                ),
              )}
            </div>
          </Step>

          <Step n={2} title={t('steps.case')}>
            <div className={styles.swatches}>
              {options.cases.map((c) => (
                <span key={c.id} className={styles.swatchItem}>
                  {choice(
                    c.id,
                    build.case === c.id,
                    () => update({ case: c.id }),
                    null,
                    { '--swatch': c.color } as CSSProperties,
                    c.label,
                  )}
                  <span>{c.label}</span>
                </span>
              ))}
            </div>
          </Step>

          <Step n={3} title={t('steps.keycaps')}>
            <div className={styles.grid3}>
              {options.keycaps.map((k) =>
                choice(
                  k.id,
                  build.keycaps === k.id,
                  () => update({ keycaps: k.id }),
                  <>
                    <span className={styles.capsPreview} aria-hidden="true">
                      <i style={{ background: k.alpha }} />
                      <i style={{ background: k.mod }} />
                      <i style={{ background: k.accent }} />
                    </span>
                    <strong>{k.label}</strong>
                  </>,
                ),
              )}
            </div>
          </Step>

          <Step n={4} title={t('steps.switches')}>
            <div className={styles.grid2}>
              {options.switches.map((s) =>
                choice(
                  s.id,
                  build.switch === s.id,
                  () => update({ switch: s.id }),
                  <>
                    <span className={styles.switchDot} style={{ background: s.color }} aria-hidden="true" />
                    <strong>{s.label}</strong>
                    <span>{t(`switchType.${s.type}`)}</span>
                  </>,
                ),
              )}
            </div>
          </Step>

          <Step n={5} title={t('steps.lighting')}>
            <div className={styles.grid4}>
              {options.lighting.map((l) =>
                choice(
                  l.id,
                  build.lighting === l.id,
                  () => update({ lighting: l.id }),
                  <>
                    <span className={clsx(styles.lightDot, LIGHT_CLASS[l.id])} aria-hidden="true" />
                    <strong>{l.label}</strong>
                  </>,
                ),
              )}
            </div>
          </Step>

          <Step n={6} title={t('steps.engraving')}>
            <Field
              label={t('engravingLabel')}
              hint={t('engravingHint', {
                count: options.engraving.maxLength,
                price: money(options.engraving.price),
              })}
            >
              <Input
                value={build.engraving}
                maxLength={options.engraving.maxLength}
                placeholder="KŌBŌ"
                onChange={(e) => update({ engraving: e.target.value })}
              />
            </Field>
          </Step>

          <div className={styles.summary}>
            <div className={styles.totalRow}>
              <button type="button" className={styles.total} popoverTarget="price-breakdown">
                <span>{t('total')}</span>
                <strong>{price ? money(price.total) : '—'}</strong>
                <span className={styles.infoHint}>{t('breakdown')}</span>
              </button>
              <div id="price-breakdown" popover="auto" className={styles.breakdown}>
                <h3>{t('breakdown')}</h3>
                {price && (
                  <dl>
                    {Object.entries(price.parts).map(([part, value]) => (
                      <div key={part}>
                        <dt>{t(`parts.${part as keyof typeof price.parts}`)}</dt>
                        <dd>{money(value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
            <p className={styles.ready}>
              {t('ready', {
                date: new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: 'numeric', month: 'long' }).format(
                  ready,
                ),
              })}
            </p>
            <Button size="lg" block icon="shopping-bag" loading={addToCart.isPending} onClick={add}>
              {t('addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
