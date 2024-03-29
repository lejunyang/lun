import { GetEventPropsFromEmits, PropBoolean, PropObjOrStr, sizeProp } from 'common';
import { ExtractPropTypes } from 'vue';

export type DocPipAcceptStyle = string | CSSStyleSheet | HTMLStyleElement;

export const docPipProps = {
  open: PropBoolean(),
  width: sizeProp,
  height: sizeProp,
  pipStyles: PropObjOrStr<DocPipAcceptStyle | DocPipAcceptStyle[]>(),
  wrapThemeProvider: PropBoolean(),
  copyDocStyleSheets: PropBoolean(),
};

export const docPipEmits = {
  open: null,
  close: null,
};

export type DocPipSetupProps = ExtractPropTypes<typeof docPipProps>;
export type DocPipEvents = GetEventPropsFromEmits<typeof docPipEmits>;
export type DocPipProps = Partial<DocPipSetupProps> & DocPipEvents;