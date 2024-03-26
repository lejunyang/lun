import { toArrayIfNotNil } from '@lun/utils';
import { Condition } from './type';

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
