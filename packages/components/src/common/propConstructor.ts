import { PropType } from 'vue';
import { Constructor, UnwrapPrimitive } from '@lun/utils';

const createPropFactory = <Presets extends Constructor[]>(...types: Presets) => {
  return <T extends UnwrapPrimitive<InstanceType<Presets[number]>>, C extends Constructor[] = []>(
    ...constructors: C
  ) => {
    return {
      type: [...types, ...constructors] as unknown as PropType<T | InstanceType<C[number]>>,
    };
  };
};

export const PropString = createPropFactory(String);
export const PropNumber = createPropFactory(Number, String);
export const PropBoolean = createPropFactory(Boolean);
export const PropBoolOrFunc = createPropFactory(Boolean, Function);
export const PropObject = createPropFactory(Object);
export const PropArray = createPropFactory(Array);
export const PropFunction = createPropFactory(Function);
export const PropObjOrFunc = createPropFactory(Object, Function);
export const PropObjOrStr = createPropFactory(Object, String);
export const PropObjOrBool = createPropFactory(Boolean, Object);
export const PropStrOrArr = createPropFactory(String, Array as Constructor<string[] | null>);

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
