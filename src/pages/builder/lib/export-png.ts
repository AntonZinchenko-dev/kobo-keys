/** Renders the builder's SVG into a PNG via <canvas> and downloads it. */
export const exportSvgAsPng = async (svg: SVGSVGElement, fileName: string) => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = svg.viewBox.baseVal;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  // Resolve CSS variables used inside the SVG into real colours
  const styles = getComputedStyle(svg);
  clone.querySelectorAll<SVGElement>('[class]').forEach((el) => {
    const original = svg.querySelector(`.${CSS.escape(el.classList[0] ?? '')}`);
    if (original) el.setAttribute('fill', getComputedStyle(original).fill);
  });
  clone.style.color = styles.color;

  const data = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(url);

  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
