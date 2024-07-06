import { defineSSRCustomElement } from 'custom';
import { dividerProps } from './type';
import { createDefineElement } from 'utils';
import { useNamespace, useSlot } from 'hooks';
import { getCompParts } from 'common';

const name = 'divider';
const parts = ['root', 'text'] as const;
const compParts = getCompParts(name, parts);
export const Divider = defineSSRCustomElement({
  name,
  props: dividerProps,
  setup(props) {
    const ns = useNamespace(name);
    const { slotProps, slotted } = useSlot();
    return () => {
      const { textPosition = 'center', dashed, type = 'horizontal', textIndent, textStyle } = props;
      const numIndent = +textIndent!;
      const finalTextIndent = Number.isNaN(numIndent) ? textIndent : `${textIndent}px`;
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
              'custom-indent': textIndent || numIndent === 0,
            }),
          ]}
          style={ns.v({ 'text-indent': finalTextIndent })}
        >
          <span part={compParts[1]} class={ns.e('text')} style={textStyle}>
            {type !== 'vertical' && <slot {...slotProps}></slot>}
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
