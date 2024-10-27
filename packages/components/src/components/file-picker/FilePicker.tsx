import { defineSSRCustomElement } from 'custom';
import { refLikeToDescriptors, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement, error } from 'utils';
import { useCEExpose, useValueModel } from 'hooks';
import { FileOpenTypeOption, filePickerEmits, filePickerProps } from './type';
import { computed, ref } from 'vue';
import { AnyFn, arrayFrom, isArray, isString, isSupportFileSystemAccess, on, onOnce, runIfFn, supportTouch } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer';
import { isAbort } from './utils';

// TODO drop support
const name = 'file-picker';
const parts = [] as const;
export const FilePicker = defineSSRCustomElement({
  name,
  props: filePickerProps,
  emits: filePickerEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    const emit = useSetupEvent<typeof e>();
    const [editComputed, editState] = useSetupEdit();
    const valueModel = useValueModel(props);
    const inputRef = ref<HTMLInputElement>();
    let picking = false;
    const isMultiple = () => props.multiple || props.directory;

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

    const processFiles = (files: File[]) => {
      const { strictAccept } = props;
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
      valueModel.value = isMultiple() ? files : files[0];
    };

    const finishPicking = () => {
      picking = false;
      editState.loading = false;
    };

    // check if file select is canceled for type=file input, it's for browser which does not support input cancel event
    let toClear: (AnyFn | false)[] = [],
      picked = false;
    const clean = (cancel: any = true) => {
      toClear.forEach((i) => i && i());
      finishPicking();
      if (cancel && !picked) emit('cancel');
      picked = true; // prevent clean in visibilitychange if browser support cancel event
      toClear = [];
    };
    const listenIfCancel = () => {
      picked = false;
      let lastTime = 0;
      toClear.push(
        // in mobile, browser will be in background when picking files, listen to visibility change to detect if canceled (In Android, file pick will be cancel if we switch to other app)
        // it's also ok to do this in PC chromium or firefox, as it won't be fired when picking(BUT Safari does!!!)
        // so only do this when supportTouch and not in ios
        // not tested in PC touching devices
        supportTouch &&
          !navigator.userAgent.includes('Mac') &&
          on(document, 'visibilitychange', () => {
            // once document is show, check if picked any file
            if (!document.hidden)
              setTimeout(() => {
                if (!picked) clean();
              }, 20); // wait for change event, not sure 20ms is too fast or not on some devices // TODO
          }),
        // focus does's work, use pointer check instead
        // In Mac chromium, pointermove will still be fired when file dialog opens... but only be fired when pointer moves from file dialog to browser window, so check the event timeStamp to detect if it's continuous move
        on(window, 'pointermove', (e) => {
          const gap = e.timeStamp - lastTime;
          if (gap < 50) clean();
          lastTime = e.timeStamp;
        }),
        onOnce(window, 'pointerdown', clean),
        onOnce(window, 'keydown', clean),
      );
    };
    // check if file select is canceled for type=file input, it's for browser which does not support input cancel event

    const inputHandlers = {
      onClick() {
        if (picking) listenIfCancel();
      },
      onChange(e: Event) {
        picked = true;
        const input = e.target as HTMLInputElement;
        const f = arrayFrom(input.files!);
        clean(!f.length);
        processFiles(f);
        input.value = ''; // clear files
      },
      onCancel: clean,
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
      return arrayFrom(mimeTypes.value).concat(arrayFrom(extensions.value)).join(',');
    });

    async function pickDir() {
      const files: File[] = [];
      async function read(directory: FileSystemDirectoryHandle) {
        // @ts-ignore
        for await (const entry of directory.values()) {
          if (entry.kind === 'file') {
            files.push(await (entry as FileSystemFileHandle).getFile());
          } else if (entry.kind === 'directory') {
            await read(entry as FileSystemDirectoryHandle);
          }
        }
      }
      const { startIn, rememberId } = props;
      await showDirectoryPicker({
        mode: 'read',
        startIn,
        id: rememberId,
      })
        .then(read)
        .catch((e) => {
          if (isAbort(e)) emit('cancel');
        });
      return files;
    }

    const pickFile = async () => {
      const { value: input } = inputRef;
      if (!input || !editComputed.editable || picking) return;
      const { directory, strictAccept, preferFileApi, startIn, rememberId, loadingWhenPick } = props;

      picking = true;
      if (loadingWhenPick) editState.loading = true;
      let needFallback = false;

      if (preferFileApi && isSupportFileSystemAccess()) {
        if (directory) {
          const files = await pickDir();
          processFiles(files);
        } else {
          const mimes = mimeTypes.value,
            exts = arrayFrom(extensions.value);
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
            multiple: isMultiple(),
            excludeAcceptAllOption: strictAccept,
            startIn,
            id: rememberId,
          };
          const picker = showOpenFilePicker(options);
          await picker
            .then(async (handles: any) => {
              let files = await Promise.all(handles.map((h: any) => h.getFile()));
              const [checkSize, checkEmit] = useOverSizeCheck();
              files = toLimitCount(files.filter((f) => checkSize(f)));
              checkEmit();
              valueModel.value = isMultiple() ? files : files[0];
            })
            .catch((e: any) => {
              if (isAbort(e)) emit('cancel');
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
        }

        if (!needFallback) {
          return finishPicking();
        }
      }

      // if (isInputSupportPicker()) {
      //   try {
      //     input.showPicker();
      //   } catch {
      //     clean(false);
      //   }
      // } else
      input.click();
    };
    const slotHandlers = {
      onClick() {
        pickFile();
      },
    };

    useCEExpose(
      {
        pickFile,
      },
      refLikeToDescriptors({ innerValue: valueModel }),
    );

    return () => {
      const { disabled } = editComputed;
      const { directory, multiple, filesRenderer } = props;
      const content = runIfFn(filesRenderer, valueModel.value);
      return (
        <>
          <input
            ref={inputRef}
            accept={inputAccept.value}
            // @ts-ignore
            webkitdirectory={directory}
            multiple={multiple}
            type="file"
            hidden
            disabled={disabled}
            {...inputHandlers}
          />
          <slot {...slotHandlers}></slot>
          {content && renderCustom(content)}
        </>
      );
    };
  },
});

export type tFilePicker = typeof FilePicker;
export type FilePickerExpose = {
  pickFile(): Promise<void>;
  readonly innerValue: File | File[] | undefined;
};
export type iFilePicker = InstanceType<tFilePicker> & FilePickerExpose;

export const defineFilePicker = createDefineElement(
  name,
  FilePicker,
  {
    preferFileApi: true,
    loadingWhenPick: true,
  },
  parts,
);
