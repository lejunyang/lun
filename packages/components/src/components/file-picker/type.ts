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
  value: PropObject<File | File[]>(),
  multiple: PropBoolean(),
  directory: PropBoolean(),
  /** mobile only: hint that the OS should open a media capture device directly instead of the file picker. Maps to native input `capture` attribute. */
  capture: PropBoolOrStr<'user' | 'environment' | boolean>(),
  /** enable drag-and-drop onto the slotted trigger element */
  drop: PropBoolean(),
  /** max size of a single file */
  maxSize: PropNumber(),
  /** max count of picked files when it's multiple */
  maxCount: PropNumber(),
  /** max size of total picked files */
  maxTotalSize: PropNumber(),
  strictAccept: PropBoolean(),
  preferFileApi: PropBoolean(),
  mimeTypes: PropStrOrArr(),
  extensions: PropStrOrArr(),
  /** for showOpenFilePicker */
  startIn: PropObjOrStr<WellKnownDirectory | FileSystemHandle>(),
  /** for showOpenFilePicker. By specifying an ID, the user agent can remember different directories for different IDs. */
  rememberId: PropString(),
  filesRenderer: Prop<GetCustomRendererSource<[files: File | File[] | null | undefined]>>(),
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
