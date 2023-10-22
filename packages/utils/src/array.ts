export function toArrayIfNotNil<T>(target: T): T extends any[] ? T : T extends null | undefined ? unknown[] : T[] {
  return (Array.isArray(target) ? target : target == null ? [] : [target]) as any;
}

export function toNoneNilSet<T>(...args: T[]): T extends any[] ? Set<T[number]> : Set<T> {
  const result = new Set();
  args.forEach((arg) => {
    if (Array.isArray(arg)) arg.forEach((item) => item != null && result.add(item));
    else if (arg != null) result.add(arg);
  });
  return result as any;
}
