import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, error } from 'utils';
import { useNamespace, useSetupContextEvent, useValueModel } from 'hooks';
import { FileOpenTypeOption, filePickerEmits, filePickerProps } from './type';
import { defineSpin } from '../spin/Spin';
import { computed, ref } from 'vue';
import { isArray, isInputSupportPicker, isString, isSupportFileSystem } from '@lun/utils';

const name = 'file-picker';
export const FilePicker = defineSSRCustomElement({
  name,
  props: filePickerProps,
  emits: filePickerEmits,
  formAssociated: true,
  setup(props) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props);
    const inputRef = ref<HTMLInputElement>();
    const inputHandlers = {
      onChange(e: Event) {
        const { multiple, strictAccept } = props;
        const files = Array.from((e.target as HTMLInputElement).files!);
        console.log('onChange files', files);
        valueModel.value = multiple ? files : files[0];
      },
    };

    const getProcessedProp = (key: keyof typeof props) =>
      computed(() => {
        const temp = props[key];
        return (isArray(temp) ? temp : isString(temp) ? temp.split(',').map((i) => i.trim()) : []) as string[];
      });
    const mimeTypes = getProcessedProp('mimeTypes');
    const extensions = getProcessedProp('extensions');

    const inputAccept = computed(() => {
      return mimeTypes.value.concat(extensions.value).join(',');
    });

    const pickFile = async () => {
      const { value: input } = inputRef;
      if (!input || !editComputed.value.editable) return;
      let needFallback = false;

      const { multiple, strictAccept, preferFileApi, startIn, memoryId } = props;
      if (preferFileApi && isSupportFileSystem()) {
        const mimes = mimeTypes.value,
          exts = extensions.value;
        const types: FileOpenTypeOption[] = [];
        if (mimes.length) {
          mimes.forEach((mime, i) => {
            types[i] = {
              accept: {
                [mime || '*/*']: exts,
              },
            };
          });
        } else {
          types.push({ accept: { '*/*': exts } });
        }
        const options = {
          types,
          multiple,
          excludeAcceptAllOption: strictAccept,
          startIn,
          id: memoryId,
        };
        const picker = (window as any).showOpenFilePicker(options);
        await picker
          .then(async (handles: any) => {
            console.log('handle', handles);
            const files = await Promise.all(handles.map((h: any) => h.getFile()));
            console.log('file', files);
            valueModel.value = files;
          })
          .catch((e: any) => {
            needFallback = e instanceof TypeError;
            if (__DEV__) {
              if (needFallback) {
                error(
                  e.stack?.replace(
                    '\n',
                    '\nWill fall back to input file picker, please check the props "mimeTypes" and "extensions" and make sure they are correct.\n',
                  ) || e,
                );
              }
            }
          });
        if (!needFallback) return;
      }

      if (isInputSupportPicker()) input.showPicker();
      else input.click();
    };
    const slotHandlers = {
      onClick() {
        pickFile();
      },
    };

    // TODO useCEStates?  useCEExpose?

    return () => {
      const { disabled } = editComputed.value;
      return (
        <>
          <input ref={inputRef} accept={inputAccept.value} type="file" hidden disabled={disabled} {...inputHandlers} />
          <slot {...slotHandlers}></slot>
        </>
      );
    };
  },
});

export type tFilePicker = typeof FilePicker;

export const defineFilePicker = createDefineElement(name, FilePicker, {
  spin: defineSpin,
});
