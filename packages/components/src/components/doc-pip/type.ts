import { freeze } from '@lun/utils';
import { CommonProps, editStateProps, GetEventPropsFromEmits, PropBoolean, PropObjOrStr, sizeProp } from 'common';
import { ExtractPropTypes } from 'vue';

export type DocPipAcceptStyle = string | CSSStyleSheet | HTMLStyleElement;

export const docPipProps = freeze({
  ...editStateProps,
  open: PropBoolean(),
  width: sizeProp,
  height: sizeProp,
  pipStyles: PropObjOrStr<DocPipAcceptStyle | DocPipAcceptStyle[]>(),
  wrapThemeProvider: PropBoolean(),
  copyDocStyleSheets: PropBoolean(),
});

export const docPipEmits = freeze({
  open: null,
  close: null,
});

export type DocPipSetupProps = ExtractPropTypes<typeof docPipProps> & CommonProps;
export type DocPipEvents = GetEventPropsFromEmits<typeof docPipEmits>;
export type DocPipProps = Partial<DocPipSetupProps> & DocPipEvents;
