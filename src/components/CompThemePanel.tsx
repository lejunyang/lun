import { defineComponent, PropType } from 'vue';
import {
  OpenShadowComponentKey,
  GlobalStaticConfig,
  themeColors,
  TabItemObject,
  renderElement,
} from '@lun-web/components';
import { useData } from 'vitepress';
import locales from '../docs/.vitepress/locales';

export default defineComponent({
  props: {
    comp: {
      type: String as PropType<OpenShadowComponentKey>,
      required: true,
    },
    maxSize: Number,
    other: {
      default: {}
    },
    includeContrast: Boolean,
    includeDisabled: Boolean,
  },
  setup(props) {
    const { lang } = useData();
    const variants = Array.from(GlobalStaticConfig.availableVariants[props.comp] || []) as string[];
    const compName = props.comp;
    const gridStyle = {
      display: 'grid',
      gap: '8px',
      justifyItems: 'center',
      alignItems: 'center',
      gridTemplateColumns: `auto repeat(${variants.length}, 1fr)`,
    } as const;
    const grayTipStyle = {
      color: 'var(--l-accent-gray-9)',
      fontSize: '12px',
      whiteSpace: 'nowrap',
    } as const;
    const cellStyle = {
      display: 'flex',
      gap: '4px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    } as const;
    const items: TabItemObject[] = [
      {
        slot: 'ThemeColors',
        label: () => locales[lang.value as keyof typeof locales]?.components.themeVariants,
        panel: () => (
          <div style={gridStyle}>
            <div></div>
            {variants.map((v) => (
              <div style={grayTipStyle}>{v}</div>
            ))}
            <div style={grayTipStyle}>accent color</div>
            {variants.map((v) => (
              <div style={cellStyle}>
                {renderElement(compName, { variant: v, ...props.other })}
                {props.includeContrast && renderElement(compName, { variant: v, ...props.other, highContrast: true })}
              </div>
            ))}
            <div style={grayTipStyle}>gray color</div>
            {variants.map((v) => (
              <div style={cellStyle}>
                {renderElement(compName, { variant: v, ...props.other, color: 'gray' })}
                {props.includeContrast &&
                  renderElement(compName, { variant: v, ...props.other, highContrast: true, color: 'gray' })}
              </div>
            ))}
            {props.includeDisabled && [
              <div style={grayTipStyle}>disabled</div>,
              variants.map((v) =>
                renderElement(compName, { variant: v, ...props.other, color: 'gray', disabled: true }),
              ),
            ]}
          </div>
        ),
      },
      {
        slot: 'AllColors',
        label: () => locales[lang.value as keyof typeof locales]?.components.colorsVariants,
        panel: () => (
          <div style={gridStyle}>
            <div></div>
            {variants.map((v) => (
              <div style={grayTipStyle}>{v}</div>
            ))}
            {themeColors.map((c) => [
              <div style={grayTipStyle}>{c}</div>,
              variants.map((v) => (
                <div style={cellStyle}>
                  {renderElement(compName, { variant: v, ...props.other, color: c })}
                  {props.includeContrast &&
                    renderElement(compName, { variant: v, ...props.other, highContrast: true, color: c })}
                </div>
              )),
            ])}
          </div>
        ),
      },
    ];
    return () => <l-tabs default-active-slot="ThemeColors" items={items} />;
  },
});
