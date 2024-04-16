export function isAbort(error: any) {
  return error.name === 'AbortError';
}
