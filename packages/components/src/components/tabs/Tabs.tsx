import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabsEmits, tabsProps } from './type';
import { defineIcon } from '../icon/Icon';
import { TransitionGroup, computed, ref, vShow, withDirectives } from 'vue';
import { useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { isArray } from '@lun/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';

const name = 'tabs';
const parts = ['root', 'nav', 'content', 'wrapper', 'panel'] as const;
const compParts = getCompParts(name, parts);
export const Tabs = defineSSRCustomElement({
  name,
  props: tabsProps,
  emits: tabsEmits,
  setup(props) {
    const ns = useNamespace(name);
    const activeKey = ref();
    const showedKeys = new Set();

    const tabs = computed(() => (isArray(props.items) ? props.items.filter(Boolean) : []));
    return () => {
      const { destroyInactive, forceRender } = props;
      const { value: key } = activeKey;
      const transitionAttrs = {
        tag: 'div',
        class: ns.e('content'),
        part: compParts[1],
      };
      return (
        <div class={ns.t} part={compParts[0]}>
          <div class={ns.e('nav')} part={compParts[1]}>
            <div class={ns.e('wrapper')} part={compParts[3]}>
              {tabs.value.map((t) => (
                <div>{t.label}</div>
              ))}
            </div>
          </div>
          <TransitionGroup {...getTransitionProps(props, 'panel', 'panel')} {...transitionAttrs}>
            {tabs.value.map((t, i) => {
              const active = key === t.key || (key === undefined && i === 0);
              return active ||
                (t.forceRender ?? forceRender) ||
                (showedKeys.has(t.key) && !(t.destroyInactive ?? destroyInactive))
                ? withDirectives(
                    <div key={t.key ?? i} class={ns.e('panel')} part={compParts[4]}>
                      {renderCustom(t.content)}
                    </div>,
                    [[vShow, active]],
                  )
                : undefined;
            })}
          </TransitionGroup>
        </div>
      );
    };
  },
});

export type tTabs = typeof Tabs;
export type iTabs = InstanceType<tTabs>;

export const defineTabs = createDefineElement(name, Tabs, {}, parts, {
  icon: defineIcon,
});
