import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, error } from 'utils';
import { useCEExpose, useSetupContextEvent, useValueModel } from 'hooks';
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
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props);
    const inputRef = ref<HTMLInputElement>();
    let picking = false;

    const isFileSizeValid = (file: File) => {
      const { maxSize } = props;
      return maxSize == null || isNaN(maxSize as number) || +maxSize! >= file.size;
    };
    const toLimitCount = (files: File[]) => {
      const { maxCount } = props;
      if (files.length > (maxCount as number)) emit('exceedMaxCount', files.slice((maxCount as number) - files.length));
      return (maxCount as number) >= 0 ? files.slice(0, maxCount as number) : files;
    };
    const useOverSizeCheck = () => {
      const oversizeFiles: File[] = [],
        files: File[] = [];
      let totalSize = 0;
      return [
        (file: File) => {
          totalSize += file.size;
          files.push(file);
          return isFileSizeValid(file) || (oversizeFiles.push(file), false);
        },
        /** check if needs to emit events */
        () => {
          if (oversizeFiles.length) emit('exceedMaxSize', oversizeFiles);
          if (totalSize > (props.maxTotalSize as number)) emit('exceedMaxTotalSize', files);
        },
      ] as const;
    };

    const inputHandlers = {
      onChange(e: Event) {
        const { multiple, strictAccept } = props;
        let files = Array.from((e.target as HTMLInputElement).files!);
        const mimes = mimeTypes.value,
          exts = extensions.value;
        const needCheckFileType = strictAccept && (mimes.size || exts.size) && !mimes.has('*/*');
        const [checkSize, checkEmit] = useOverSizeCheck();
        files = toLimitCount(
          files.filter((file) => {
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            return (
              (!needCheckFileType ||
                mimes.has(file.type) ||
                (fileExt && exts.has(fileExt)) ||
                mimes.has(file.type.replace(/\/.+/, '/*'))) &&
              checkSize(file)
            );
          }),
        );
        checkEmit();
        console.log('onChange files', files);
        valueModel.value = multiple ? files : files[0];
        picking = false;
      },
    };

    const getProcessedProp = (key: 'mimeTypes' | 'extensions') =>
      computed(() => {
        const temp = props[key];
        return new Set(
          (isArray(temp) ? temp : isString(temp) ? temp.split(',').map((i) => i.trim()) : []).map((i) =>
            i.toLowerCase(),
          ),
        ) as Set<string>;
      });
    const mimeTypes = getProcessedProp('mimeTypes');
    const extensions = getProcessedProp('extensions');

    const inputAccept = computed(() => {
      return Array.from(mimeTypes.value).concat(Array.from(extensions.value)).join(',');
    });

    const pickFile = async () => {
      const { value: input } = inputRef;
      if (!input || !editComputed.value.editable || picking) return;
      picking = true;
      let needFallback = false;

      const { multiple, strictAccept, preferFileApi, startIn, rememberId } = props;
      if (preferFileApi && isSupportFileSystem()) {
        const mimes = mimeTypes.value,
          exts = Array.from(extensions.value);
        const types: FileOpenTypeOption[] = [];
        if (mimes.size) {
          let i = 0;
          mimes.forEach((mime) => {
            types[i++] = {
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
          id: rememberId,
        };
        const picker = (window as any).showOpenFilePicker(options);
        await picker
          .then(async (handles: any) => {
            console.log('handle', handles);
            let files = await Promise.all(handles.map((h: any) => h.getFile()));
            console.log('file', files);
            const [checkSize, checkEmit] = useOverSizeCheck();
            files = toLimitCount(files.filter((f) => checkSize(f)));
            checkEmit();
            valueModel.value = multiple ? files : files[0];
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
        if (!needFallback) {
          picking = false;
          return;
        }
      }

      if (isInputSupportPicker()) input.showPicker();
      else input.click();
    };
    const slotHandlers = {
      onClick() {
        pickFile();
      },
    };

    useCEExpose({
      pickFile,
    });

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
export type iFilePicker = InstanceType<tFilePicker>;

export const defineFilePicker = createDefineElement(name, FilePicker, {
  spin: defineSpin,
});
