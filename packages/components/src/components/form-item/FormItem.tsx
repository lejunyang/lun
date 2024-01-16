import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { ValidateTrigger, formItemProps } from './type';
import { useNamespace, useSetupContextEvent } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance, computed, onBeforeUnmount, ref, watch } from 'vue';
import { FormInputCollector } from '.';
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
import { defineTooltip } from '../tooltip/Tooltip';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  setup(itemProps) {
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
    const helpText = computed(() => {
      const { help, helpType } = props.value;
      return {
        icon:
          helpType === 'icon' &&
          help &&
          renderElement('tooltip', {}, [renderElement('icon', { name: 'help' }), <span slot="tooltip">{help}</span>]),
        newLine: helpType === 'newLine' && help && (
          <div class={ns.e('help-line')} part="help-line">
            {help}
          </div>
        ),
      };
    });
    const tips = computed(() => {
      const { tip, tipType, help, helpType, maxValidationMsg } = props.value;
      let msgs = itemErrors.value?.length ? itemErrors.value : [];
      if (!msgs.length) {
        if (tipType === 'tooltip' && tip) msgs = [tip];
        else if (helpType === 'tooltip' && help) msgs = [help];
      }
      if (maxValidationMsg != null) msgs = msgs.slice(0, +maxValidationMsg);
      return {
        tooltip: tipType === 'tooltip' && msgs.map((msg) => <div>{String(msg)}</div>),
        newLine: tipType === 'newLine' && msgs.map((msg) => <div>{String(msg)}</div>),
      };
    });
    const render = () => {
      let {
        colonMark,
        requiredMark,
        requiredMarkAlign,
        required,
        colSpan,
        rowSpan,
        newLine,
        fullLine,
        labelWrapperStyle,
        contentWrapperStyle,
        element,
        elementProps,
        label,
        labelAlign,
        noLabel,
      } = props.value;
      const finalRequired = formContext ? validateProps.value.required : required;
      if (fullLine && formContext?.parent) colSpan = ensureNumber(formContext.parent.props.cols, 1);
      const rMark = finalRequired && requiredMark && (
        <span class={[ns.e('required-mark')]} part={ns.p('required-mark')}>
          {requiredMark}
        </span>
      );
      return (
        <div class={[ns.s(editComputed), ns.is('required', finalRequired)]} part={ns.p('root')}>
          {!noLabel && (
            <span
              part={ns.p('label')}
              class={[ns.e('label')]}
              style={{
                gridColumnStart: newLine || fullLine ? 1 : undefined,
                gridRowStart: rowSpan && `span ${rowSpan}`,
                textAlign: labelAlign,
                ...labelWrapperStyle,
              }}
            >
              {requiredMarkAlign === 'start' && rMark}
              <slot name="label-start"></slot>
              <slot name="label">{label}</slot>
              {requiredMarkAlign === 'end' && rMark}
              {helpText.value.icon}
              {colonMark && (
                <span class={ns.e('colon')} part={ns.p('colon')}>
                  {colonMark}
                </span>
              )}
              <slot name="label-end"></slot>
            </span>
          )}
          <span
            part={ns.p('content')}
            style={{
              gridColumnStart: colSpan && `span ${(colSpan as number) * 2 - 1}`,
              gridColumnEnd: fullLine ? -1 : undefined,
              gridRowStart: rowSpan && `span ${rowSpan}`,
              ...contentWrapperStyle,
            }}
            data-status={status.value}
            {...(formContext && contentHandlers)}
          >
            {renderElement(
              'tooltip',
              {
                disabled: !(tips.value.tooltip as []).length,
              },
              [
                element ? (
                  renderElement(element, runIfFn(elementProps, { formContext, formItemProps: props.value }), <slot />)
                ) : (
                  <slot />
                ),
                <div slot="tooltip">{tips.value.tooltip}</div>,
              ],
            )}
            {helpText.value.newLine}
            {tips.value.newLine}
          </span>
        </div>
      );
    };
    if (!formContext) return render;

    useSetupContextEvent({
      update: () => {
        if (canValidate('update')) validate();
      },
    });

    const isPlainName = computed(() => {
      return formContext.isPlainName(props.value.name);
    });
    const path = computed(() => {
      const { name } = props.value;
      if (!name) return;
      return isPlainName.value ? name : stringToPath(name);
    });

    const getValue = (vm?: ComponentInternalInstance, value?: any) => {
      const { array } = props.value;
      if (!path.value) return;
      const getOrSet = value !== undefined ? formContext.setValue : formContext.getValue;
      if (isObject(value) && 'value' in value) value = value.value;
      if (!array) return getOrSet(path.value, value);
      const index = inputContext.getChildVmIndex(vm);
      if (index === undefined) return;
      return getOrSet(toArrayIfNotNil(path.value).concat(String(index)), value);
    };

    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue, setValue: getValue, status },
      onChildRemoved(_, index) {
        // delete the value of the removed child if this form item is an array
        const { array } = props.value;
        if (!array || !path.value) return;
        const value = formContext.getValue(path.value);
        if (isArray(value)) value.splice(index, 1);
      },
    });
    const transform = (val: any, type = 'number') => {
      if (typeof val === type) return val;
      if (!isPlainString(val)) return;
      const value = formContext.getValue(path.value);
      switch (type) {
        case 'number':
          const { isNaN, toNumber } = GlobalStaticConfig.math;
          const numValue = toNumber(value);
          return isNaN(numValue) ? undefined : numValue;
      }
    };
    const depInfo = computed(() => {
      const { deps } = props.value;
      const temp = toArrayIfTruthy(deps);
      let allFalsy = !!temp.length,
        someFalsy = false;
      const depValues = temp.map((name) => {
        const val = formContext.getValue(name);
        if (val) allFalsy = false;
        else someFalsy = true;
        return val;
      });
      return { allFalsy, someFalsy, depValues, noneFalsy: !!temp.length && !someFalsy };
    });
    const localRequired = ref(false);
    watch(depInfo, (info, oldInfo, onCleanUp) => {
      let { clearWhenDepChange, disableWhenDepFalsy, array, requireWhenDepTruthy } = props.value;
      const { allFalsy, someFalsy, depValues, noneFalsy } = info;
      const { depValues: oldDepValues } = oldInfo;
      if (canValidate('depChange')) validate(onCleanUp);
      if (
        clearWhenDepChange &&
        (depValues.length !== oldDepValues.length || !simpleObjectEquals(depValues, oldDepValues))
      ) {
        formContext.setValue(path.value, array ? [] : null);
      }
      (() => {
        if (requireWhenDepTruthy === true) requireWhenDepTruthy = 'all';
        switch (requireWhenDepTruthy) {
          case 'all':
            return (localRequired.value = noneFalsy);
          case 'some':
            return (localRequired.value = someFalsy && !noneFalsy);
          case 'none':
            return (localRequired.value = allFalsy);
        }
      })();
      if (disableWhenDepFalsy === true) disableWhenDepFalsy = 'all';
      switch (disableWhenDepFalsy) {
        case 'all':
          return (editState.disabled = allFalsy);
        case 'some':
          return (editState.disabled = someFalsy);
        case 'none':
          return (editState.disabled = noneFalsy);
      }
    });

    const validateProps = computed(() => {
      // TODO plainNameSet in form, depsMatch(deps: string[], match: (values: any[]) => boolean)
      // transform min, max, lessThan, greaterThan, len, step, precision from props, if they are number, return it, if it's string, consider it as a path, try to get it from formContext, judge if the value is number, return if true, otherwise return undefined
      const { min, max, lessThan, greaterThan, len, step, precision, type, required } = props.value;
      // TODO type === 'date'
      return {
        type,
        required: (runIfFn(required, formContext) ?? localRequired.value) || false,
        min: transform(min), // TODO pass those props(min, max...) to input element
        max: transform(max),
        lessThan: transform(lessThan),
        greaterThan: transform(greaterThan),
        len: transform(len),
        step: transform(step),
        precision: transform(precision),
      };
    });
    const validate = async (onCleanUp?: (cb: AnyFn) => void) => {
      const value = formContext.getValue(path.value);
      const { stopValidate, validators: formValidators } = formContext.parent!.props;
      const stopEarly = stopValidate === 'first';
      const { validators } = props.value;
      const errors = toArrayIfNotNil(
        await innerValidator(value, formContext.form.formData, validateProps.value),
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
      !aborted && formContext.form.setError(path.value, errors);
      return errors;
    };

    onBeforeUnmount(
      formContext.form.hooks.onValidate.use(async (_, { stopExec }) => {
        const errors = await validate();
        if (errors.length && formContext.parent?.props.stopValidate === 'form-item') stopExec();
      }),
    );

    onBeforeUnmount(() => {
      switch (props.value.unmountBehavior) {
        case 'delete':
          return formContext.deletePath(path.value);
        case 'toNull':
          return formContext.setValue(path.value, null);
        case 'toUndefined':
          return formContext.setValue(path.value, undefined);
      }
    });

    return render;
  },
});

export type tFormItem = typeof FormItem;

export const defineFormItem = createDefineElement(name, FormItem, {
  icon: defineIcon,
  tooltip: defineTooltip,
});
