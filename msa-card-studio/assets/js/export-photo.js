/* Bake the preview's cover crop before html2canvas, which does not preserve object-fit. */
import { loadImage } from './utils.js';

export function coverGeometry(sourceWidth, sourceHeight, width, height, positionX = .5, positionY = .5) {
  if (![sourceWidth, sourceHeight, width, height].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Photo dimensions must be positive.');
  }
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale, drawHeight = sourceHeight * scale;
  return { x: (width - drawWidth) * positionX, y: (height - drawHeight) * positionY, width: drawWidth, height: drawHeight };
}

function position(value, freeSpace, scale) {
  if (value.endsWith('%')) return freeSpace * parseFloat(value) / 100;
  if (value.endsWith('px')) return parseFloat(value) * scale;
  if (value === 'left' || value === 'top') return 0;
  if (value === 'right' || value === 'bottom') return freeSpace;
  return freeSpace / 2;
}

export async function prepareExportPhotos(card, scale) {
  await Promise.all(Array.from(card.querySelectorAll('.ph-img')).map(async photo => {
    const style = getComputedStyle(photo);
    if (!photo.getAttribute('src') || style.display === 'none') return;
    const source = await loadImage(photo.src);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(photo.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(photo.clientHeight * scale));
    const frame = coverGeometry(source.naturalWidth, source.naturalHeight, canvas.width, canvas.height);
    const [x = '50%', y = '50%'] = style.objectPosition.split(/\s+/);
    frame.x = position(x, canvas.width - frame.width, scale);
    frame.y = position(y, canvas.height - frame.height, scale);
    canvas.getContext('2d').drawImage(source, frame.x, frame.y, frame.width, frame.height);
    // Only this off-screen clone changes. The editor keeps the original photo and crop.
    photo.src = canvas.toDataURL('image/png');
    photo.style.objectFit = 'fill';
    photo.style.objectPosition = '0 0';
    await photo.decode();
  }));
}
