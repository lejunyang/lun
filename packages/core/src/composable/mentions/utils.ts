import { isText } from '@lun/utils';

export function rangeToString(range: Range | StaticRange) {
  // TODO replace it with getTypeTag
  if (range instanceof StaticRange) {
    // StaticRange doesn't have toString method...
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = range;
    if (collapsed) return '';
    else if (startContainer === endContainer)
      return (startContainer.textContent || '').substring(startOffset, endOffset);
    else return ''; // not implemented
  } else return range.toString();
}

/** return wholeText if node is a text node, otherwise return textContent */
export function getText(node: Node) {
  return isText(node) ? node.wholeText : node.textContent!;
}
