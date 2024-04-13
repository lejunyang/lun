import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  editStateProps,
} from 'common';
import { freeze } from '@lun/utils';

export type WellKnownDirectory = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';

export type FileOpenTypeOption = {
  accept: Record<string, string[]>;
  description?: string;
};

export const filePickerProps = freeze({
  ...editStateProps,
  value: PropObject<File | File[]>(),
  multiple: PropBoolean(),
  // TODO directory capture
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
});

export const filePickerEmits = freeze({
  update: (_value: File | File[]) => true,
  exceedMaxCount: (_value: File[]) => true,
  exceedMaxSize: (_value: File[]) => true,
  exceedMaxTotalSize: (_value: File[]) => true,
  // TODO cancel
  // TODO typeMismatch
});

export type FilePickerSetupProps = ExtractPropTypes<typeof filePickerProps> & CommonProps;
export type FilePickerEvents = GetEventPropsFromEmits<typeof filePickerEmits>;
export type FilePickerProps = Partial<FilePickerSetupProps> & FilePickerEvents;
