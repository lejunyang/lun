import { defineSSRCustomElement } from 'custom';
import { dividerProps } from './type';
import { createDefineElement } from 'utils';
import { useNamespace, useSlot } from 'hooks';

const name = 'divider';
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
          part="root"
          class={[
            ns.b(),
            ns.m(`text-${textPosition}`),
            ns.m(type),
            ns.is({
              dashed,
              slotted: slotted.value,
              'custom-indent': textIndent || numIndent === 0,
            }),
          ]}
          style={ns.v({ 'text-indent': finalTextIndent })}
        >
          <span part="text" class={ns.e('text')} style={textStyle}>
            {type !== 'vertical' && <slot {...slotProps}></slot>}
          </span>
        </div>
      );
    };
  },
});

export type tDivider = typeof Divider;
export type iDivider = InstanceType<tDivider>;

export const defineDivider = createDefineElement(name, Divider);
