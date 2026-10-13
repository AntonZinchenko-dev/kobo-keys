/**
 * The product image "flies" into the cart icon. A clone of the image is animated with the
 * Web Animations API along a curve; the cart icon then gives a little bounce.
 */
export const flyToCart = (source: HTMLElement | null | undefined) => {
  if (!source || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const image = source.querySelector('img') ?? source.closest('article')?.querySelector('img');
  const target = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].find(
    (el) => el.offsetParent !== null,
  );
  if (!image || !target) return;

  const from = image.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, 140);
  const clone = image.cloneNode() as HTMLImageElement;
  Object.assign(clone.style, {
    position: 'fixed',
    zIndex: '2000',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'cover',
    borderRadius: '20px',
    pointerEvents: 'none',
    opacity: '1',
    filter: 'none',
    boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.5)',
  });
  document.body.append(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = clone.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(0.55) rotate(-8deg)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.4 },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
  );
  animation.onfinish = () => {
    clone.remove();
    target.animate([{ scale: 1 }, { scale: 1.25 }, { scale: 1 }], { duration: 400, easing: 'ease-out' });
  };
};
