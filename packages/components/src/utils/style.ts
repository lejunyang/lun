import { isString, isSupportCSSStyleSheet, supportCSSLayer } from '@lun/utils';
import { GlobalStaticConfig } from 'config';
import { mergeProps } from 'vue';

export function processStringStyle<B extends boolean>(
  style: string | undefined | null,
  noSheet?: B,
): B extends true ? string : string | CSSStyleSheet {
  style = String(style || '');
  const { wrapCSSLayer, preferCSSStyleSheet, stylePreprocessor } = GlobalStaticConfig;
  if (supportCSSLayer && wrapCSSLayer) {
    style = `@layer ${isString(wrapCSSLayer) ? wrapCSSLayer : 'lun'} {${style}}`;
  }
  style = stylePreprocessor(style);
  if (isSupportCSSStyleSheet() && preferCSSStyleSheet && !noSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    // @ts-ignore
    return sheet;
  } else return style;
}

export function assignProps(target: HTMLElement, ...props: Record<string, any>[]) {
  const merged = mergeProps(...props);
  const style = merged.style;
  delete merged.style;
  Object.assign(target, merged);
  if (style) {
    if (isString(style)) target.style.cssText = style as string;
    else Object.assign(target.style, style);
  }
}
