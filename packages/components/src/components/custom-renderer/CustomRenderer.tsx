import { defineSSRCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode, nextTick } from 'vue';
import { CustomRendererRegistry } from './renderer.registry';
import { createDefineElement, getCommonElementOptions, setDefaultsForPropOptions } from 'utils';
import { customRendererProps } from './type';

export const CustomRenderer = defineSSRCustomElement({
  ...getCommonElementOptions('custom-renderer'),
  props: setDefaultsForPropOptions(customRendererProps, GlobalStaticConfig.defaultProps['custom-renderer']),
  noShadow: true,
  inheritAttrs: false,
  onCE(_instance, ce) {
    ce.style.display = 'contents';
  },
  setup(props, { attrs }) {
    const div = shallowRef<HTMLDivElement>();
    const vnode = shallowRef();
    let mounted = false;
    let lastRenderer: CustomRendererRegistry | undefined;
    let renderer: CustomRendererRegistry | undefined;
    let lastType: 'html' | 'vnode';

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
        if (content instanceof Function) content = content(); // if it's a function, consider it as a getter
        nextType = isVNode(content) ? 'vnode' : 'html';
        if (['string', 'number'].includes(typeof content) || !content) {
          content = GlobalStaticConfig.vHtmlPreprocessor(String(content || ''));
          updateHtml = () => div.value && (div.value.innerHTML = content);
        } else if (content instanceof Node) {
          updateHtml = () => {
            if (div.value) {
              div.value.innerHTML = '';
              if (content instanceof HTMLTemplateElement) content = document.importNode(content.content, true);
              div.value.append(content as Node);
            }
          };
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
    return () => (
      <div ref={div} style="display: contents">
        {vnode.value}
      </div>
    );
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

export const defineCustomRenderer = createDefineElement('custom-renderer', CustomRenderer);