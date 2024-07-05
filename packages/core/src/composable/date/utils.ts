import { MaybeRefLikeOrGetter } from '../../utils';
import { createDateLocaleMethods, DatePanelType, DateValueType, presets } from '../../presets';

export function getDefaultTimeFormat({
  format,
  type,
  showTime,
  use12Hours,
}: {
  format?: string;
  type?: DatePanelType | 'time';
  showTime?: boolean;
  use12Hours?: boolean;
}) {
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

export function useDateParseFormat(options: {
  format?: string;
  type?: DatePanelType | 'time';
  showTime?: boolean;
  use12Hours?: boolean;
  lang: MaybeRefLikeOrGetter<string, true>;
}) {
  const { parse, format, ...rest } = createDateLocaleMethods(options.lang);
  return {
    parse: (date: DateValueType, formatStr?: string) => format(date, formatStr || getDefaultTimeFormat(options)),
    /** parse from */
    format: (value: any, formatStr?: string) =>
      presets.date.isValid(value) ? value : parse(value, formatStr || getDefaultTimeFormat(options)),
    ...rest,
  };
}
