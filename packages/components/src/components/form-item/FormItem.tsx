import { defineSSRCustomElement } from 'custom';
import { isNumberInputType, useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { ValidateTrigger, formItemEmits, formItemProps } from './type';
import { useCEStates, useNamespace, useSetupContextEvent } from 'hooks';
import { FormItemCollector, useErrorTooltip, useHelpTooltip } from '../form/collector';
import { ComponentInternalInstance, computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { FormInputCollector } from './collector';
import {
  AnyFn,
  ensureNumber,
  isArray,
  isEmpty,
  isFunction,
  isObject,
  isPlainString,
  objectGet,
  runIfFn,
  simpleObjectEquals,
  stringToPath,
  toArrayIfNotNil,
  toArrayIfTruthy,
  toNoneNilSet,
  virtualGetMerge,
} from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { GlobalStaticConfig } from 'config';
import { innerValidator } from './formItem.validate';
import { getConditionValue } from './utils';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  emits: formItemEmits,
  setup(itemProps, { emit }) {
    const formContext = FormItemCollector.child();
    const props = computed(() =>
      virtualGetMerge(
        itemProps,
        runIfFn(formContext?.parent?.props.itemProps, { formContext, formItemProps: itemProps }),
      ),
    );
    const ns = useNamespace(name, { parent: formContext?.parent });
    const [editComputed, editState] = useSetupEdit();
    const itemErrors = computed(() => {
      return formContext?.form.getError(path.value);
    });
    const status = computed(() => props.value.status || (isEmpty(itemErrors.value) ? undefined : 'error'));

    const validateWhenSet = computed(() => toNoneNilSet(props.value.validateWhen || 'blur'));
    const revalidateWhenSet = computed(() => toNoneNilSet(props.value.revalidateWhen));
    const canValidate = (trigger: ValidateTrigger) => {
      return validateWhenSet.value.has(trigger) || (!isEmpty(itemErrors.value) && revalidateWhenSet.value.has(trigger));
    };
    const contentHandlers = {
      onInput() {
        if (canValidate('input')) validate();
      },
      onChange: () => {
        if (canValidate('change')) validate();
      },
      onFocusout: () => {
        if (canValidate('blur')) validate();
      },
    };

    const tips = computed(() => {
      const { tip, tipType, help, helpType, maxValidationMsg } = props.value;
      let msgs = itemErrors.value?.length ? itemErrors.value : [];
      if (!msgs.length) {
        if (tipType === 'tooltip' && tip) msgs = [tip];
        else if (helpType === 'tooltip' && help) msgs = [help]; // helpType='newLine' is processed and displayed in the content
      }
      if (maxValidationMsg != null) msgs = msgs.slice(0, +maxValidationMsg);
      return {
        tooltip: tipType === 'tooltip' && msgs.map((msg) => <div>{String(msg)}</div>),
        newLine: tipType === 'newLine' && msgs.map((msg) => <div>{String(msg)}</div>),
      };
    });
    const [stateClass, states] = useCEStates(
      () => ({
        required: formContext ? validateProps.value.required : props.value.required,
        ...formContext?.layoutInfo.value.itemState,
      }),
      ns,
      editComputed,
    );

    const elementRef = useErrorTooltip(() => tips.value.tooltip, {
      isDisabled: () => !(tips.value.tooltip as []).length,
    });
    const helpIconDisabled = computed(() => {
      const { help, helpType } = props.value;
      return helpType !== 'icon' || !help;
    });
    const helpIconRef = useHelpTooltip(() => props.value.help, {
      isDisabled: helpIconDisabled,
    });

    const styles = computed(() => {
      return formContext?.layoutInfo.value.getItemStyles(props.value);
    });

    const render = () => {
      const {
        colonMark,
        requiredMark,
        requiredMarkAlign,
        labelWrapperStyle,
        contentWrapperStyle,
        element,
        elementProps,
        label,
        labelAlign,
        noLabel,
        help,
        helpType,
      } = props.value;
      const { required } = states.value;
      let { hasLabel } = formContext?.layoutInfo.value || {};
      hasLabel &&= !noLabel;
      const rMark = required && requiredMark && (
        <span class={[ns.e('required-mark')]} part={ns.p('required-mark')}>
          {requiredMark}
        </span>
      );
      const { rootStyle, labelStyle, contentStyle, hostStyle } = styles.value || {};
      return (
        <div class={stateClass.value} part={ns.p('root')} style={rootStyle}>
          {hostStyle && <style>{hostStyle}</style>}
          {hasLabel && (
            <span
              part={ns.p('label')}
              class={[ns.e('label')]}
              style={{
                ...labelStyle,
                textAlign: labelAlign,
                ...labelWrapperStyle,
              }}
            >
              {requiredMarkAlign === 'start' && rMark}
              <slot name="label-start"></slot>
              <slot name="label">{label}</slot>
              {requiredMarkAlign === 'end' && rMark}
              {!helpIconDisabled.value && renderElement('icon', { name: 'help', ref: helpIconRef })}
              {colonMark && (
                <span class={ns.e('colon')} part={ns.p('colon')}>
                  {colonMark}
                </span>
              )}
              <slot name="label-end"></slot>
            </span>
          )}
          <span
            class={ns.e('content')}
            part={ns.p('content')}
            style={{
              ...contentStyle,
              ...contentWrapperStyle,
            }}
            data-status={status.value}
            {...(formContext && contentHandlers)}
          >
            {element ? (
              renderElement(
                element,
                { ...runIfFn(elementProps, { formContext, formItemProps: props.value }), ref: elementRef },
                <slot />,
              )
            ) : (
              // can not set elementRef on slot, popover requires an element with bounding rect to attach to, so wrap slot with a span
              <span ref={elementRef} part={ns.p('wrapper')}>
                <slot />
              </span>
            )}
            {helpType === 'newLine' && help && (
              <div class={ns.e('help-line')} part="help-line">
                {help}
              </div>
            )}
            {tips.value.newLine}
          </span>
        </div>
      );
    };
    if (!formContext) return render;
    const {
      form: { isPlainName, getValue, setValue, deletePath, hooks },
      form,
    } = formContext;

    useSetupContextEvent({
      update: (val) => {
        if (canValidate('update')) validate();
        emit('update', val);
      },
    });

    const path = computed(() => {
      const { name } = props.value;
      if (!name) return;
      return isPlainName(name) ? name : stringToPath(name);
    });

    const validateProps = computed(() => {
      const { min, max, lessThan, greaterThan, len, step, precision, type, required, label, pattern } = props.value;
      const transformType = isNumberInputType(type) ? 'number' : null;
      // TODO type === 'date'
      return {
        type,
        required: (runIfFn(required, formContext) ?? localRequired.value) || false,
        min: transform(min, transformType),
        max: transform(max, transformType),
        lessThan: transform(lessThan, transformType),
        greaterThan: transform(greaterThan, transformType),
        len: transform(len, transformType),
        step: transform(step, transformType),
        precision: transform(precision, transformType),
        pattern,
        label,
      };
    });

    const getOrSetValue = (vm?: ComponentInternalInstance, value?: any) => {
      const { array } = props.value;
      if (!path.value) return;
      const getOrSet = value !== undefined ? setValue : getValue;
      if (isObject(value) && 'value' in value) value = value.value;
      if (!array) return getOrSet(path.value, value);
      const index = inputContext.getChildVmIndex(vm);
      if (index === undefined) return;
      return getOrSet(toArrayIfNotNil(path.value).concat(String(index)), value);
    };

    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue: getOrSetValue, setValue: getOrSetValue, status, validateProps },
      onChildRemoved(_, index) {
        // delete the value of the removed child if this form item is an array
        const { array } = props.value;
        if (!array || !path.value) return;
        const value = getValue(path.value);
        if (isArray(value)) {
          value.splice(index, 1);
          hooks.onUpdateValue.exec({ path: path.value, isDelete: true, value: undefined, formData: form.formData });
        }
      },
    });

    /**
     * transform prop like min, max, lessThan, greaterThan, len, step, precision.
     * If it's number, return it;
     * if it's string, consider it as a path of other field, try to get it from formContext, check if the value is number, return if true, otherwise return undefined
     */
    const transform = (val: any, type?: string | null) => {
      if (!type || typeof val === type) return val;
      if (!isPlainString(val)) return;
      const valueOfOtherField = getValue(val);
      switch (type) {
        case 'number':
          const { isNaN, toNumber, isNumber } = GlobalStaticConfig.math;
          const numVal = toNumber(val);
          return isNaN(numVal) ? (isNumber(valueOfOtherField) ? valueOfOtherField : undefined) : numVal;
      }
    };

    const depInfo = computed(() => {
      // Get deps from the formItem' props, not the merged props, to avoid a dead loop case
      // In the code case of doc form validation, we set an object literal itemProps to the form, and we use JSON.stringify to render formData and formError.
      // Whenever we update a field, the form will rerender and itemProps will be recreated. Then props.value updates, depInfo updates, triggering depChange validation
      // Receive a new validation error, rerender and enter a dead loop
      // So ignore deps from the form, as it is commonly defined in formItem itself
      const { deps } = itemProps;
      const temp = toArrayIfTruthy(deps);
      let allFalsy = !!temp.length,
        someFalsy = false;
      const depValues = temp.map((name) => {
        const val = getValue(name);
        if (val) allFalsy = false;
        else someFalsy = true;
        return val;
      });
      return { allFalsy, someFalsy, depValues, noneFalsy: !!temp.length && !someFalsy };
    });

    const localRequired = ref(false); // to required when depValues changed

    watch(depInfo, (info, oldInfo, onCleanUp) => {
      let { clearWhenDepChange, array } = props.value;
      const { depValues } = info;
      const { depValues: oldDepValues } = oldInfo;
      if (canValidate('depChange')) validate(onCleanUp);
      if (
        clearWhenDepChange &&
        oldDepValues &&
        (depValues.length !== oldDepValues.length || !simpleObjectEquals(depValues, oldDepValues))
      ) {
        setValue(path.value, array ? [] : null);
      }
    });
    watchEffect(() => {
      const { disableWhenDep, requireWhenDep } = props.value;
      localRequired.value = getConditionValue(depInfo.value, requireWhenDep);
      editState.disabled = getConditionValue(depInfo.value, disableWhenDep);
    });

    const validateMessages = computed(() =>
      virtualGetMerge(props.value.validateMessages, formContext.parent!.props.validateMessages),
    );

    const validate = async (onCleanUp?: (cb: AnyFn) => void) => {
      const value = getValue(path.value);
      const { stopValidate, validators: formValidators } = formContext.parent!.props;
      const stopEarly = stopValidate === 'first';
      const { validators } = props.value;
      const errors = toArrayIfNotNil(
        innerValidator(value, formContext.form.formData, validateProps.value, validateMessages.value),
      ) as string[];
      if (stopEarly && errors.length) {
        formContext.form.setError(path.value, errors);
        return errors;
      }
      const finalValidators = toArrayIfNotNil(validators).concat(
        ...toArrayIfNotNil(objectGet(formValidators, path.value)),
      );
      let stopped = false,
        aborted = false;
      onCleanUp && onCleanUp(() => ((stopped = true), (aborted = true)));
      const collect = (error?: string | string[]) => {
        if (stopped) return;
        errors.push(...toArrayIfTruthy(error));
        if (stopEarly && errors.length) stopped = true;
      };
      await Promise.allSettled(
        finalValidators.map(async (validator) => {
          if (!isFunction(validator) || stopped) return;
          return Promise.resolve(validator(value, formContext.form.formData, validateProps.value))
            .then(collect)
            .catch(collect);
        }),
      );
      !aborted && errors.length && formContext.form.setError(path.value, errors);
      return errors;
    };

    const param = { item: inputContext.vm!, form: formContext.parent! };
    formContext.form.hooks.onFormItemSetup.exec(param);

    onBeforeUnmount(
      formContext.form.hooks.onValidate.use(async (_, { stopExec }) => {
        const errors = await validate();
        if (errors.length && formContext.parent?.props.stopValidate === 'form-item') stopExec();
      }),
    );

    onBeforeUnmount(() => {
      formContext.form.hooks.onFormItemUnmount.exec(param);
      switch (props.value.unmountBehavior) {
        case 'delete':
          return deletePath(path.value);
        case 'toNull':
          return setValue(path.value, null);
        case 'toUndefined':
          return setValue(path.value, undefined);
      }
    });

    return render;
  },
});

export type tFormItem = typeof FormItem;
export type iFormItem = InstanceType<tFormItem>;

export const defineFormItem = createDefineElement(name, FormItem, {
  icon: defineIcon,
});
