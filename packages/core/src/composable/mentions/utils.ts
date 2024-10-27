import { getTypeTag, isText } from '@lun-web/utils';

export function rangeToString(range: Range | StaticRange) {
  if (getTypeTag(range) === 'StaticRange') {
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
