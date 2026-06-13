import { proxyObjectChanges } from '../../src/object';

const dirtyKeys = (keys: Set<string>) => [...keys];
const collectChange = (items: any[]) => (change: any) => items.push({ ...change, dirtyKeys: dirtyKeys(change.state.dirtyKeys) });
const changeSummary = (items: any[]) =>
  items.map(({ key, initialValue, previousValue, currentValue }: any) => ({
    key,
    initialValue,
    previousValue,
    currentValue,
  }));
const dirtyKeySummary = (items: any[]) => items.map(({ dirtyKeys }: any) => dirtyKeys);

describe('proxyObjectChanges', () => {
  test('tracks shallow changes', () => {
    const obj = { a: 1, b: undefined as number | undefined };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, {
      callback: collectChange(callbacks),
    });

    tracked.proxy.a = 2;
    tracked.proxy.b = undefined;
    (tracked.proxy as any).c = undefined;

    expect(tracked.initialValues.get('a')).toBe(1);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: 2 },
      { key: 'b', initialValue: undefined, previousValue: undefined, currentValue: undefined },
      { key: 'c', initialValue: undefined, previousValue: undefined, currentValue: undefined },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a'], ['a'], ['a']]);
    expect(callbacks[0].state.initialValues).toBe(tracked.initialValues);
    expect(callbacks[0].state.dirtyKeys).toBe(tracked.dirtyKeys);
    expect(callbacks[0].target).toBe(obj);
    expect(tracked.isDirty()).toBe(true);
  });

  test('removes dirty key when value changes back to initial value', () => {
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges({ a: 1 }, { callback: collectChange(callbacks) });

    tracked.proxy.a = 2;
    tracked.proxy.a = 1;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual([]);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: 2 },
      { key: 'a', initialValue: 1, previousValue: 2, currentValue: 1 },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a'], []]);
    expect(tracked.isDirty()).toBe(false);
  });

  test('tracks deletes by comparing with undefined', () => {
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges({ a: 1, b: undefined as number | undefined }, { callback: collectChange(callbacks) });

    delete (tracked.proxy as any).a;
    delete (tracked.proxy as any).b;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: undefined },
      { key: 'b', initialValue: undefined, previousValue: undefined, currentValue: undefined },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a'], ['a']]);
  });

  test('records initial values on access when trackOnAccess is enabled', () => {
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges({ a: 1 }, { trackOnAccess: true, callback: collectChange(callbacks) });

    expect(tracked.proxy.a).toBe(1);
    tracked.proxy.a = 2;

    expect(tracked.initialValues.get('a')).toBe(1);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a']);
    expect(changeSummary(callbacks)).toEqual([{ key: 'a', initialValue: 1, previousValue: 1, currentValue: 2 }]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a']]);
  });

  test('uses custom compare', () => {
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(
      { a: 1 },
      {
        compare: (initial, current) => Math.abs((initial as number) - (current as number)) < 2,
        callback: collectChange(callbacks),
      },
    );

    tracked.proxy.a = 2;
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual([]);
    tracked.proxy.a = 3;
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: 2 },
      { key: 'a', initialValue: 1, previousValue: 2, currentValue: 3 },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([[], ['a']]);
  });

  test('tracks deep changes with full paths', () => {
    const obj = { a: { b: { c: 1 } } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, {
      deep: true,
      callback: collectChange(callbacks),
    });

    tracked.proxy.a.b.c = 2;

    expect(tracked.initialValues.get('a.b.c')).toBe(1);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a.b.c']);
    expect(changeSummary(callbacks)).toEqual([{ key: 'a.b.c', initialValue: 1, previousValue: 1, currentValue: 2 }]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a.b.c']]);
  });

  test('records parent path when object changes to undefined', () => {
    const obj = { a: 1, nested: { b: 2, c: 3 } } as { a: number; nested?: { b: number; c: number } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });
    const initialNested = obj.nested;

    tracked.proxy.nested!.b = 4;
    tracked.proxy.nested = undefined;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['nested']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'nested.b', initialValue: 2, previousValue: 2, currentValue: 4 },
      { key: 'nested', initialValue: initialNested, previousValue: initialNested, currentValue: undefined },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['nested.b'], ['nested']]);
  });

  test('recursively records child paths when object changes to another object', () => {
    const obj = { nested: { a: 1, b: 2, c: { d: 3 } } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });
    const initialNested = obj.nested;
    const nextNested = { a: 1, b: 4, c: { d: 5 } };

    tracked.proxy.nested = nextNested;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['nested.b', 'nested.c.d']);
    expect(changeSummary(callbacks)).toEqual([{ key: 'nested', initialValue: initialNested, previousValue: initialNested, currentValue: nextNested }]);
    expect(dirtyKeySummary(callbacks)).toEqual([['nested.b', 'nested.c.d']]);
  });

  test('does not overwrite tracked child initial value during object replacement', () => {
    const obj = { nested: { b: 2 } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });
    const initialNested = obj.nested;
    const nextNested = { b: 4 };

    tracked.proxy.nested.b = 4;
    tracked.proxy.nested = nextNested;

    expect(tracked.initialValues.get('nested.b')).toBe(2);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['nested.b']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'nested.b', initialValue: 2, previousValue: 2, currentValue: 4 },
      { key: 'nested', initialValue: initialNested, previousValue: initialNested, currentValue: nextNested },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['nested.b'], ['nested.b']]);
  });

  test('records parent path when primitive changes to object', () => {
    const obj = { nested: 1 as number | { b: number } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });
    const nextNested = { b: 2 };

    tracked.proxy.nested = nextNested;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['nested']);
    expect(changeSummary(callbacks)).toEqual([{ key: 'nested', initialValue: 1, previousValue: 1, currentValue: nextNested }]);
    expect(dirtyKeySummary(callbacks)).toEqual([['nested']]);
  });

  test('does not mark dirty when object changes to equal object', () => {
    const obj = { nested: { b: 2, c: 3 } };
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });
    const initialNested = obj.nested;
    const nextNested = { b: 2, c: 3 };

    tracked.proxy.nested = nextNested;

    expect(dirtyKeys(tracked.dirtyKeys)).toEqual([]);
    expect(changeSummary(callbacks)).toEqual([{ key: 'nested', initialValue: initialNested, previousValue: initialNested, currentValue: nextNested }]);
    expect(dirtyKeySummary(callbacks)).toEqual([[]]);
  });

  test('reset restores recorded initial values and removes initially missing keys', () => {
    const obj = { a: 1, nested: { b: 2 } } as any;
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });

    tracked.proxy.a = 3;
    tracked.proxy.nested.b = 4;
    tracked.proxy.extra = undefined;
    tracked.reset();

    expect(obj).toEqual({ a: 1, nested: { b: 2 } });
    expect('extra' in obj).toBe(false);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual([]);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: 3 },
      { key: 'nested.b', initialValue: 2, previousValue: 2, currentValue: 4 },
      { key: 'extra', initialValue: undefined, previousValue: undefined, currentValue: undefined },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a'], ['a', 'nested.b'], ['a', 'nested.b']]);
  });

  test('commit makes later changes compare against the committed value', () => {
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges({ a: 1 }, { callback: collectChange(callbacks) });

    tracked.proxy.a = 2;
    tracked.commit();
    tracked.proxy.a = 3;

    expect(tracked.initialValues.get('a')).toBe(2);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['a']);
    expect(changeSummary(callbacks)).toEqual([
      { key: 'a', initialValue: 1, previousValue: 1, currentValue: 2 },
      { key: 'a', initialValue: 2, previousValue: 2, currentValue: 3 },
    ]);
    expect(dirtyKeySummary(callbacks)).toEqual([['a'], ['a']]);
  });

  test('handles circular references in deep mode', () => {
    const obj = { a: 1 } as any;
    obj.self = obj;
    const callbacks: any[] = [];
    const tracked = proxyObjectChanges(obj, { deep: true, callback: collectChange(callbacks) });

    tracked.proxy.self.a = 2;

    expect(tracked.initialValues.get('self.a')).toBe(1);
    expect(dirtyKeys(tracked.dirtyKeys)).toEqual(['self.a']);
    expect(changeSummary(callbacks)).toEqual([{ key: 'self.a', initialValue: 1, previousValue: 1, currentValue: 2 }]);
    expect(dirtyKeySummary(callbacks)).toEqual([['self.a']]);
    expect(obj.a).toBe(2);
  });
});
