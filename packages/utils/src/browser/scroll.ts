export function getScrollbarWidth(el: HTMLElement) {
  const { clientWidth, offsetWidth, clientHeight, offsetHeight, tagName } = el;
  if (tagName === 'BODY' || tagName === 'HTML') {
    return {
      x: window.innerHeight - document.documentElement.clientHeight,
      y: window.innerWidth - document.documentElement.clientWidth,
    };
  }
  return {
    x: offsetHeight - clientHeight,
    y: offsetWidth - clientWidth,
  };
}
