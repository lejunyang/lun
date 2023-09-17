import type { UseModel } from "@lun/core";
import { createUseModel } from "@lun/core";

export const useValue = createUseModel({ defaultKey: 'value', defaultEvent: 'update' }) as UseModel;