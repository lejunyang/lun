export function hsbToHsl(h: number, s: number, b: number) {
  const l2 = ((200 - s) * b) / 100;
  const sL = (s * b) / (l2 < 100 ? l2 : 200 - l2);
  return [h, sL, l2 / 2] as const;
}
