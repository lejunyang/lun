import { isArray, isObject } from '@lun/utils';
import { onBeforeUnmount, ref, watchEffect } from 'vue';

export type AutoUpdateLabel = { interval: number; values?: string[] };

export function useAutoUpdateLabel(props: { label?: string | AutoUpdateLabel }) {
  const labelRef = ref<string>();
  let i: number, timer: any;
  const clean = () => {
    i = 0;
    clearInterval(timer);
    timer = undefined;
  };
  watchEffect(() => {
    clean();
    const { label } = props;
    if (isObject(label)) {
      const { values, interval } = label as AutoUpdateLabel;
      const updateVal = () => {
        if (isArray(values) && values.length) {
          labelRef.value = values[i++];
          if (i >= values.length) i = 0;
        } else labelRef.value = String(label || '');
      };
      updateVal();
      if (interval > 0) timer = setInterval(updateVal, interval);
    } else labelRef.value = label;
  });
  onBeforeUnmount(clean);
  return labelRef;
}
