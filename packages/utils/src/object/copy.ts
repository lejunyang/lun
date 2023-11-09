import { getTypeTag, isObject } from "../is";

function baseDeepCopy(obj: any, map: Map<Object, any>) {
  if (!isObject(obj)) return obj;
  if (map.has(obj)) return map.get(obj); // already been copied
  const type = getTypeTag(obj);
  let result: any = obj;
  switch (type) {
    case 'BigInt':
    case 'Boolean':
    case 'Number':
    case 'String':
      return Object(obj.valueOf());
    // don't copy Symbol、Promise、Function
    case 'Symbol':
    case 'Promise':
    case 'Function':
    case 'AsyncFunction':
    case 'Generator':
    case 'GeneratorFunction':
      return obj;
    case 'Map':
      result = new Map();
      map.set(obj, result);
      obj.forEach((value: any, key: any) => {
        // both key and value need deep copy
        result.set(baseDeepCopy(key, map), baseDeepCopy(value, map));
      });
      break;
    case 'Set':
      result = new Set();
      map.set(obj, result);
      obj.forEach((val: any) => {
        result.add(baseDeepCopy(val, map));
      });
      break;
    case 'FormData':
      result = new FormData();
      map.set(obj, result);
      result.forEach((value: any, key: any) => {
        result.append(key, baseDeepCopy(value, map));
      });
      break;
    case 'RegExp':
      return new RegExp(obj.source, obj.flags);
    case 'Date':
      return new Date(obj.getTime());
    case 'Blob':
      return obj.slice(0, obj.size, obj.type);
    case 'File':
      return new File([obj], obj.name, obj);
    case 'Object':
    case 'Array':
    default:
      // @ts-ignore use structuredClone to copy other types, if no structuredClone, treat it as an Object
      if (type !== 'Object' && type !== 'Array' && globalThis.structuredClone) return globalThis.structuredClone(obj);
      result = type === 'Array' ? Array(obj.length) : {};
      map.set(obj, result);
      Object.keys(obj).forEach((k) => {
        result[k] = baseDeepCopy(obj[k], map);
      });
      Object.getOwnPropertySymbols(obj).forEach((symbol) => {
        if (Object.prototype.propertyIsEnumerable.call(obj, symbol)) result[symbol] = baseDeepCopy(obj[symbol], map);
      });
      break;
  }
  return result;
}

export function deepCopy<T>(obj: T): T {
  const map = new Map();
  const res = baseDeepCopy(obj, map);
  map.clear();
  return res;
}