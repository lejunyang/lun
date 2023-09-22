
/**
 * transform an nested path-like string 'a.b[c][0].d' into ['a', 'b', 'c', '0', 'd']\
 * [0].a => ['0', 'a']\
 * a["b"]['c']['d"] => ['a', 'b', 'c', \`'d"`]\
 * a[][b] => ['a', 'b']\
 * a..b => ['a', 'b']\
 * a[[b]]c => ['a', '[b]', 'c']
 */
export function stringToPath(path?: string): string[] {
  if (!path || !path.replace) return [];
  return path
    .replace(/\[(['"`]?)(.*?)(['"`]?)]/g, (_match: string, $1: string, $2: string, $3: string) => {
      if ($1 === $3) return '.' + $2;
      else return '.' + $1 + $2 + $3;
    })
    .split('.')
    .filter(Boolean);
}

export interface ObjectGet {
  <T = any>(object: any, path: string | (string | number | symbol)[]): T;
  <T = any>(object: any, path: string | (string | number | symbol)[], defaultValue: T): T;
}
/**
 * 
 * @param object 
 * @param path string like a.b[c][0].d，or array like ['a', 'b', 'c', 0, 'd']
 * @param defaultVal if result is undefined or null, return defaultVal
 */
export const objectGet: ObjectGet = (object: any, path: string | (string | number | symbol)[], defaultVal?: any) => {
  if (object == null) return defaultVal ?? undefined;
  const newPath = Array.isArray(path) ? path : stringToPath(path);
  if (!newPath.length) return defaultVal ?? undefined;
  return (
    newPath.reduce((o, k) => {
      if (o == null) return o;
      else return o[k];
    }, object) ?? defaultVal
  );
};

/**
 * assign a value to an object according to the path
 * {}, 'a[0].b', 1 => { a: [{ b: 1 }]}
 * { a: {} }, 'a[0].b', 1 => { a: [{ b: 1 }]}
 */
export function objectSet<T>(object: T, path: string | string[], value: any, ignoreOriginalValue = true) {
  if (!object || typeof object !== 'object') return object;
  const newPath = Array.isArray(path) ? path : stringToPath(path);
  newPath.reduce((obj, p, i) => {
    const nextIsArray = Number.isInteger(+newPath[i + 1]);
    if (i === newPath.length - 1 && (ignoreOriginalValue || !(p in obj))) {
      obj[p] = value;
    } else if (!(p in obj) || typeof obj[p] !== 'object' || !obj[p]) {
      obj[p] = nextIsArray ? [] : {};
    } else if (nextIsArray && !Array.isArray(obj[p])) {
      obj[p] = [];
    }
    return obj[p];
  }, object as any);
  return object;
}