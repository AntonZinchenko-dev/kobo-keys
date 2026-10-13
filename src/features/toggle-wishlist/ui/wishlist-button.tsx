import { useTranslation } from 'react-i18next';

import { IconButton } from '@/shared/ui';

import { useWishlistStore } from '../model/wishlist-store';

export const WishlistButton = ({ slug, name }: { slug: string; name: string }) => {
  const { t } = useTranslation();
  const active = useWishlistStore((s) => s.slugs.includes(slug));
  const toggle = useWishlistStore((s) => s.toggle);
  return (
    <IconButton
      icon="heart"
      active={active}
      label={active ? t('wishlist.remove', { name }) : t('wishlist.add', { name })}
      onClick={() => toggle(slug)}
    />
  );
};
