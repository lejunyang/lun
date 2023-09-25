export function getPreviousMatchElInTree(
  el?: Element | null,
  options?: { isMatch?: (el: Element) => boolean; needStop?: (el: Element) => boolean }
) {
  if (!el) return null;
  let isMatch = options?.isMatch || ((el) => !!el);
  let needStop = options?.needStop || ((el) => el.parentElement === document.documentElement);
  let temp = el;
  while (true) {
    if (temp.previousElementSibling) {
      if (isMatch(temp.previousElementSibling)) return temp.previousElementSibling;
      else temp = temp.previousElementSibling;
    } else {
      const parent = temp.parentElement;
      if (!parent || needStop(parent)) return null;
      else if (isMatch(parent)) return parent;
      else temp = parent;
    }
  }
}
