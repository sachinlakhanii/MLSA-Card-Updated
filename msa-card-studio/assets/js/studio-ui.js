/* Interface labels follow the actual selected preview layout. */
export function initStudioUI() {
  const update = () => {
    const portrait = document.getElementById('lyBadge').getAttribute('aria-pressed') === 'true';
    document.getElementById('previewMode').textContent = (portrait ? 'Portrait card' : 'Wide card') + (document.getElementById('sideBack').getAttribute('aria-pressed') === 'true' ? ' - Back' : '');
    const download = document.getElementById('dl');
    if (!download.disabled) download.textContent = portrait ? 'Download front + back PNG' : 'Download PNG';
    document.getElementById('dlNote').textContent = portrait ? 'One PNG: back left, front right. Both at the same resolution.' : 'High resolution PNG - front only.';
    document.getElementById('previewDimensions').textContent = portrait ? '1080 \u00d7 1700 px' : '1080 \u00d7 1012 px';
  };
  for (const id of ['lyWide', 'lyBadge']) document.getElementById(id).addEventListener('click', update);
  document.addEventListener('card-side-change', update);
  update();
}
