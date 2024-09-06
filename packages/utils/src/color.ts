export function hsbToHsl(h: number, s: number, b: number) {
  const l2 = ((200 - s) * b) / 100;
  const sL = (s * b) / (l2 < 100 ? l2 : 200 - l2);
  return [h, sL, l2 / 2] as const;
}

export function hslToHsb(h: number, s: number, l: number) {
  s *= (l < 50 ? l : 100 - l) / 100;
  return [h, ((2 * s) / (l + s)) * 100, l + s] as const;
}

/**
 * @link https://drafts.csswg.org/css-color-4/#rgb-to-hsl
 * @param {number} r - Red component 0..1
 * @param {number} g - Green component 0..1
 * @param {number} b - Blue component 0..1
 * @return Array of HSL values: Hue as degrees 0..360, Saturation and Lightness in reference range [0,100]
 */
export function rgbToHsl(r: number, g: number, b: number) {
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let [h, s, l] = [NaN, 0, (min + max) / 2];
  let d = max - min;

  if (d !== 0) {
    s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
    }

    h = h * 60;
  }

  // Very out of gamut colors can produce negative saturation
  // If so, just rotate the hue by 180 and use a positive saturation
  // see https://github.com/w3c/csswg-drafts/issues/9222
  if (s < 0) {
    h += 180;
    s = Math.abs(s);
  }

  if (h >= 360) {
    h -= 360;
  }

  return [h, s * 100, l * 100];
}
