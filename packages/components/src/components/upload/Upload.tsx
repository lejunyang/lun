import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent, useValueModel } from 'hooks';
import { uploadProps } from './type';
import { defineSpin } from '../spin/Spin';
import { ref } from 'vue';
import { isInputSupportPicker } from '@lun/utils';

const name = 'upload';
export const Upload = defineSSRCustomElement({
  name,
  props: uploadProps,
  emits: ['update'],
  setup(props) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props);
    const inputRef = ref<HTMLInputElement>();
    const inputHandlers = {
      onChange(e: Event) {
        const files = (e.target as HTMLInputElement).files;
        console.log('files', files);
      },
    };
    const pickFile = () => {
      const { value: input } = inputRef;
      if (!input || !editComputed.value.editable) return;
      if (isInputSupportPicker()) input.showPicker();
      else input.click();
    };
    const slotHandlers = {
      onClick() {
        pickFile();
      },
    };

    return () => {
      const { disabled } = editComputed.value;
      return (
        <>
          <input ref={inputRef} type="file" hidden disabled={disabled} {...inputHandlers} />
          <slot {...slotHandlers}></slot>
        </>
      );
    };
  },
});

export type tUpload = typeof Upload;

export const defineUpload = createDefineElement(name, Upload, {
  spin: defineSpin,
});
