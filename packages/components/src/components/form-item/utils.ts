import { isString, toArrayIfNotNil, toArrayIfTruthy } from '@lun/utils';
import { Condition, ValidatorStatusResult } from './type';

export function getConditionValue(
  { allFalsy, someFalsy, noneFalsy }: { allFalsy: boolean; someFalsy: boolean; noneFalsy: boolean; depValues: any[] },
  condition?: Condition | Condition[],
) {
  const conditions = toArrayIfNotNil(condition);
  let result = undefined;
  for (const c of conditions) {
    switch (c) {
      case 'all-truthy':
        result = noneFalsy;
        break;
      case 'some-truthy':
        result = someFalsy && !allFalsy;
        break;
      case 'all-falsy':
        result = allFalsy;
        break;
      case 'some-falsy':
        result = someFalsy;
        break;
    }
    if (result === false) return false;
  }
  return !!result;
}

export function processStatusMsgs(msgs: any) {
  let errorCount = 0;
  const res = toArrayIfTruthy(msgs)
    .map((m) => {
      if (isString(m)) return errorCount++, m;
      else if (m?.message) {
        const status = m.status || 'error';
        if (status === 'error') errorCount++;
        return { message: m.message, status };
      }
    })
    .filter(Boolean) as (string | ValidatorStatusResult)[];
  return [res, errorCount] as const;
}
