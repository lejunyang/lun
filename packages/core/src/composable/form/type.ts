import { Ref, ComponentInternalInstance } from 'vue';
import { FormHooks, FormHooksOptions } from './useForm.hooks';
import { CommonObject } from '@lun-web/utils';
import { LocalEditState } from '../../hooks/useSetupEdit';

export type FormItemStatusMessage = { status?: string; message: string };
export type MaybeFormItemStatusMessages =
  | FormItemStatusMessage[]
  | string[]
  | string
  | FormItemStatusMessage
  | (string | FormItemStatusMessage)[];

export type MaybeFormItemPath = string | string[] | null | undefined;

export type FormState = {
  /**
   * { field1: { status1: ['msg'], status2: ['msg'] } }
   */
  statusMessages: Record<string, Record<string, string[]>>;
  isDirty: boolean;
  dirtyFields: Set<string>;
} & LocalEditState;

export type UseFormOptions<Data extends CommonObject = CommonObject> = {
  config?: Record<string, any>;
  defaultData?: Partial<Data>;
  defaultFormState?: Partial<FormState>;
  hooks?: FormHooksOptions;
};

export type ProcessedFormParams<Data extends CommonObject = CommonObject> = {
  options: UseFormOptions<Data>;
  data: Ref<Data>;
  rawData: Ref<any>;
  // TODO add formData(FormData), it will remove disabled fields by default
  formState: Ref<FormState>;
  hooks: FormHooks;
  getDefaultFormState(): FormState;
  nameToItemMap: Map<string | string[], ComponentInternalInstance>;
  itemToFormMap: WeakMap<ComponentInternalInstance, ComponentInternalInstance>;
};
