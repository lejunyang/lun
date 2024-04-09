import { defineSSRCustomElement } from 'custom';
import { createDefineElement, error, getElementFirstName } from 'utils';
import { DocPipAcceptStyle, docPipEmits, docPipProps } from './type';
import {
  copyCSSStyleSheetsIfNeed,
  isCSSStyleSheet,
  isHTMLStyleElement,
  supportDocumentPictureInPicture,
  toArrayIfNotNil,
  toNumberOrUndefined,
} from '@lun/utils';
import { useBreakpoint, useCEExpose, useShadowDom, useSlot } from 'hooks';
import { onBeforeUnmount, ref, watchEffect } from 'vue';
import { useAdoptedSheetsSnapshot, useSetupEdit } from '@lun/core';
import { on } from '@lun/utils';
import { useContextConfig } from '../config/config.context';

const name = 'doc-pip';
export const DocPip = defineSSRCustomElement({
  name,
  props: docPipProps,
  emits: docPipEmits,
  setup(props, { emit }) {
    const { slotRef } = useSlot();
    const shadow = useShadowDom();

    let pipWindow: Window | undefined,
      slotNodes: Node[] = [],
      opening = false;
    const opened = ref(false);

    const [storeAdoptedStyleSheets, restoreAdoptedStyleSheets] = useAdoptedSheetsSnapshot();

    const width = useBreakpoint(props, 'width', toNumberOrUndefined),
      height = useBreakpoint(props, 'height', toNumberOrUndefined);

    const getStyleNode = (text: string) => {
      const style = document.createElement('style');
      style.textContent = text;
      return style;
    };

    const [editComputed] = useSetupEdit();
    const theme = useContextConfig('theme');

    const methods = {
      async openPip(...otherStyles: DocPipAcceptStyle[]) {
        const { value } = slotRef,
          { shadowRoot } = shadow;
        if (!supportDocumentPictureInPicture || !value || !shadowRoot) return;
        const temp = value.assignedNodes();
        if (!temp.length || opening || opened.value) return false;
        slotNodes = temp;
        opening = true;

        const { pipStyles, copyDocStyleSheets, wrapThemeProvider } = props;

        // iterate the slotEl, store the adoptedStyleSheets of itself and all its descendant children
        slotNodes.forEach(storeAdoptedStyleSheets);

        pipWindow = await documentPictureInPicture
          .requestWindow({
            width: width.value,
            height: height.value,
          })
          .catch((e) => {
            opening = false;
            throw e;
          });
        on(pipWindow, 'pagehide', methods.closePip);

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

        let appendNodes = slotNodes;
        // copy theme-provider
        if (wrapThemeProvider) {
          const tagName = getElementFirstName('theme-provider');
          if (tagName) {
            const newThemeProvider = document.createElement(tagName);
            Object.assign(newThemeProvider, theme, editComputed.value);
            newThemeProvider.append(...slotNodes);
            appendNodes = [newThemeProvider];
          }
        }
        pipDocument.body.append(...appendNodes);
        slotNodes.forEach(restoreAdoptedStyleSheets);
        opening = false;
        emit('open');
        return (opened.value = true);
      },
      closePip() {
        opened.value = false;
        slotNodes.forEach((e) => {
          shadow.CE?.append(e);
          restoreAdoptedStyleSheets(e);
        });
        if (pipWindow) {
          pipWindow.close();
          emit('close');
        }
        slotNodes = [];
        pipWindow = undefined;
      },
      togglePip() {
        if (opened.value) methods.closePip();
        else methods.openPip().catch(error);
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
export type iDocPip = InstanceType<tDocPip> & {
  openPip: (...otherStyles: DocPipAcceptStyle[]) => Promise<boolean>;
  closePip: () => void;
  togglePip: () => void;
};

export const defineDocPip = createDefineElement(name, DocPip);
