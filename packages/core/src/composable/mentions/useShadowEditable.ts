import { inBrowser } from '@lun/utils';
import { Ref, ref, watchEffect } from 'vue';

export function useShadowEditable() {
  const editRef = ref<HTMLElement>();
  /** actually it's ShadowRoot | Document, but ShadowRoot.getSelection is not standard */
  const root = ref() as Ref<Document>;
  // https://stackoverflow.com/questions/62054839/shadowroot-getselection
  // use shadowRoot.getSelection if it exists, or use document.getSelection instead
  let localGetSelection: () => Selection | null;
  watchEffect(() => {
    const { value } = editRef;
    root.value = value?.getRootNode() as Document;
    localGetSelection =
      root.value?.getSelection?.bind(root.value) || (inBrowser && document.getSelection.bind(document));
  });

  /** use Selection.getComposedRanges if it exists, or use Selection.getRangeAt instead */
  const getRange = () => {
    const selection = localGetSelection() as any;
    return (selection.getComposedRanges ? selection.getComposedRanges(root.value)[0] : selection.getRangeAt(0)) as
      | StaticRange
      | Range;
  };

  /** request focus for the corresponding index of editRef's child element with offset */
  const requestFocus = (index: number, offset: number = 0) => {
    requestAnimationFrame(() => {
      const { value } = editRef;
      if (!value) return;
      const el = value.children[index],
        text = el?.firstChild as Text; // empty '' will render empty span with no firstChild
      if (!el) return;
      const selection = localGetSelection();
      if (selection) {
        // seems that add range in shadow DOM works in chrome, not in safari
        // const newRange = getRangeWithOffset(text || el, text ? offset : 0);
        // selection.removeAllRanges();
        // selection.addRange(newRange);
        const node = text || el;
        if (!text) offset = 0;
        selection.setBaseAndExtent(node, offset, node, offset);
      }
    });
  };

  return {
    editRef,
    getRange,
    requestFocus,
    // getSelection() {
    //   return localGetSelection && localGetSelection();
    // },
  };
}
