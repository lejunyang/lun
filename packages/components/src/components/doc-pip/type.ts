import { Responsive } from 'hooks';
import { GetEventPropsFromEmits, PropBoolean, PropObjOrStr } from 'common';
import { Constructor } from '@lun/utils';
import { ExtractPropTypes } from 'vue';

export type DocPipAcceptStyle = string | CSSStyleSheet | HTMLStyleElement;

const sizeProp = PropObjOrStr<Responsive<string>, Constructor<Responsive<number>>[]>(Number as any);
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