import { PropType, TransitionProps } from 'vue';
import { Constructor, UnwrapPrimitive, cacheFunctionByParams } from '@lun-web/utils';
import { Responsive } from '../hooks/useBreakpoint';

const createPropFactory = <Presets extends Constructor[]>(...types: Presets) => {
  return <
    T extends UnwrapPrimitive<InstanceType<Presets[number]>> = UnwrapPrimitive<InstanceType<Presets[number]>>,
    C extends Constructor[] = [],
  >(
    ...constructors: C
  ) => {
    return {
      type: [...types, ...constructors] as unknown as PropType<T | UnwrapPrimitive<InstanceType<C[number]>>>,
    };
  };
};

const objConstructor = Object as Constructor<Record<string, any>>;
export const PropString = cacheFunctionByParams(createPropFactory(String));
export const PropNumber = cacheFunctionByParams(createPropFactory(Number, String));
export const PropBoolean = cacheFunctionByParams(createPropFactory(Boolean));
export const PropBoolOrStr = cacheFunctionByParams(createPropFactory(Boolean, String));
export const PropBoolOrFunc = cacheFunctionByParams(createPropFactory(Boolean, Function));
export const PropObject = cacheFunctionByParams(createPropFactory(objConstructor));
export const PropArray = cacheFunctionByParams(createPropFactory(Array));
export const PropSet = cacheFunctionByParams(createPropFactory(Set, Array));
export const PropFunction = cacheFunctionByParams(createPropFactory(Function));
export const PropObjOrFunc = cacheFunctionByParams(createPropFactory(objConstructor, Function));
export const PropObjOrStr = cacheFunctionByParams(createPropFactory(objConstructor, String));
export const PropObjOrBool = cacheFunctionByParams(createPropFactory(Boolean, objConstructor));
export const PropStrOrArr = cacheFunctionByParams(createPropFactory(String, Array as Constructor<string[] | null>));
export const PropNumOrArr = cacheFunctionByParams(
  createPropFactory(String, Number, Array as Constructor<string[] | number[] | null>),
);
export const PropStrOrFunc = cacheFunctionByParams(createPropFactory(String, Function));
export const PropNumOrFunc = cacheFunctionByParams(createPropFactory(Number, String, Function));

export const Prop = <T>() =>
  ({} as any as {
    type: PropType<T>;
  });

/**
 * it's for prop 'value' of some components, like select-option, checkbox, radio... their value can be anything but empty string ''
 * we need to add type Boolean to let vue transform the empty string to boolean true, and need to add default undefined in case it defaults to boolean false
 */
export const valueProp = { ...PropBoolOrStr(Object, Number), default: undefined };

export const PropResponsive = cacheFunctionByParams(createPropFactory(Object, Number, String)) as <T>() => {
  type: PropType<Responsive<T>>;
};

export const transitionProp = PropObjOrStr<string | TransitionProps>();

export const sizeProp = PropResponsive<string | number>();

/** it's for prop like 'open', whose default value must be undefined */
export const undefBoolProp = { type: Boolean, default: undefined };

// const test = {
//   str: PropString<'const'>(),
//   strRegex: PropString(RegExp),
//   strArr: PropStrOrArr(),
//   num: PropNumber(),
//   bool: PropBoolean(),
//   obj: PropObject(),
//   arr: PropArray(),
//   func: PropFunction(),
//   objOrFunc: PropObjOrFunc(),
//   objOrStr: PropObjOrStr(),
// };

// type T = import('vue').ExtractPropTypes<typeof test>;
