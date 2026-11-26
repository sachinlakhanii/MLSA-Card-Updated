import assert from 'node:assert/strict';
import { coverGeometry } from '../assets/js/export-photo.js';

for (const [sourceWidth, sourceHeight] of [[1000, 1500], [1600, 900], [1000, 1000]]) {
  for (const [width, height] of [[513, 506], [296, 336], [1539, 1518]]) {
    const frame = coverGeometry(sourceWidth, sourceHeight, width, height);
    assert.ok(Math.abs(frame.width / frame.height - sourceWidth / sourceHeight) < 1e-10);
    assert.ok(frame.width >= width - 1e-10 && frame.height >= height - 1e-10);
    assert.ok(Math.abs(frame.x - (width - frame.width) / 2) < 1e-10);
    assert.ok(Math.abs(frame.y - (height - frame.height) / 2) < 1e-10);
  }
}
const topLeft = coverGeometry(1000, 1500, 513, 506, 0, 0);
assert.ok(topLeft.x === 0 && topLeft.y === 0);
const bottomRight = coverGeometry(1600, 900, 513, 506, 1, 1);
assert.ok(Math.abs(bottomRight.x + bottomRight.width - 513) < 1e-10);
assert.ok(Math.abs(bottomRight.y + bottomRight.height - 506) < 1e-10);
assert.throws(() => coverGeometry(0, 100, 200, 200), RangeError);
console.log('Photo cover crops preserve source proportions and align to the selected position.');
