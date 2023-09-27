
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

export function isPlainString(target: unknown): target is string {
  return typeof target === 'string';
}

export function isString(target: unknown): target is string | String {
  return typeof target === 'string' || target instanceof String;
}
export function isFunction(target: unknown): target is Function {
  return typeof target === 'function';
}