export function hsbToHsl(h: number, s: number, b: number) {
  const l2 = ((200 - s) * b) / 100;
  const sL = (s * b) / (l2 < 100 ? l2 : 200 - l2);
  return [h, sL, l2 / 2] as const;
}

export function hslToHsb(h: number, s: number, l: number) {
  s *= (l < 50 ? l : 100 - l) / 100;
  return [h, ((2 * s) / (l + s)) * 100, l + s] as const;
}
