import { defineCustomElement } from 'custom';
import { createDefineElement, error, getElementFirstName } from 'utils';
import { DocPipAcceptStyle, docPipEmits, docPipProps } from './type';
import {
  arrayFrom,
  copyCSSStyleSheetsIfNeed,
  createElement,
  isCSSStyleSheet,
  isHTMLStyleElement,
  supportDocumentPictureInPicture,
  ensureArray,
  toNumberOrUndefined,
} from '@lun-web/utils';
import { useBreakpoint, useCE, useCEExpose, useSlot } from 'hooks';
import { onBeforeUnmount, ref, watchEffect } from 'vue';
import { useAdoptedSheetsSnapshot, useSetupEdit } from '@lun-web/core';
import { on } from '@lun-web/utils';
import { useContextConfig } from '../config/config.context';
import { ElementWithExpose } from 'common';

const name = 'doc-pip';
export const DocPip = defineCustomElement({
  name,
  props: docPipProps,
  emits: docPipEmits,
  setup(props, { emit }) {
    const [getSlot, , , slotRef] = useSlot();
    const CE = useCE();

    let pipWindow: Window | undefined,
      slotNodes: Node[] = [],
      opening = false;
    const opened = ref(false);

    const [storeAdoptedStyleSheets, restoreAdoptedStyleSheets] = useAdoptedSheetsSnapshot();

    const width = useBreakpoint(props, 'width', toNumberOrUndefined),
      height = useBreakpoint(props, 'height', toNumberOrUndefined);

    const getStyleNode = (text: string) => createElement('style', { textContent: text });

    const [editComputed] = useSetupEdit();
    const theme = useContextConfig('theme');

    const methods = {
      async openPip(...otherStyles: DocPipAcceptStyle[]) {
        const { value } = slotRef,
          { shadowRoot } = CE;
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
        const styleNodes = arrayFrom(shadowRoot.querySelectorAll('style'), (n) => n.cloneNode(true));
        const { head } = pipDocument;
        head.append(...styleNodes);

        if (copyDocStyleSheets) {
          for (const { ownerNode } of document.styleSheets) {
            if (ownerNode) {
              head.append(ownerNode.cloneNode(true));
            }
          }
        }

        const extraStyles = otherStyles.concat(ensureArray(pipStyles));
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
            const newThemeProvider = createElement(tagName as any);
            Object.assign(newThemeProvider, theme, editComputed);
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
        if (__DEV__ && opening) {
          return error('The picture-in-picture window is opening, please wait for it to finish.');
        }
        opened.value = false;
        slotNodes.forEach((e) => {
          CE.append(e);
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
        else return methods.openPip().catch(error);
      },
    };

    watchEffect(() => {
      if (props.open) methods.openPip().catch(error);
      else methods.closePip();
    });
    onBeforeUnmount(methods.closePip);

    useCEExpose(methods);
    return () => getSlot();
  },
});

export type DocPipExpose = {
  openPip: (...otherStyles: DocPipAcceptStyle[]) => Promise<boolean | undefined>;
  closePip: () => void;
  togglePip: () => Promise<boolean | undefined> | undefined;
};
export type tDocPip = ElementWithExpose<typeof DocPip, DocPipExpose>;
export type iDocPip = InstanceType<tDocPip>;

export const defineDocPip = createDefineElement(name, DocPip);
