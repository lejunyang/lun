import { isRootOrBody } from "./is";

export function getScrollbarWidth(el: HTMLElement) {
  const { clientWidth, offsetWidth, clientHeight, offsetHeight } = el;
  if (isRootOrBody(el)) {
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
