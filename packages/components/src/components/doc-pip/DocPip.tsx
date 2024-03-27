import { defineSSRCustomElement } from 'custom';
import { createDefineElement, error } from 'utils';
import { DocPipAcceptStyle, docPipProps } from './type';
import {
  cloneCSSStyleSheets,
  isCSSStyleSheet,
  isHTMLStyleElement,
  supportDocumentPictureInPicture,
  toArrayIfNotNil,
  toNumberOrUndefined,
} from '@lun/utils';
import { useBreakpoint, useCEExpose, useShadowDom, useSlot } from 'hooks';
import { onBeforeUnmount, watchEffect } from 'vue';
import { useAdoptedSheetsSnapshot } from '@lun/core';

const name = 'doc-pip';
export const DocPip = defineSSRCustomElement({
  name,
  props: docPipProps,
  setup(props) {
    const { slotRef } = useSlot();
    const shadow = useShadowDom();

    let pipWindow: Window | undefined,
      slotEl: Element | undefined,
      opening = false;

    const [storeAdoptedStyleSheets, restoreAdoptedStyleSheets] = useAdoptedSheetsSnapshot();

    const width = useBreakpoint(props, 'width', toNumberOrUndefined),
      height = useBreakpoint(props, 'height', toNumberOrUndefined);

    const methods = {
      async openPip(...otherStyles: DocPipAcceptStyle[]) {
        const { value } = slotRef,
          { shadowRoot } = shadow;
        if (!supportDocumentPictureInPicture || !value || !shadowRoot) return;
        [slotEl] = value.assignedElements();
        if (!slotEl || opening) return false;
        opening = true;

        // iterate the slotEl, store the adoptedStyleSheets of itself and all its descendant children
        storeAdoptedStyleSheets(slotEl);

        pipWindow = await documentPictureInPicture
          .requestWindow({
            width: width.value,
            height: height.value,
          })
          .catch((e) => {
            opening = false;
            throw e;
          });

        const { document } = pipWindow;

        // copy StyleSheets
        if (shadowRoot.adoptedStyleSheets) {
          document.adoptedStyleSheets = cloneCSSStyleSheets(shadowRoot.adoptedStyleSheets, pipWindow.window);
        }
        // copy style nodes
        const styleNodes = Array.from(shadowRoot.querySelectorAll('style')).map((n) => n.cloneNode(true));
        const { head } = document;
        head.append(...styleNodes);

        const extraStyles = otherStyles.concat(toArrayIfNotNil(props.pipStyles));
        if (extraStyles.length) {
          extraStyles.forEach((i) => {
            if (isHTMLStyleElement(i)) head.append(i.cloneNode(true));
            else if (isCSSStyleSheet(i))
              document.adoptedStyleSheets.push(...cloneCSSStyleSheets([i], pipWindow!.window));
            else if (i) {
              const style = document.createElement('style');
              style.textContent = i;
              head.append(style);
            }
          });
        }

        // TODO copy theme-provider
        pipWindow.document.body.append(slotEl);
        restoreAdoptedStyleSheets(slotEl, true); // copy must be true as the element has been moved to another document
        opening = false;
      },
      closePip() {
        if (slotEl) {
          shadow.CE?.append(slotEl);
          restoreAdoptedStyleSheets(slotEl);
        }
        pipWindow?.close();
        slotEl = undefined;
        pipWindow = undefined;
      },
    };

    watchEffect(() => {
      if (props.open) methods.openPip().catch(error);
      else methods.closePip();
    });
    onBeforeUnmount(methods.closePip);

    useCEExpose(methods);
    return () => <slot ref={slotRef}></slot>;
  },
});

export type tDocPip = typeof DocPip;

export const defineDocPip = createDefineElement(name, DocPip);
