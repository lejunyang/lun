import { Responsive } from 'hooks';
import { PropBoolean, PropObjOrStr } from 'common';
import { Constructor } from '@lun/utils';

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
