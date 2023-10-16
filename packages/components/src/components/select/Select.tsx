import { defineSSRCustomElement, defineSSRCustomFormElement } from 'custom';
import { registryAnimation, useAnimation } from '../animation';
import { onMounted } from 'vue';
import { useComputedBreakpoints } from '@lun/core';
import { createDefineElement, error, renderElement } from 'utils';
import { SelectOptions, selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { usePromiseRef, MaybePromise } from '@lun/core';
import { runIfFn } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptGroup } from './SelectOptGroup';

// Mui AutoComplete Multiple 左右方向键可以切换chip聚焦，上下方向键可以弹出面板

export const Select = defineSSRCustomFormElement({
  name: 'select',
  props: selectProps,
  inheritAttrs: false,
  setup(props) {
    const children = SelectCollector.parent();

    const options = usePromiseRef(() => runIfFn(props.options), {
      fallbackWhenReject: (err) => {
        error(err);
        return [];
      },
    });
    const renderOption = (i: any, index: number) =>
      renderElement(
        'select-option',
        { slot: 'content', value: i.value, class: i.class, style: i.style, key: i.value + index },
        i.label
      );
    return () => {
      return (
        <>
          {renderElement(
            'popover',
            {},
            <>
              {/* select input element */}
              {renderElement('input')}
              {/* options from props, they should be with slot="pop-content" prop so that assigned to popover content */}
              {Array.isArray(options.value) &&
                options.value.map((i: any, index) => {
                  if (Array.isArray(i.children)) {
                    return renderElement(
                      'select-optgroup',
                      { slot: 'content', key: index, class: i.class, style: i.style },
                      i.children.map(renderOption)
                    );
                  }
                  return renderOption(i, index);
                })}
              {/* slot for select children, also assigned to popover content slot */}
              <slot slot="pop-content">content</slot>
            </>
          )}
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSelect: typeof Select;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-select': typeof Select;
  }
}

export const defineSelect = (names?: {
  selectName?: string;
  selectOptionName?: string;
  selectOptGroupName?: string;
  inputName?: string;
  popoverName?: string;
}) => {
  const { selectName, selectOptionName, selectOptGroupName, popoverName, inputName } = names || {};
  defineSelectOption(selectOptionName);
  defineSelectOptGroup(selectOptGroupName);
  defineInput(inputName);
  definePopover(popoverName);
  createDefineElement('select', Select)(selectName);
};
