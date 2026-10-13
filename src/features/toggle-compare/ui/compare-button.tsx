import { useTranslation } from 'react-i18next';

import { IconButton, toast } from '@/shared/ui';

import { COMPARE_LIMIT, useCompareStore } from '../model/compare-store';

export const CompareButton = ({ slug, name }: { slug: string; name: string }) => {
  const { t } = useTranslation();
  const active = useCompareStore((s) => s.slugs.includes(slug));
  const toggle = useCompareStore((s) => s.toggle);
  return (
    <IconButton
      icon="git-compare-arrows"
      active={active}
      label={active ? t('compare.remove', { name }) : t('compare.add', { name })}
      onClick={() => {
        if (!toggle(slug)) toast.info(t('compare.full', { count: COMPARE_LIMIT }));
      }}
    />
  );
};
