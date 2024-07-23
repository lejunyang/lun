import { isArray, isObject } from '@lun/utils';
import { onBeforeUnmount, ref, watchEffect } from 'vue';

export function useAutoUpdateLabel(props: { label?: string | { values: string[]; interval: number } }) {
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
      const { values, interval } = label as { values: string[]; interval: number };
      if (interval > 0 && isArray(values) && values.length) {
        labelRef.value = values[i];
        timer = setInterval(() => {
          ++i;
          if (i >= values.length) i = 0;
          labelRef.value = values[i];
        }, interval);
      } else labelRef.value = String(label || '');
    } else labelRef.value = label;
  });
  onBeforeUnmount(clean);
  return labelRef;
}
