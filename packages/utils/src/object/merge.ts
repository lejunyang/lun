import { getTypeTag, isNil, isObject } from '../is';
import { capitalize, uncapitalize } from '../string';
import { deepCopy } from './copy';
import { objectGet } from './value';

// /**
//  * property of `source` will overwrite target only when related property of `target` is null or undefined\
//  * Array and function value will be merged according to the array merge strategy\
//  * ignore circular refer
//  * @param target
//  * @param source
//  */
// export function simpleDeepMerge<
// 	OTarget extends Record<string | symbol | number, unknown>,
// 	OSource extends Record<string | symbol | number, unknown>
// >(
// 	target: OTarget,
// 	source: OSource,
// 	strategy?: {
// 		// two array merge, merging each item of array is not considered
// 		// strict means both sides need to an array, soft means one side can be not array type(target: 1, source: [2, 3] => [1, 2, 3])
// 		array: 'strictPush' | 'strictUnshift' | 'softPush' | 'softUnshift' | 'keep' | 'overwrite';
// 		func: 'merge' | 'keep' | 'overwrite';
// 	}
// ) {
// 	// const { array = 'softPush', func = 'merge' } = (strategy || {});
// }

/** Except for Any and Nil，other types are derived from Object.prototype.toString.call(target).slice(8, -1). Not all types */
type NativeType =
  | 'Any'
  | 'Nil'
  | 'Number'
  | 'String'
  | 'Boolean'
  | 'BigInt'
  | 'Function'
  | 'AsyncFunction'
  | 'Promise'
  | 'Object'
  | 'Array'
  | 'Symbol'
  | 'RegExp'
  | 'Date'
  | 'Generator'
  | 'GeneratorFunction'
  | 'File'
  | 'FormData'
  | 'Blob'
  | 'Null'
  | 'Undefined'
  | 'Set'
  | 'Map'
  | 'WeakSet'
  | 'WeakMap'
  | 'WeakRef'
  | 'Error';

/**
 * keep: keep the value in the target\
 * override: use the value of the source to overwrite target\
 * copy：same as override，but use deepCopy\
 * Function: custom，will assign the return value to the target
 */
export type DeepMergeStrategy =
  | 'keep'
  | 'override'
  | 'copy'
  | ((args: {
      sourceValue: any;
      sourceValueType: string;
      targetValue: any;
      targetValueType: string;
      path: (string | symbol)[];
      source: any;
      target: any;
    }) => any);
export type DeepMergeOptionKey = `${Uncapitalize<NativeType>}To${Capitalize<NativeType>}`;
export type DeepMergePathOptions = {
  [path: string]: DeepMergeStrategy | DeepMergePathOptions;
};
export type DeepMergeOptions = {
  [key in DeepMergeOptionKey]?: DeepMergeStrategy;
} &
  DeepMergePathOptions;

const getTypeConfigPath = (sourceType: string, targetType: string) => `${sourceType}To${targetType}`;
const isMergeStrategy = (s: any): s is DeepMergeStrategy => {
  if (typeof s === 'function') return true;
  else return ['override', 'keep', 'copy'].includes(s);
};
export const defaultMergeOptions: DeepMergeOptions = {
  objectToNil: 'copy',
  // 原始值assign到对象上保持Object.assign的逻辑，字符串特殊处理，其他类型则保持对象不变
  stringToObject: ({ sourceValue, targetValue, targetValueType }) => {
    if (targetValueType === 'Array') return [...targetValue, sourceValue]; // 由于stringToObject对于stringToArray也会生效，Array单独处理
    return Object.assign(targetValue, sourceValue);
  },
  numberToObject: 'keep',
  booleanToObject: 'keep',
  bigIntToObject: 'keep',
  symbolToObject: 'keep',
  functionToObject: 'keep',
  // 默认将数组展开合并
  arrayToArray: ({ sourceValue, targetValue }) => [...targetValue, ...sourceValue],
  anyToArray: ({ sourceValue, targetValue }) => (isNil(sourceValue) ? targetValue : [...targetValue, sourceValue]),
  arrayToAny: ({ sourceValue, targetValue }) => (isNil(targetValue) ? targetValue : [...targetValue, sourceValue]),
};

/**
 * 深合并，将source的所有可枚举键值合并到target上，可以处理循环引用，可以自定义某些类型和某个字段的合并策略
 * @param {TargetType} target
 * @param {SourceType} source
 * @param {?DeepMergeOptions} [mergeOptions]
 * 其可以配置具体到对象某个路径值的merge策略，如 `{ path: { a: 'keep' } }`，那么在合并过程遇到`path.a`之后便会采用keep保留target中的值\
 * 也可以配置某个类型到某个类型的合并策略，例如 `{ objectToNull: 'copy' }` 指的是对象往null上合并时的策略为深拷贝\
 * 针对类型的配置，配置的key遵循`{sourceValueType}To{TargetValueType}`的格式\
 * 其中`sourceValueType`必须首字母小写，`TargetValueType`必须首字母大写\
 * 这个Type是由`Object.prototype.toString.call(target).slice(8, -1)`得到，并且还有两个特殊值nil和any可以使用
 */
export function deepMerge<TargetType extends object = any, SourceType extends object = any>(
  target: TargetType,
  source: SourceType,
  mergeOptions?: DeepMergeOptions
): TargetType & SourceType {
  // 如果source不是对象则与Object.assign逻辑保持一致。null或undefined会被忽略，如果是原始值则会转化为对象，而包装类中只有String有自己的enumerable properties，故只考虑string
  if (typeof source === 'string') return Object.assign(target, source);
  else if (typeof source !== 'object') return Object(target);

  const finalMergeOptions = { ...defaultMergeOptions, ...mergeOptions };
  const map = new Map();

  const internalMerge = (_target: any, _source: any, path: (string | symbol)[]) => {
    if (map.get(_source)) return map.get(_source); // 有循环引用
    let mergeStrategy: DeepMergeStrategy = objectGet(finalMergeOptions, path); // 优先取对应路径的配置
    const targetType = capitalize(getTypeTag(_target));
    const sourceType = uncapitalize(getTypeTag(_source));
    if (!mergeStrategy) {
      // 没有针对对象路径做配置的话，则用类型取匹配配置
      const mergeConfigPath = [
        getTypeConfigPath(sourceType, targetType),
        // object的配置也适用于其他任意对象
        isObject(_source) && getTypeConfigPath('object', targetType),
        isObject(_target) && getTypeConfigPath(sourceType, 'Object'),
        // nil的配置也适用于null和undefined
        isNil(_source) && getTypeConfigPath('nil', targetType),
        isNil(_target) && getTypeConfigPath(sourceType, 'Nil'),
        // function的配置也适用于asyncFunction
        sourceType === 'function' && getTypeConfigPath('asyncFunction', targetType),
        targetType === 'function' && getTypeConfigPath(sourceType, 'AsyncFunction'),
        // any可代表任意类型
        getTypeConfigPath('any', targetType),
        getTypeConfigPath(sourceType, 'Any'),
        'anyToAny',
      ];
      for (const p of mergeConfigPath) {
        if (!p) continue;
        const s = finalMergeOptions[p];
        if (isMergeStrategy(s)) {
          mergeStrategy = s;
          break;
        }
      }
    }
    if (mergeStrategy === 'keep') return _target;
    else if (mergeStrategy === 'copy') return deepCopy(_source);
    else if (mergeStrategy === 'override') return _source;
    else if (typeof mergeStrategy === 'function')
      return mergeStrategy({
        sourceValue: _source,
        sourceValueType: sourceType,
        targetValue: _target,
        targetValueType: targetType,
        source,
        target,
        path,
      });
    else if (_source && typeof _source === 'object') {
      if (typeof _target !== 'object' || !_target) _target = Object(_target);
      map.set(_source, _target);
      Object.keys(_source).forEach((key) => {
        _target[key] = internalMerge(_target[key], _source[key], [...path, key]);
      });
      // 处理symbol，这里需要忽略不可enumerable的symbol
      Object.getOwnPropertySymbols(_source).forEach((sym) => {
        if (Object.prototype.propertyIsEnumerable.call(_source, sym))
          _target[sym] = internalMerge(_target[sym], _source[sym], [...path, sym]);
      });
      return _target;
    } else if (isNil(_source))
      // source没有值时，保留target
      return _target;
    else return _source; // 其他情况默认用source覆盖target
  };
  const result = internalMerge(target, source, []);
  map.clear();
  return result;
}