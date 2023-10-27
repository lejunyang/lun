export * from './compare';
export * from './copy';
export * from './process';
export * from './value';

export function pick<T extends Record<string | symbol, any>, K extends keyof T = keyof T>(obj: T, keys: K[]) {
  return keys.reduce((result, current) => {
    result[current] = obj[current];
    return result;
  }, {} as Pick<T, K>)
}

export function omit<T extends Record<string | symbol, any>, K extends keyof T = keyof T>(obj: T, keys: K[]) {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// @ts-ignore
export const hasOwn = Object.hasOwn || Object.prototype.hasOwnProperty.call;