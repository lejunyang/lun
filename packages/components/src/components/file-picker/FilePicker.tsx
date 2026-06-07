import { defineCustomElement } from 'custom';
import { refLikeToDescriptors, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement, error } from 'utils';
import { useCEExpose, useCEStates, useNamespace, useValueModel } from 'hooks';
import { FileOpenTypeOption, filePickerEmits, filePickerProps } from './type';
import { computed, ref } from 'vue';
import {
  AnyFn,
  arrayFrom,
  isArray,
  isString,
  supportFileSystemAccess,
  on,
  onOnce,
  prevent,
  runIfFn,
  supportTouch,
} from '@lun-web/utils';
import { renderCustom } from '../custom-renderer';
import { isAbort } from './utils';
import { ElementWithExpose, getCompParts } from 'common';

const name = 'file-picker';
const parts = ['root', 'input'] as const;
const compParts = getCompParts(name, parts);
export const FilePicker = defineCustomElement({
  name,
  props: filePickerProps,
  emits: filePickerEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    const emit = useSetupEvent<typeof e>();
    useNamespace(name);
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
    /**
     * Collect-and-filter pipeline shared by the input change handler, the drop handler and the
     * showOpenFilePicker path. Each `check(file)` returns whether the file passes; after feeding
     * all files, call `emitChecks()` once to flush typeMismatch / exceedMaxSize / exceedMaxTotalSize.
     */
    const useFileFilter = () => {
      const oversizeFiles: File[] = [],
        mismatchFiles: File[] = [],
        accepted: File[] = [];
      let totalSize = 0;
      const { strictAccept } = props;
      const mimes = mimeTypes.value,
        exts = extensions.value;
      const needCheckFileType = strictAccept && (mimes.size || exts.size) && !mimes.has('*/*');
      const isTypeValid = (file: File) => {
        if (!needCheckFileType) return true;
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        return (
          mimes.has(file.type) ||
          (!!fileExt && exts.has(fileExt)) ||
          mimes.has(file.type.replace(/\/.+/, '/*'))
        );
      };
      return [
        (file: File) => {
          if (!isTypeValid(file)) return mismatchFiles.push(file), false;
          totalSize += file.size;
          accepted.push(file);
          return isFileSizeValid(file) || (oversizeFiles.push(file), false);
        },
        () => {
          if (mismatchFiles.length) emit('typeMismatch', mismatchFiles);
          if (oversizeFiles.length) emit('exceedMaxSize', oversizeFiles);
          if (totalSize > (props.maxTotalSize as number)) emit('exceedMaxTotalSize', accepted);
        },
      ] as const;
    };

    const processFiles = (files: File[]) => {
      const [check, emitChecks] = useFileFilter();
      const filtered = toLimitCount(files.filter(check));
      emitChecks();
      valueModel.value = isMultiple() ? filtered : filtered[0];
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
            // once document is shown, wait a tick for the input change event to land first
            // (visibilitychange fires before change on Android). 20ms is conservative enough for
            // mid-range Android while still feeling instant. If the change event fired, `picked`
            // will be true here and we skip emitting cancel.
            if (!document.hidden) setTimeout(() => !picked && clean(), 20);
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

      if (preferFileApi && supportFileSystemAccess) {
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
              const files = await Promise.all<File>(handles.map((h: any) => h.getFile()));
              processFiles(files);
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

    const dragging = ref(false);
    // dragenter/leave bubble from descendants, so moving the cursor across a child boundary fires
    // a leave on the parent before re-entering — counting depth keeps `dragging` stable while the
    // pointer is anywhere inside the host. Reset to 0 on drop or when depth underflows.
    let dragDepth = 0;
    const dropHandlers = {
      onDragenter(e: DragEvent) {
        if (!props.drop || !editComputed.editable) return;
        if (!e.dataTransfer?.types?.includes('Files')) return;
        prevent(e);
        if (++dragDepth === 1) dragging.value = true;
      },
      onDragover(e: DragEvent) {
        if (!props.drop || !editComputed.editable) return;
        if (!e.dataTransfer?.types?.includes('Files')) return;
        // must preventDefault on dragover or the drop event won't fire
        prevent(e);
        e.dataTransfer.dropEffect = 'copy';
      },
      onDragleave(e: DragEvent) {
        if (!props.drop || !editComputed.editable) return;
        if (!e.dataTransfer?.types?.includes('Files')) return;
        if (--dragDepth <= 0) {
          dragDepth = 0;
          dragging.value = false;
        }
      },
      onDrop(e: DragEvent) {
        if (!props.drop || !editComputed.editable) return;
        const items = e.dataTransfer?.files;
        if (!items?.length) return;
        prevent(e);
        // drop swallows the matching leave events, so reset depth manually
        dragDepth = 0;
        dragging.value = false;
        processFiles(arrayFrom(items));
      },
    };

    const [stateClass] = useCEStates(() => ({ dragging: dragging.value }));

    useCEExpose(
      {
        pickFile,
      },
      refLikeToDescriptors({ innerValue: valueModel }),
    );

    return () => {
      const { disabled } = editComputed;
      const { directory, multiple, capture, drop, filesRenderer } = props;
      const content = runIfFn(filesRenderer, valueModel.value);
      return (
        <span part={compParts[0]} class={stateClass.value} {...(drop ? dropHandlers : {})}>
          <input
            ref={inputRef}
            part={compParts[1]}
            accept={inputAccept.value}
            // @ts-ignore
            webkitdirectory={directory}
            multiple={multiple}
            capture={capture as any}
            type="file"
            hidden
            disabled={disabled}
            {...inputHandlers}
          />
          <slot {...slotHandlers}></slot>
          {content && renderCustom(content)}
        </span>
      );
    };
  },
});

export type FilePickerExpose = {
  pickFile(): Promise<void>;
  readonly innerValue: File | File[] | undefined;
};
export type tFilePicker = ElementWithExpose<typeof FilePicker, FilePickerExpose>;
export type iFilePicker = InstanceType<tFilePicker>;

export const defineFilePicker = createDefineElement(
  name,
  FilePicker,
  {
    preferFileApi: true,
    loadingWhenPick: true,
  },
  parts,
);
