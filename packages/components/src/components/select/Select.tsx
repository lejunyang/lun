import { defineSSRCustomElement, defineSSRCustomFormElement } from 'custom';
import { registryAnimation, useAnimation } from '../animation';
import { onMounted } from 'vue';
import { useComputedBreakpoints } from '@lun/core';
import { createDefineElement, error, renderElement } from 'utils';
import { SelectOptions, selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { usePromiseRef, MaybePromise } from '@lun/core';
import { runIfFn } from '@lun/utils';

// Mui AutoComplete Multiple 左右方向键可以切换chip聚焦，上下方向键可以弹出面板

export const Select = defineSSRCustomFormElement({
  name: 'select',
  props: selectProps,
  setup(props) {
    const options = usePromiseRef(() => runIfFn(props.options), {
      fallbackWhenReject: (err) => {
        error(err);
        return [];
      },
    });
    return () => {
      return (
        <>
          {renderElement(
            'popover',
            {},
            <>
              {/* select input element */}
              <input />
              {/* options from props, they should be with slot="pop-content" prop so that assigned to popover content */}
              {Array.isArray(options.value) &&
                options.value.map((i: any, index) =>
                  renderElement('select', { slot: 'content', value: i.value, key: i.value + index }, i.label)
                )}
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

export const defineSelect = (selectName?: string, popoverName?: string) => {
  definePopover(popoverName);
  createDefineElement('select', Select)(selectName);
};
