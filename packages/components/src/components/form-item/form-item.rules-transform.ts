import {
  createDateLocaleMethods,
  getDefaultTimeFormat,
  isDatePanelType,
  isNumberInputType,
  objectComputed,
} from '@lun-web/core';
import { GlobalStaticConfig } from 'config';
import { formItemRuleProps, FormItemSetupProps, RawRule, Rule } from './type';
import { ComputedRef, Ref } from 'vue';
import { fromObject, isPlainString, runIfFn } from '@lun-web/utils';
import { FormProvideExtra } from '../form/collector';

export function useRulesTransform(
  props: ComputedRef<FormItemSetupProps>,
  formContext: FormProvideExtra,
  dateLocaleMethods: ReturnType<typeof createDateLocaleMethods>,
  localRequired: Ref<boolean>,
) {
  let transformType: string;

  /**
   * transform prop like min, max, lessThan, greaterThan, len, step, precision.
   * If it's a valid value for that type, return it;
   * else if it's string, consider it as a path of other field, try to get it from formContext, check if the value is valid, return if true, otherwise return undefined
   */
  const transform = (val: any, type?: string) => {
    const {
      math: { isNaN, toNumber, isNumber },
      // date: { isValid } // do not get date here, as date preset is not a must
    } = GlobalStaticConfig;

    // early return if type of val is correct
    if (isNumberInputType(type) && ((transformType = 'number'), typeof val === transformType)) return val;
    else if (isDatePanelType(type) && (transformType = 'date')) {
      const tVal = dateLocaleMethods.parse(val, getDefaultTimeFormat({ type }));
      if (GlobalStaticConfig.date.isValid(tVal)) return tVal;
    }

    if (!transformType!) return val;
    if (!isPlainString(val)) return;
    const valueOfOtherField = formContext.form.getValue(val, true);
    switch (type) {
      case 'number':
        const numVal = toNumber(val);
        return isNaN(numVal) ? (isNumber(valueOfOtherField) ? valueOfOtherField : undefined) : numVal;
      case 'date':
        const dateVal = dateLocaleMethods.parse(valueOfOtherField, getDefaultTimeFormat({ type }));
        if (GlobalStaticConfig.date.isValid(dateVal)) return dateVal;
    }
  };

  const keep = ['type', 'pattern'];
  const validateRawProps = objectComputed(() => {
    const {
      value,
      value: { type, required },
    } = props;
    return {
      ...(fromObject(formItemRuleProps, (key) => [
        key,
        keep.includes(key) ? value[key] : transform(value[key], type),
      ]) as Record<Exclude<keyof typeof formItemRuleProps, 'required' | 'label' | 'type' | 'pattern'>, unknown> & {
        type?: string;
        pattern?: string;
      }),
      required: (runIfFn(required, formContext) ?? localRequired.value) || false,
      label: value.label,
    } as RawRule;
  });

  const validateProps = objectComputed(() => {
    return fromObject(validateRawProps, (key, val) => [
      key,
      transformType === 'date'
        ? dateLocaleMethods.format(val, getDefaultTimeFormat({ type: validateRawProps.type as any }))
        : String(val ?? ''),
    ]) as Rule;
  });

  return [validateRawProps, validateProps] as const;
}
