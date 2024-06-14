import { DatePanelType } from '../../presets';

export function getDefaultFormat(format?: string, type?: DatePanelType, showTime?: boolean, use12Hours?: boolean) {
  let mergedFormat = format;
  if (!mergedFormat) {
    switch (type) {
      case 'time':
        return use12Hours ? 'hh:mm:ss a' : 'HH:mm:ss';
      case 'week':
        return 'gggg-wo';
      case 'month':
        return 'YYYY-MM';
      case 'quarter':
        return 'YYYY-[Q]Q';
      case 'year':
        return 'YYYY';
      default:
        return showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
    }
  }
  return mergedFormat;
}
