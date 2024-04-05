import { getTypeTag } from '../is';
import { isHTMLElement } from './is';

export function isEditElement(el?: unknown): el is HTMLElement {
  if (!isHTMLElement(el)) return false;
  const { tagName, isContentEditable, editContext } = el as any;
  return (
    tagName === 'INPUT' || tagName === 'TEXTAREA' || isContentEditable || getTypeTag(editContext) === 'EditContext'
  );
}
