export * from './detect';
export * from './dom';
export * from './is';
export * from './isOverflow';
export * from './keyboard';
export * from './shadowDom';
export * from './style';
export * from './support';
export * from './text';

export function mimeTypeMatches(mimeType: string, pattern: string): boolean {
  if (mimeType === pattern) return true;
  const [mimeTypeMajor, mimeTypeMinor] = mimeType.split('/');
  const [patternMajor, patternMinor] = pattern.split('/');
  return (
    (patternMajor === '*' || mimeTypeMajor === patternMajor) && (patternMinor === '*' || mimeTypeMinor === patternMinor)
  );
}
