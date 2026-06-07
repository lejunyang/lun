import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropBoolOrStr,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  createEmits,
  editStateProps,
} from 'common';
import { freeze } from '@lun-web/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export type WellKnownDirectory = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';

export type FileOpenTypeOption = {
  accept: Record<string, string[]>;
  description?: string;
};

export const filePickerProps = freeze({
  ...editStateProps,
  /**
   * @locale.zh-CN 已选文件，单选时为 File，多选时为 File 数组
   * @locale.en Selected file (single) or files (multiple).
   */
  value: PropObject<File | File[]>(),
  /**
   * @locale.zh-CN 是否允许多选文件
   * @locale.en Whether to allow selecting multiple files.
   */
  multiple: PropBoolean(),
  /**
   * @locale.zh-CN 是否选择目录，开启后用户可挑选整个文件夹
   * @locale.en Whether to pick a directory instead of files.
   */
  directory: PropBoolean(),
  /**
   * @locale.zh-CN 移动端提示操作系统直接打开拍摄/录音设备而非文件选择器，映射到原生 input 的 capture 属性
   * @locale.en Mobile-only hint asking the OS to open a capture device directly instead of the file picker. Maps to the native input capture attribute.
   */
  capture: PropBoolOrStr<'user' | 'environment' | boolean>(),
  /**
   * @locale.zh-CN 是否启用拖拽上传，开启后可将文件拖到组件区域选择
   * @locale.en Enable drag-and-drop onto the slotted trigger element.
   */
  drop: PropBoolean(),
  /**
   * @locale.zh-CN 单个文件大小上限，单位为字节
   * @locale.en Max size of a single file, in bytes.
   */
  maxSize: PropNumber(),
  /**
   * @locale.zh-CN 多选时允许的文件数量上限
   * @locale.en Max number of files allowed in multiple mode.
   */
  maxCount: PropNumber(),
  /**
   * @locale.zh-CN 所选文件总大小上限，单位为字节
   * @locale.en Max total size of all picked files, in bytes.
   */
  maxTotalSize: PropNumber(),
  /**
   * @locale.zh-CN 是否严格校验文件类型，开启后不匹配 mimeTypes / extensions 的文件会被过滤并触发 typeMismatch
   * @locale.en Strictly enforce mimeTypes / extensions; mismatched files are filtered out and fire typeMismatch.
   */
  strictAccept: PropBoolean(),
  /**
   * @locale.zh-CN 在支持的浏览器中优先使用 showOpenFilePicker，否则回退到原生 input
   * @locale.en Prefer showOpenFilePicker where supported; fall back to the native input.
   * @default true
   */
  preferFileApi: PropBoolean(),
  /**
   * @locale.zh-CN 允许的 MIME 类型，可传字符串或字符串数组
   * @locale.en Allowed MIME types; accepts a string or array of strings.
   */
  mimeTypes: PropStrOrArr(),
  /**
   * @locale.zh-CN 允许的文件扩展名，可传字符串或字符串数组
   * @locale.en Allowed file extensions; accepts a string or array of strings.
   */
  extensions: PropStrOrArr(),
  /**
   * @locale.zh-CN showOpenFilePicker 的起始位置，可传内置目录名或 FileSystemHandle
   * @locale.en Starting location for showOpenFilePicker; well-known directory name or a FileSystemHandle.
   */
  startIn: PropObjOrStr<WellKnownDirectory | FileSystemHandle>(),
  /**
   * @locale.zh-CN showOpenFilePicker 的会话 ID，浏览器会按 ID 记住不同目录
   * @locale.en showOpenFilePicker session id; the user agent can remember different directories per id.
   */
  rememberId: PropString(),
  /**
   * @locale.zh-CN 自定义渲染已选文件的渲染器，接收当前文件列表
   * @locale.en Custom renderer for the picked files; receives the current file list.
   */
  filesRenderer: Prop<GetCustomRendererSource<[files: File | File[] | null | undefined]>>(),
  /**
   * @locale.zh-CN 选择期间是否自动设置 loading 状态
   * @locale.en Toggle loading state while the file picker is open.
   * @default true
   */
  loadingWhenPick: PropBoolean(),
});

export const filePickerEmits = createEmits<{
  update: File | File[];
  exceedMaxCount: File[];
  exceedMaxSize: File[];
  exceedMaxTotalSize: File[];
  /** fired when picked files do not match `mimeTypes`/`extensions` under `strictAccept` */
  typeMismatch: File[];
  cancel: undefined;
}>(['update', 'exceedMaxCount', 'exceedMaxSize', 'exceedMaxTotalSize', 'typeMismatch', 'cancel']);

export type FilePickerSetupProps = ExtractPropTypes<typeof filePickerProps> & CommonProps;
export type FilePickerEventProps = GetEventPropsFromEmits<typeof filePickerEmits>;
export type FilePickerEventMap = GetEventMapFromEmits<typeof filePickerEmits>;
export type FilePickerProps = Partial<FilePickerSetupProps> & FilePickerEventProps;
