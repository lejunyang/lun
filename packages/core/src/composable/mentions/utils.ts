export function rangeToString(range: Range | StaticRange) {
  if (range instanceof StaticRange) {
    // StaticRange doesn't have toString method...
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = range;
    if (collapsed) return '';
    else if (startContainer === endContainer)
      return (startContainer.textContent || '').substring(startOffset, endOffset);
    else return ''; // not implemented
  } else return range.toString();
}
