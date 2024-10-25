import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  editStateProps,
} from 'common';
import { freeze } from '@lun/utils';
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
  // TODO add directory add capture
  directory: PropBoolean(),
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

export const filePickerEmits = freeze({
  update: (_value: File | File[]) => true,
  exceedMaxCount: (_value: File[]) => true,
  exceedMaxSize: (_value: File[]) => true,
  exceedMaxTotalSize: (_value: File[]) => true,
  cancel: null,
  // TODO typeMismatch
});

export type FilePickerSetupProps = ExtractPropTypes<typeof filePickerProps> & CommonProps;
export type FilePickerEvents = GetEventPropsFromEmits<typeof filePickerEmits>;
export type FilePickerProps = Partial<FilePickerSetupProps> & FilePickerEvents;
