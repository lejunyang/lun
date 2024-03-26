import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { docPipProps } from './type';
import { isCSSStyleSheet, isHTMLStyleElement, supportDocumentPictureInPicture } from '@lun/utils';
import { useCEExpose, useShadowDom, useSlot } from 'hooks';
import { watchEffect } from 'vue';

const name = 'doc-pip';
export const DocPip = defineSSRCustomElement({
  name,
  props: docPipProps,
  setup(props) {
    const { slotRef } = useSlot();
    const shadow = useShadowDom();

    let pipWindow: Window | undefined,
      slotEl: Element | undefined,
      opening = false,
      elSheetsMap = new WeakMap<Element, CSSStyleSheet[]>();

    function storeAdoptedStyleSheets(element: Element) {
      if (element.shadowRoot?.adoptedStyleSheets) {
        elSheetsMap.set(element, [...element.shadowRoot?.adoptedStyleSheets]); // must shallow copy
      }
      for (const child of element.children) {
        storeAdoptedStyleSheets(child);
      }
    }

    function restoreAdoptedStyleSheets(element: Element, copy?: boolean) {
      const sheets = elSheetsMap.get(element);
      if (sheets && element.shadowRoot) {
        element.shadowRoot.adoptedStyleSheets = copy
          ? sheets.map((s) => {
              // must use CSSStyleSheet of target's window, or it won't take effect
              const newSheet = new element.ownerDocument.defaultView!.CSSStyleSheet();
              newSheet.replaceSync(
                Array.from(s.cssRules)
                  .map((rule) => rule.cssText)
                  .join('\n'),
              );
              return newSheet;
            })
          : sheets;
      }
      for (const child of element.children) {
        restoreAdoptedStyleSheets(child);
      }
    }

    const methods = {
      async openPip(...otherStyles: (string | CSSStyleSheet | HTMLStyleElement)[]) {
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
            width: props.pipWidth as number,
            height: props.pipHeight as number,
          })
          .catch((e) => {
            opening = false;
            throw e;
          });

        const { document } = pipWindow;

        // copy StyleSheets
        if (shadowRoot.adoptedStyleSheets) {
          document.adoptedStyleSheets = shadowRoot.adoptedStyleSheets;
        }
        // copy style nodes
        const styleNodes = Array.from(shadowRoot.querySelectorAll('style')).map((n) => n.cloneNode());
        const { head } = document;
        head.append(...styleNodes);

        if (otherStyles.length) {
          otherStyles.forEach((i) => {
            if (isHTMLStyleElement(i)) head.append(i);
            else if (isCSSStyleSheet(i)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, i];
            else if (i) {
              const style = document.createElement('style');
              style.textContent = i;
              head.append(style);
            }
          });
        }

        // TODO copy theme-provider
        pipWindow.document.body.append(slotEl);
        restoreAdoptedStyleSheets(slotEl, true);
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
      if (props.open) methods.openPip();
      else methods.closePip();
    });

    useCEExpose(methods);
    return () => <slot ref={slotRef}></slot>;
  },
});

export type tDocPip = typeof DocPip;

export const defineDocPip = createDefineElement(name, DocPip);
