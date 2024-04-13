import { isFunction } from '@lun/utils';

export function mergeRefs<T>(...refs: Array<React.RefCallback<T> | React.MutableRefObject<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (isFunction(ref)) ref(value);
      else if (ref && 'current' in ref) ref.current = value;
    });
  };
}
