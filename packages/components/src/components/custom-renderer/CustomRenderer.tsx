import { defineSSRCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode, nextTick, defineComponent, h } from 'vue';
import { CustomRendererRegistry } from './renderer.registry';
import { createDefineElement } from 'utils';
import { customRendererProps, CustomRendererProps } from './type';
import { isArray, isHTMLTemplateElement, isNode, runIfFn } from '@lun/utils';

const name = 'custom-renderer';

const options = {
  name,
  props: customRendererProps,
  setup(props: CustomRendererProps, { attrs }: { attrs: Record<string, any> }) {
    const div = shallowRef<HTMLDivElement>();
    const vnode = shallowRef();
    let mounted = false;
    let lastRenderer: CustomRendererRegistry | undefined;
    let renderer: CustomRendererRegistry | undefined;
    let lastType: 'html' | 'vnode';

    const isRawType = (content: unknown) => ['string', 'number', 'boolean'].includes(typeof content);

    watchEffect((onCleanup) => {
      let cleared = false;
      onCleanup(() => (cleared = true));
      let { type } = props;
      let content = runIfFn(props.content, { h }) as any; // if it's a function, consider it as a getter
      renderer = undefined; // clear before and get new renderer
      if (type !== 'html' && type !== 'vnode') {
        if (type) {
          const temp = GlobalStaticConfig.customRendererMap[type];
          if (temp?.isValidContent(content)) renderer = temp;
        }
        if (!renderer) {
          for (const registry of Object.values(GlobalStaticConfig.customRendererMap)) {
            if (registry.isValidContent(content)) {
              renderer = registry;
              break;
            }
          }
        }
      }
      let nextType: 'html' | 'vnode' = 'html',
        updateHtml = () => undefined;
      // renderer changed, should trigger onBeforeUnmount of the last one
      if (lastRenderer !== renderer && lastRenderer?.onBeforeUnmount && mounted) {
        lastRenderer.onBeforeUnmount(content, div.value!);
      }
      // no valid renderer, check the content if it is string, number or vnode, render it if yes
      if (!renderer) {
        if (type === 'html') nextType = 'html';
        else {
          const isValidArray = isArray(content) && (isRawType(content[0]) || isVNode(content[0])); // if it's an array and the first item is valid as a vnode, render it
          nextType = isValidArray || (isRawType(content) && !props.preferHtml) || isVNode(content) ? 'vnode' : 'html';
        }
        if (nextType === 'html') {
          if (isNode(content)) {
            updateHtml = () => {
              if (!div.value || cleared) return;
              div.value.innerHTML = '';
              if (isHTMLTemplateElement(content)) content = document.importNode(content.content, true);
              div.value.append(content);
            };
          } else {
            updateHtml = () => {
              if (!div.value || cleared) return;
              div.value.innerHTML = GlobalStaticConfig.vHtmlPreprocessor(String(content ?? ''));
            };
          }
        }

        if (nextType === lastType || !lastType) {
          if (nextType === 'html') updateHtml();
          else if (nextType === 'vnode') vnode.value = content;
        } else {
          if (lastType === 'vnode') {
            // next is html, we need clear before and wait until nextTick so that the vnode can unmount correctly
            vnode.value = null;
            nextTick(updateHtml);
          } else if (lastType === 'html' && div.value) {
            // next is vnode
            div.value.innerHTML = '';
            vnode.value = content;
          }
        }
      }

      if (mounted && renderer) {
        const updateOrMount = () => {
          if (!renderer || !div.value || cleared) return;
          // if renderer changed, should mount a new one
          const func = lastRenderer === renderer ? renderer?.onUpdated : renderer.onMounted;
          func && func(content, div.value, attrs);
          lastRenderer = renderer;
        };
        if (lastType === 'vnode') {
          // unmount vnode and then do the update
          vnode.value = null;
          nextTick(updateOrMount);
        } else updateOrMount();
      } else if (renderer) lastRenderer = renderer; // if not mounted, just update the lastRenderer
      lastType = nextType;
    });

    onMounted(() => {
      mounted = true;
      if (renderer && div.value) {
        renderer.onMounted(runIfFn(props.content), div.value, attrs);
      }
    });
    onBeforeUnmount(() => {
      mounted = false;
      if (renderer?.onBeforeUnmount && div.value) {
        renderer.onBeforeUnmount(props.content, div.value);
      }
    });
    return () => vnode.value ?? <div ref={div} style="display: contents"></div>;
  },
};

export const VCustomRenderer = defineComponent(options);

export const CustomRenderer = defineSSRCustomElement({
  ...options,
  inheritAttrs: false,
  shadowOptions: null,
  onCE(_instance, ce) {
    ce.style.display = 'contents';
  },
});

export type tCustomRenderer = typeof CustomRenderer;

export const defineCustomRenderer = createDefineElement(name, CustomRenderer);
