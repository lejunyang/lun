export function toArrayIfNotNil<T>(target: T): T extends any[] ? T : T extends null | undefined ? unknown[] : T[] {
  return (Array.isArray(target) ? target : target == null ? [] : [target]) as any;
}
