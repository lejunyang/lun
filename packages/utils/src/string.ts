import { isString } from "./is";

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function uncapitalize(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * transform an nested path-like string 'a.b[c][0].d' into ['a', 'b', 'c', '0', 'd']\
 * [0].a => ['0', 'a']\
 * a["b"]['c']['d"] => ['a', 'b', 'c', \`'d"`]\
 * a[][b] => ['a', 'b']\
 * a..b => ['a', 'b']\
 * a[[b]]c => ['a', '[b]', 'c']
 */
export function stringToPath(path?: string): string[] {
  if (!isString(path)) return [];
  return path
    .replace(/\[(['"`]?)(.*?)(['"`]?)]/g, (_match: string, $1: string, $2: string, $3: string) => {
      if ($1 === $3) return '.' + $2;
      else return '.' + $1 + $2 + $3;
    })
    .split('.')
    .filter(Boolean);
}
