import { BaseDateType } from './date';

export const processType = (type: string) => {
  let lType: string;
  const t =
    type.length === 1
      ? type
      : ((lType = type.toLowerCase()), lType.startsWith('mo') ? 'M' : lType.startsWith('de') ? 'de' : lType[0]);
  return (t === 'q' ? 'Q' : t) as BaseDateType;
};
