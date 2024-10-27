import { defineSSRCustomElement } from 'custom';
import { dividerProps } from './type';
import { createDefineElement } from 'utils';
import { useNamespace, useSlot } from 'hooks';
import { getCompParts } from 'common';
import { normalizeStyle } from 'vue';
import { toPxIfNum } from '@lun-web/utils';

const name = 'divider';
const parts = ['root', 'text'] as const;
const compParts = getCompParts(name, parts);
export const Divider = defineSSRCustomElement({
  name,
  props: dividerProps,
  setup(props, { attrs }) {
    const ns = useNamespace(name);
    const [getSlot, _, slotted] = useSlot();
    return () => {
      const { textPosition = 'center', dashed, type = 'horizontal', textIndent, textStyle } = props;
      return (
        <div
          part={compParts[0]}
          class={[
            ns.b(),
            ns.m(`text-${textPosition}`),
            ns.m(type),
            ns.is({
              dashed,
              slotted,
              'custom-indent': textIndent || +!textIndent === 0,
            }),
          ]}
          style={normalizeStyle([ns.v({ 'text-indent': toPxIfNum(textIndent) }), attrs.style])}
        >
          <span part={compParts[1]} class={ns.e('text')} style={textStyle}>
            {type !== 'vertical' && getSlot()}
          </span>
        </div>
      );
    };
  },
});

export type tDivider = typeof Divider;
export type DividerExpose = {};
export type iDivider = InstanceType<tDivider> & DividerExpose;

export const defineDivider = createDefineElement(name, Divider, {}, parts);
