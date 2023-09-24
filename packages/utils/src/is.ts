
export function getTypeTag(variable: unknown) {
  return Object.prototype.toString.call(variable).slice(8, -1)
}

export function isPromiseByTag(promise: unknown): promise is Promise<unknown> {
  return getTypeTag(promise) === 'Promise';
}

export function isObject(target: unknown): target is Object {
  return typeof target === 'object' && target !== null;
}

export function isNil(target: unknown): target is null | undefined {
  return target === null || target === undefined;
}