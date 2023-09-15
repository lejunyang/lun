
export function getTypeTag(variable: unknown) {
  const str = Object.prototype.toString.call(variable)
  return str.substring(8, str.length - 1);
}

export function isPromiseByTag(promise: unknown): promise is Promise<unknown> {
  return getTypeTag(promise) === 'Promise';
}