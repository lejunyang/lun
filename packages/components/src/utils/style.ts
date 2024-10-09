import { isArray, isString, isSupportCSSStyleSheet, supportCSSLayer } from '@lun/utils';
import { GlobalStaticConfig } from 'config';
import { mergeProps } from 'vue';

/**
 * @param style
 * @param layerType can be
 * - 0: it's for style element, will wrap with `@layer lun-style` and prepend `@layer lun-static lun-dynamic lun-style`;
 * - true: wrap with `@layer lun-static`;
 * - false: wrap with `@layer lun-dynamic`
 * @param noSheet
 */
export function processStringStyle<B extends boolean>(
  style: string | undefined | null,
  layerType: boolean | number = true,
  noSheet?: B,
): B extends true ? string : string | CSSStyleSheet {
  style = String(style || '');
  const { wrapCSSLayer, preferCSSStyleSheet, stylePreprocessor } = GlobalStaticConfig;
  if (style) {
    if (supportCSSLayer && wrapCSSLayer) {
      if (layerType === 0) style = `@layer lun-static,lun-dynamic,lun-style;@layer lun-style {${style}}`;
      else style = `@layer ${layerType ? 'lun-static' : 'lun-dynamic'} {${style}}`;
    }
    style = stylePreprocessor(style);
  }
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

export function getHostStyle(
  styleBody: string | [string, string] | (string | [string, string] | readonly [string, string])[],
  selector?: string | string[],
) {
  return `${
    isArray(selector) ? selector.map((s) => `:host(${s})`).join(',') : `:host${selector ? `(${selector})` : ''}`
  }{${
    isArray(styleBody)
      ? styleBody.length === 2 && !isArray(styleBody[0]) && !styleBody[0].includes(':')
        ? `${styleBody[0]}:${styleBody[1]};`
        : styleBody.reduce((res, cur) => {
            return (res += isArray(cur) ? `${cur[0]}:${cur[1]};` : cur + ';');
          }, '')
      : styleBody
  }}`;
}
