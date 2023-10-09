import { isSupportCSSStyleSheet } from "@lun/utils";
import { GlobalStaticConfig } from "config";

export function processStringStyle(style: string) {
  if (isSupportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    return sheet;
  } else return style;
}