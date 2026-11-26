/* Shared application state and constants */
export const DIM = { wide: [1080, 1012], badge: [1080, 1700] };

export const state = {
  mode: 'create',
  side: 'front',
  verificationUrl: null,
  layout: 'wide',   // 'wide' | 'badge'
  light: false,     // card theme
  photo: null,      // data URL shown on the card (after crop/filters)
  srcImg: null      // original uploaded image (kept so it can be edited again)
};
