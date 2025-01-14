import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  editStateProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropObjOrStr,
  sizeProp,
  undefBoolProp,
} from 'common';
import { ExtractPropTypes } from 'vue';

export type DocPipAcceptStyle = string | CSSStyleSheet | HTMLStyleElement;

export const docPipProps = freeze({
  ...editStateProps,
  open: undefBoolProp,
  width: sizeProp,
  height: sizeProp,
  pipStyles: PropObjOrStr<DocPipAcceptStyle | DocPipAcceptStyle[]>(),
  wrapThemeProvider: PropBoolean(),
  copyDocStyleSheets: PropBoolean(),
});

export const docPipEmits = createEmits<{
  open: undefined;
  close: undefined;
}>(['open', 'close']);

export type DocPipSetupProps = ExtractPropTypes<typeof docPipProps> & CommonProps;
export type DocPipEvents = GetEventPropsFromEmits<typeof docPipEmits>;
export type DocPipProps = Partial<DocPipSetupProps> & DocPipEvents;
