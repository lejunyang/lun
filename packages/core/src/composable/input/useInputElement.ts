import { ref } from 'vue';

export type InputFocusOption = { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' };

export function useInputElement<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>() {
  const inputEl = ref<T>();
  const methods = {
    focus: (options?: InputFocusOption) => {
      if (!inputEl.value) return;
      const input = inputEl.value;
      input.focus(options);
      const len = input.value.length;
      switch (options?.cursor) {
        case 'start':
          input.setSelectionRange(0, 0);
          break;
        case 'end':
          input.setSelectionRange(len, len);
          break;
        case 'all':
          input.select();
          break;
      }
    },
    blur: () => inputEl.value?.blur(),
  };
  return [inputEl, methods] as const;
}
