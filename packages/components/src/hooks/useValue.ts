import type { UseModel } from "@lun/core";
import { createUseModel } from "@lun/core";
import { useShadowInfo } from "./shadowDom";

export const useValueModel = createUseModel({ defaultKey: 'value', defaultEvent: 'update' }) as UseModel<'value'>;

/**
 * used to make CE compatible with v-model.\
 * If we want to make v-model natively work on CE, we need to do a lot of work, such as delegate events and sync the value.
 * But we can use a tricky way to make it work, since v-model would add an `_assign` function to the element. We just need to call that manually.
 */
export function useVModelCompatible() {
  const shadowInfo = useShadowInfo<HTMLInputElement & { _assign?: (val: any) => void }, HTMLInputElement>();
  return {
    shadowInfo,
    updateVModel(val: any) {
      if (shadowInfo.CE?._assign instanceof Function) {
        shadowInfo.CE._assign(val);
      }
    }
  }
}