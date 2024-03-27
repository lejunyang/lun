import { defineSSRCustomElement } from 'custom';
import { createDefineElement, error, getFirstThemeProvider } from 'utils';
import { DocPipAcceptStyle, docPipProps } from './type';
import {
  copyCSSStyleSheetsIfNeed,
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

    const getStyleNode = (text: string) => {
      const style = document.createElement('style');
      style.textContent = text;
      return style;
    };

    const methods = {
      async openPip(...otherStyles: DocPipAcceptStyle[]) {
        const { value } = slotRef,
          { shadowRoot } = shadow;
        if (!supportDocumentPictureInPicture || !value || !shadowRoot) return;
        [slotEl] = value.assignedElements();
        if (!slotEl || opening) return false;
        opening = true;

        const { pipStyles, copyDocStyleSheets, wrapThemeProvider } = props;

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

        const { document: pipDocument } = pipWindow;

        // copy StyleSheets
        if (shadowRoot.adoptedStyleSheets?.length) {
          pipDocument.adoptedStyleSheets = copyCSSStyleSheetsIfNeed(shadowRoot.adoptedStyleSheets, pipWindow);
        }
        // copy style nodes
        const styleNodes = Array.from(shadowRoot.querySelectorAll('style')).map((n) => n.cloneNode(true));
        const { head } = pipDocument;
        head.append(...styleNodes);

        if (copyDocStyleSheets) {
          for (const { ownerNode } of document.styleSheets) {
            if (ownerNode) {
              head.append(ownerNode.cloneNode(true));
            }
          }
        }

        const extraStyles = otherStyles.concat(toArrayIfNotNil(pipStyles));
        if (extraStyles.length) {
          extraStyles.forEach((i) => {
            if (isHTMLStyleElement(i)) head.append(i.cloneNode(true));
            else if (isCSSStyleSheet(i))
              pipDocument.adoptedStyleSheets?.push(...copyCSSStyleSheetsIfNeed([i], pipWindow));
            else if (i) {
              head.append(getStyleNode(i));
            }
          });
        }

        let appendNode = slotEl;
        // copy theme-provider
        if (wrapThemeProvider) {
          let themeProvider = getFirstThemeProvider();
          if (themeProvider) {
            const newThemeProvider = document.createElement(themeProvider.tagName);
            Object.assign(newThemeProvider, (themeProvider as any)._props);
            newThemeProvider.append(slotEl);
            appendNode = newThemeProvider;
          }
        }
        pipDocument.body.append(appendNode);
        restoreAdoptedStyleSheets(slotEl);
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
