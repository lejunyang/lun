import { GlobalStaticConfig, supportCSSStyleSheet } from '@lun/components';

export function processStringStyle(style: string) {
  if (supportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    return sheet;
  } else return style;
}
