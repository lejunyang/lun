import { isString, isSupportCSSStyleSheet } from '@lun/utils';
import { GlobalStaticConfig } from 'config';
import { mergeProps } from 'vue';

export function processStringStyle(style: string) {
  if (isSupportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
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
