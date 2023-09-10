export function supports(attrName: string) {
  const div = document.createElement('div');
  return attrName in div;
}

// supports popover  似乎可以做成批量的