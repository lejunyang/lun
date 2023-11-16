import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent, useValueModel } from 'hooks';
import { uploadProps } from './type';
import { defineSpin } from '../spin/Spin';

const name = 'upload';
export const Upload = defineSSRCustomFormElement({
  name,
  props: uploadProps,
  emits: ['update'],
  setup(props) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props);

    return () => {
      const { disabled } = editComputed.value;
      return (
        <>
          <slot>
            <input type="file" hidden disabled={disabled} />
          </slot>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LUpload: typeof Upload;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-upload': typeof Upload;
  }
}

export const defineUpload = createDefineElement(name, Upload, {
  spin: defineSpin,
});
