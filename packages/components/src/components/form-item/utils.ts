import { toArrayIfNotNil } from '@lun/utils';
import { Condition } from './type';

export function getConditionValue(
  { allFalsy, someFalsy, depValues }: { allFalsy: boolean; someFalsy: boolean; noneFalsy: boolean; depValues: any[] },
  condition?: Condition | Condition[],
) {
  const conditions = toArrayIfNotNil(condition);
  let result = !!depValues.length;
  for (const c of conditions) {
    switch (c) {
      case 'all-truthy':
        if (someFalsy) return false;
        break;
      case 'some-truthy':
        if (allFalsy) return false;
        break;
      case 'all-falsy':
        if (!allFalsy) return false;
        break;
      case 'some-falsy':
        if (!someFalsy) return false;
        break;
    }
  }
  return result;
}
