import { defineCustomElement } from 'custom';
import {
  createDateLocaleMethods,
  getCollectedItemIndex,
  objectComputed,
  useCleanUp,
  UseFormReturn,
  useSetupEdit,
  useSetupEvent,
} from '@lun-web/core';
import { createDefineElement, renderElement } from 'utils';
import { ValidateTrigger, ValidatorStatusResult, formItemEmits, formItemProps } from './type';
import { useBreakpoint, useCEStates, useNamespace } from 'hooks';
import { FormItemCollector, useErrorTooltip, useHelpTooltip } from '../form/collector';
import { ComponentInternalInstance, computed, onBeforeUnmount, ref, watch, watchEffect, normalizeStyle } from 'vue';
import { FormInputCollector } from './collector';
import {
  AnyFn,
  isArray,
  isEmpty,
  isFunction,
  isObject,
  objectGet,
  promiseTry,
  runIfFn,
  simpleObjectEquals,
  stringToPath,
  ensureArray,
  ensureTruthyArray,
  toNoneNilSet,
  toPxIfNum,
  virtualGetMerge,
} from '@lun-web/utils';
import { defineIcon } from '../icon/Icon';
import { useContextConfig } from 'config';
import { innerValidator } from './formItem.validate';
import { getConditionValue, processStatusMsgs } from './utils';
import { getCompParts, renderStatusIcon, Status, statuses } from 'common';
import { wrapTransition } from './form-item.tip-transition';
import { useRulesTransform } from './form-item.rules-transform';

const name = 'form-item';
const parts = ['root', 'label', 'content', 'required-mark', 'colon', 'wrapper', 'help-line', 'tip-line'] as const;
const compParts = getCompParts(name, parts);
export const FormItem = defineCustomElement({
  name,
  props: formItemProps,
  emits: formItemEmits,
  setup(itemProps, { emit: e, attrs }) {
    const contextConfig = useContextConfig();
    const dateLocaleMethods = createDateLocaleMethods(() => contextConfig.lang);
    const formContext = FormItemCollector.child();
    const { parent, layoutInfo } = formContext || {};
    const props = computed(() =>
      virtualGetMerge(
        itemProps,
        runIfFn(parent?.props.itemProps, { formContext, formItemProps: itemProps }),
        // default props
        {
          colonMark: ':',
          requiredMark: '*',
          requiredMarkAlign: 'start',
          helpType: 'icon',
          tipType: 'tooltip',
          validateWhen: ['blur', 'depChange'],
          tipShowStatusIcon: true,
        },
      ),
    );
    const ns = useNamespace(name, { parent });
    const [_editComputed, editState] = useSetupEdit();
    const itemStatuses = computed(() => formContext?.form.getStatusMessages(path.value) || {});
    const isStatusVisible = (status: string) =>
      !isEmpty(itemStatuses.value[status]) &&
      (ensureTruthyArray(props.value.visibleStatuses || 'error') as string[]).includes(status);
    const status = computed(() => props.value.status || (statuses.find(isStatusVisible) as Status));

    const validateWhenSet = computed(() => toNoneNilSet(props.value.validateWhen || 'blur'));
    const revalidateWhenSet = computed(() => toNoneNilSet(props.value.revalidateWhen));
    const canValidate = (trigger: ValidateTrigger) => {
      return (
        validateWhenSet.value.has(trigger) ||
        (!isEmpty(itemStatuses.value.error) && revalidateWhenSet.value.has(trigger))
      );
    };
    const contentHandlers = {
      onInput() {
        if (canValidate('input')) validate();
      },
      // FIXME change event doesn't work, its composed is false
      onChange: () => {
        if (canValidate('change')) validate();
      },
      onFocusout: () => {
        if (canValidate('blur')) validate();
      },
    };

    const tips = objectComputed(() => {
      const { tip, tipType, help, helpType, maxValidationMsg, tipShowStatusIcon } = props.value;
      const visibleStatuses = statuses.filter(isStatusVisible),
        noStatusMsg = !visibleStatuses.length,
        showTooltip = tipType === 'tooltip';
      const getMsgs = (classStr = ns.e('form-tooltip'), part = '') =>
        visibleStatuses.flatMap((status) =>
          itemStatuses.value[status].map((m, i) =>
            +maxValidationMsg! >= i + 1 ? undefined : (
              <div key={i + m} class={[classStr, ns.is('status-message', !noStatusMsg)]} part={part}>
                {tipShowStatusIcon && renderStatusIcon(status)}
                {m}
              </div>
            ),
          ),
        );
      const finalTip = (helpType === 'tooltip' && help) || (showTooltip && tip),
        hasTooltip = noStatusMsg ? finalTip : showTooltip,
        hasNewLine = tipType === 'newLine';
      return {
        hasTooltip,
        tooltip: wrapTransition(
          hasTooltip &&
            (noStatusMsg
              ? finalTip && (
                  <div key="tip" class={ns.e('form-tooltip')}>
                    {finalTip}
                  </div>
                )
              : showTooltip && getMsgs()),
          props,
          { class: ns.e('tips'), disabled: disableTooltipTransition.value },
        ),
        newLine: wrapTransition(
          hasNewLine &&
            (noStatusMsg
              ? tip && (
                  <div key="tip" class={ns.e('line-tip')} part={compParts[7]}>
                    {tip}
                  </div>
                )
              : getMsgs(ns.e('line-tip'), compParts[7])),
          props,
          { class: ns.e('tips') },
        ),
      };
    });
    const [stateClass, states] = useCEStates(() => ({
      required: formContext ? validateRawProps.required : props.value.required,
      ...layoutInfo?.value.itemState,
      invalid: status.value === 'error',
    }));

    const [elementRef, errorActiveTarget] = useErrorTooltip(() => tips.tooltip, {
      isDisabled: () => !tips.hasTooltip,
    });
    const disableTooltipTransition = ref(true);
    watch(
      errorActiveTarget,
      (target) => {
        // FIXME temp solution; switching target will trigger tips transition, we need to disable that when switching
        if (target === elementRef.value) setTimeout(() => (disableTooltipTransition.value = false), 300);
        else disableTooltipTransition.value = true;
      },
      { flush: 'sync' },
    );
    const helpIconDisabled = computed(() => {
      const { help, helpType } = props.value;
      return helpType !== 'icon' || !help;
    });
    const [helpIconRef] = useHelpTooltip(() => props.value.help, {
      isDisabled: helpIconDisabled,
    });

    const labelWidth = useBreakpoint(props.value, 'labelWidth', toPxIfNum);
    const styles = computed(() => {
      return layoutInfo?.value.getItemStyles({ ...props.value, labelWidth: labelWidth.value });
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
        hideWhen,
      } = props.value;
      if (formContext && runIfFn(hideWhen, { formContext, formItemProps: props.value })) return;
      const { required } = states;
      let { hasLabel } = formContext?.layoutInfo.value || {};
      hasLabel &&= !noLabel;
      const rMark = required && requiredMark && (
        <span class={[ns.e('required-mark')]} part={compParts[3]}>
          {requiredMark}
        </span>
      );
      const { rootStyle, labelStyle, contentStyle, hostStyle } = styles.value || {};
      return (
        <div class={stateClass.value} part={compParts[0]} style={normalizeStyle([rootStyle, attrs.style])}>
          {hostStyle && <style>{hostStyle}</style>}
          {hasLabel && (
            <span
              part={compParts[1]}
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
                <span class={ns.e('colon')} part={compParts[4]}>
                  {colonMark}
                </span>
              )}
              <slot name="label-end"></slot>
            </span>
          )}
          <span
            class={ns.e('content')}
            part={compParts[2]}
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
              <span ref={elementRef} part={compParts[5]} class={ns.e('wrapper')}>
                <slot />
              </span>
            )}
            {tips.newLine}
            {helpType === 'newLine' && help && (
              <div class={[ns.e('help'), ns.e('line-tip')]} part={compParts[6]}>
                {help}
              </div>
            )}
          </span>
        </div>
      );
    };
    if (!formContext) return render;

    const emit = useSetupEvent<typeof e>(
      {
        update: (val) => {
          if (canValidate('update')) validate();
          emit('update', val);
        },
      },
      { forceChildrenBubble: true },
    );

    const path = computed(() => {
      const { name } = props.value;
      if (!name) return;
      return formContext.form.isPlainName(name) ? name : stringToPath(name);
    });

    const createGetOrSet = (isSet?: number) => (vm?: ComponentInternalInstance, value?: any, raw?: any) => {
      const { setValue, getValue } = formContext.form;
      const { array } = props.value;
      if (!path.value) return;
      if (isObject(value) && 'value' in value) value = value.value; // TODO
      if (!array) return isSet ? setValue(path.value, value, raw) : getValue(path.value, raw);
      const index = getCollectedItemIndex(vm);
      if (index === undefined) return;
      const arrPath = ensureArray(path.value).concat(String(index));
      return isSet ? setValue(arrPath, value, raw) : getValue(arrPath, raw);
    };

    const localRequired = ref(false); // to required when depValues changed

    const [validateRawProps, validateProps] = useRulesTransform(props, formContext, dateLocaleMethods, localRequired);

    const inputContext = FormInputCollector.parent({
      extraProvide: {
        getValue: createGetOrSet(),
        setValue: createGetOrSet(1),
        status,
        validateProps: validateRawProps,
      },
      onChildRemoved(_, index) {
        // delete the value of the removed child if this form item is an array
        const { array } = props.value;
        const { hooks, getValue, data, rawData } = formContext.form;
        if (!array || !path.value) return;
        const value = getValue(path.value);
        if (isArray(value)) {
          value.splice(index, 1);
          hooks.onUpdateValue.exec({ path: path.value, isDelete: true, value: undefined, data, rawData });
        }
      },
    });

    const depInfo = computed(() => {
      // Get deps from the formItem' props, not the merged props, to avoid a dead loop case
      // In the code case of doc form validation, we set an object literal itemProps to the form, and we use JSON.stringify to render data and formError.
      // Whenever we update a field, the form will rerender and itemProps will be recreated. Then props.value updates, depInfo updates, triggering depChange validation
      // Receive a new validation error, rerender and enter a dead loop
      // So ignore deps from the form, as it is commonly defined in formItem itself
      const { deps } = itemProps;
      const temp = ensureTruthyArray(deps);
      let allFalsy = !!temp.length,
        someFalsy = false;
      const depValues = temp.map((name) => {
        const val = formContext.form.getValue(name);
        if (val) allFalsy = false;
        else someFalsy = true;
        return val;
      });
      return { allFalsy, someFalsy, depValues, noneFalsy: !!temp.length && !someFalsy };
    });

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
        formContext.form.setValue(path.value, array ? [] : null);
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
      const {
        form: { getValue, data, rawData, setStatusMessages },
        parent,
      } = formContext;
      const value = getValue(path.value),
        rawValue = getValue(path.value, true);
      const { stopValidate, validators: formValidators } = parent!.props;
      const stopEarly = stopValidate === 'first-error';
      const { validators } = props.value;
      const result = ensureArray(
        innerValidator(rawValue, rawData, validateProps, validateRawProps, validateMessages.value, dateLocaleMethods),
      ) as (string | ValidatorStatusResult)[];
      let errorCount = result.length;
      if (stopEarly && result.length) {
        setStatusMessages(path.value, result);
        return [result, result.length] as const;
      }
      const finalValidators = ensureArray(validators).concat(...ensureArray(objectGet(formValidators, path.value)));
      let stopped = false,
        aborted = false;
      onCleanUp && onCleanUp(() => ((stopped = true), (aborted = true)));
      const collect = (error?: any) => {
        if (stopped) return;
        const [msgs, count] = processStatusMsgs(error);
        result.push(...msgs);
        errorCount += count;
        if (stopEarly && count) stopped = true;
      };
      await Promise.allSettled(
        finalValidators.map(async (validator) => {
          if (!isFunction(validator) || stopped) return;
          return promiseTry(() => validator(value, rawValue, data, rawData, validateProps, validateRawProps))
            .then(collect)
            .catch(collect);
        }),
      );
      !aborted && setStatusMessages(path.value, result);
      return [result, errorCount] as const;
    };

    const param = { item: inputContext.vm!, form: formContext.parent! };
    const onValidate: Parameters<UseFormReturn['hooks']['onValidate']['use']>[0] = async (_, { stopExec }) => {
      const [, errorCount] = await validate();
      if (errorCount && formContext.parent?.props.stopValidate === 'first-item') stopExec();
    };
    const [addClean, cleanUp] = useCleanUp();
    watch(
      () => formContext.form,
      (newForm) => {
        cleanUp();
        if (newForm) {
          newForm.hooks.onFormItemConnected.exec(param);
          addClean(newForm.hooks.onValidate.use(onValidate));
        }
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      const { deletePath, setValue, hooks } = formContext.form;
      hooks.onFormItemDisconnected.exec(param);
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
export type FormItemExpose = {};
export type iFormItem = InstanceType<tFormItem> & FormItemExpose;

export const defineFormItem = createDefineElement(
  name,
  FormItem,
  // WARNING: defaultProps can affect virtualMerge, parent itemProps will be ignored, so better set defaultProps in third param of virtualMerge
  {
    required: undefined, // must, for runIfFn(required, formContext) ?? localRequired.value
  },
  parts,
  {
    icon: defineIcon,
  },
);
