import { defineSSRCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode, nextTick, defineComponent } from 'vue';
import { CustomRendererRegistry } from './renderer.registry';
import { createDefineElement } from 'utils';
import { customRendererProps, CustomRendererProps } from './type';
import { isArray, isFunction, isHTMLTemplateElement, isNode } from '@lun/utils';

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

    watchEffect(() => {
      let { type } = props;
      let content = props.content as any;
      renderer = undefined; // clear before and get new renderer
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
      let nextType: 'html' | 'vnode' = 'html',
        updateHtml = () => undefined;
      // renderer changed, should trigger onBeforeUnmount of the last one
      if (lastRenderer !== renderer && lastRenderer?.onBeforeUnmount && mounted) {
        lastRenderer.onBeforeUnmount(content, div.value!);
      }
      // no valid renderer, check the content if it is string, number or vnode, render it if yes
      if (!renderer) {
        if (isFunction(content)) content = content(); // if it's a function, consider it as a getter
        const isValidArray = isArray(content) && (isRawType(content[0]) || isVNode(content[0])); // if it's an array and the first item is valid as a vnode, render it
        nextType = isVNode(content) || (isRawType(content) && !props.preferHtml) || isValidArray ? 'vnode' : 'html';
        if (nextType === 'html') {
          if (isNode(content)) {
            updateHtml = () => {
              if (div.value) {
                div.value.innerHTML = '';
                if (isHTMLTemplateElement(content)) content = document.importNode(content.content, true);
                div.value.append(content);
              }
            };
          } else {
            updateHtml = () => {
              if (!div.value) return;
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

      lastRenderer = renderer;
      if (mounted && renderer?.onUpdated) {
        if (lastType === 'vnode') {
          // unmount vnode and then do the update
          vnode.value = null;
          nextTick(() => renderer?.onUpdated && renderer.onUpdated(content, div.value!, attrs));
        } else renderer.onUpdated(content, div.value!, attrs);
      }
      lastType = nextType;
    });

    onMounted(() => {
      mounted = true;
      if (renderer) {
        renderer.onMounted(props.content, div.value!, attrs);
      }
    });
    onBeforeUnmount(() => {
      mounted = false;
      if (renderer?.onBeforeUnmount) {
        renderer.onBeforeUnmount(props.content, div.value!);
      }
    });
    return () => vnode.value ?? <div ref={div} style="display: contents"></div>;
  },
};

export const VCustomRenderer = defineComponent(options);

export const CustomRenderer = defineSSRCustomElement({
  ...options,
  inheritAttrs: false,
  noShadow: true,
  onCE(_instance, ce) {
    ce.style.display = 'contents';
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LCustomRenderer: typeof CustomRenderer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-custom-renderer': typeof CustomRenderer;
  }
}

export const defineCustomRenderer = createDefineElement(name, CustomRenderer);
