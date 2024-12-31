import { cacheFunctionByKey } from './function';
import { isRegExp, isString } from './is';

export function capitalize<S extends string>(str: S) {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;
}

export function uncapitalize<S extends string>(str: S) {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<S>;
}

/**
 * transform an nested path-like string 'a.b[c][0].d' into ['a', 'b', 'c', '0', 'd']\
 * [0].a => ['0', 'a']\
 * a["b"]['c']['d"] => ['a', 'b', 'c', \`'d"`]\
 * a[][b] => ['a', 'b']\
 * a..b => ['a', 'b']\
 * a[[b]]c => ['a', '[b]', 'c']
 */
export const stringToPath = cacheFunctionByKey((path?: string): string[] => {
  if (!isString(path)) return [];
  return path
    .replace(/\[(['"`]?)(.*?)(['"`]?)]/g, (_match: string, $1: string, $2: string, $3: string) => {
      if ($1 === $3) return '.' + $2;
      else return '.' + $1 + $2 + $3;
    })
    .split('.')
    .filter(Boolean);
});

export function toRegExp(pattern: string | RegExp, flags?: string) {
  if (isRegExp(pattern)) return pattern;
  else return new RegExp(pattern, flags);
}

const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cacheFunctionByKey((str: string) => str.replace(hyphenateRE, '-$1').toLowerCase());
