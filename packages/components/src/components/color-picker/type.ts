import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  CommonProps,
  PropObject,
  PropString,
  editStateProps,
  themeProps,
  PropBoolean,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const colorPickerProps = freeze({
  ...editStateProps,
  ...themeProps,
  value: PropString(),
  defaultValue: PropObject<number[]>(),
  panelOnly: PropBoolean(),
  popoverProps: PropObject(),
  noAlpha: PropBoolean(),
});

export const colorPickerEmits = freeze({
  update: (_: string) => null,
});

export type ColorPickerSetupProps = ExtractPropTypes<typeof colorPickerProps> & CommonProps;
export type ColorPickerEvents = GetEventPropsFromEmits<typeof colorPickerEmits>;
export type ColorPickerProps = Partial<ColorPickerSetupProps> & ColorPickerEvents;
