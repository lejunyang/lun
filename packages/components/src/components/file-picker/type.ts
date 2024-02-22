import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  editStateProps,
} from 'common';

export type WellKnownDirectory = 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';

export type FileOpenTypeOption = {
  accept: Record<string, string[]>;
  description?: string;
};

export const filePickerProps = {
  ...editStateProps,
  value: PropObject<File | File[]>(),
  multiple: PropBoolean(),
  maxSize: PropNumber(),
  maxCount: PropNumber(),
  strictAccept: PropBoolean(),
  preferFileApi: PropBoolean(),
  mimeTypes: PropStrOrArr(),
  extensions: PropStrOrArr(),
  /** for showOpenFilePicker */
  startIn: PropObjOrStr<WellKnownDirectory | FileSystemHandle>(),
  /** for showOpenFilePicker. By specifying an ID, the user agent can remember different directories for different IDs. */
  rememberId: PropString(),
};

export const filePickerEmits = {
  update: (_value: File | File[]) => true,
  // TODO cancel
};

export type FilePickerSetupProps = ExtractPropTypes<typeof filePickerProps>;
export type FilePickerEvents = GetEventPropsFromEmits<typeof filePickerEmits>;
export type FilePickerProps = Partial<FilePickerSetupProps> & FilePickerEvents;
