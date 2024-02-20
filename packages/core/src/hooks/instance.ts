import { getCurrentInstance, onMounted, onUpdated, ref } from 'vue';

export function useInstanceStyle<T = string>(transformFn?: (style: string) => T) {
  const vm = getCurrentInstance();
  let style = ref<T>(),
    lastStyle: string | undefined;
  if (vm) {
    const update = () => {
      let newStyle = vm.attrs.style as string;
      if (lastStyle !== newStyle) {
        lastStyle = newStyle;
        style.value = (transformFn ? transformFn(newStyle) : newStyle) as T;
      }
    };
    onMounted(update);
    onUpdated(update);
  }
  return style;
}
