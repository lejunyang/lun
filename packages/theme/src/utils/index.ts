import { supportCSSStyleSheet } from '@lun/components';

export function processStringStyle(style: string, useCssStyleSheet = supportCSSStyleSheet()) {
  if (useCssStyleSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    return sheet;
  } else return style;
}
