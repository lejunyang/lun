import { isObject } from '../is';
import { hasOwn, objectGet, objectKeys, objectSet } from './value';

export type ObjectChangeKey = string | number;
export type ObjectChangePath = ObjectChangeKey[];

export interface ObjectChangeState {
  /** Values captured before each tracked key is first accessed or changed. */
  initialValues: Map<string, unknown>;
  /** Paths whose current value differs from its initial value. */
  dirtyKeys: Set<string>;
}

export interface ObjectChange<T = unknown> {
  /** Dot-joined path of the changed key. */
  key: string;
  /** Original path segments of the changed key. */
  path: ObjectChangePath;
  initialValue: unknown;
  previousValue: unknown;
  currentValue: unknown;
  state: ObjectChangeState;
  target: T;
}

export interface ProxyObjectChangesOptions<T extends object = object> {
  /** Capture a key's initial value when it is read, not only when it is changed. */
  trackOnAccess?: boolean;
  /** Proxy nested objects and report nested changes with full paths. */
  deep?: boolean;
  /** Return true when initial and current values should be treated as equal. */
  compare?: (initialValue: unknown, currentValue: unknown, path: ObjectChangePath) => boolean;
  /** Called after every successful set or delete. */
  callback?: (change: ObjectChange<T>) => void;
}

export interface ProxyObjectChangesResult<T extends object> extends ObjectChangeState {
  proxy: T;
  /** Restore tracked keys to their captured initial references and clear dirty state. */
  reset: () => void;
  /** Treat future changes as relative to the current object state. */
  commit: () => void;
  isDirty: () => boolean;
}

function pathToString(path: ObjectChangePath) {
  return path.map(String).join('.');
}

/**
 * Proxy an object and track changed keys by comparing current values with captured initial references.
 * A missing key whose current value is still undefined is not dirty, including setting a new key to undefined.
 * In deep mode, nested property writes use full dot paths, such as `a.b.c`.
 * In deep mode, object-to-object replacement recursively compares child keys and records changed child paths;
 * object-to-primitive and primitive-to-object replacement records only the changed path itself.
 * Circular objects are proxied by access path, so mutating through `self.a` records `self.a`, not every alias path.
 * `reset` restores tracked paths to their captured initial references; it does not deep-clone snapshots.
 * `commit` clears tracked initial values and dirty keys, so later changes are compared against current values.
 */
export function proxyObjectChanges<T extends object>(
  obj: T,
  options: ProxyObjectChangesOptions<T> = {},
): ProxyObjectChangesResult<T> {
  const initialValues = new Map<string, unknown>();
  const dirtyKeys = new Set<string>();
  const proxies = new WeakMap<object, Map<string, object>>();
  const paths = new Map<string, ObjectChangePath>();
  const initialExists = new Map<string, boolean>();
  const proxyTargets = new WeakMap<object, object>();
  const compare = options.compare ?? Object.is;
  let resetting = false;

  const state: ObjectChangeState = {
    initialValues,
    dirtyKeys,
  };

  const updateDirtyKey = (key: string, dirty: boolean) => {
    if (dirty) dirtyKeys.add(key);
    else dirtyKeys.delete(key);
  };

  const removeChildDirtyKeys = (key: string) => {
    const prefix = `${key}.`;
    dirtyKeys.forEach((dirtyKey) => {
      if (dirtyKey.startsWith(prefix)) dirtyKeys.delete(dirtyKey);
    });
  };

  const recordInitialValue = (target: object, key: ObjectChangeKey, path: ObjectChangePath) => {
    const pathKey = pathToString(path);
    if (!initialValues.has(pathKey)) {
      const exists = hasOwn(target, key);
      initialValues.set(pathKey, exists ? (target as any)[key] : undefined);
      initialExists.set(pathKey, exists);
      paths.set(pathKey, path);
    }
    return pathKey;
  };

  const recordDeepObjectChange = (
    initialValue: object,
    currentValue: object,
    path: ObjectChangePath,
    checked = new WeakMap<object, WeakSet<object>>(),
  ) => {
    let currentSet = checked.get(initialValue);
    if (!currentSet) {
      currentSet = new WeakSet();
      checked.set(initialValue, currentSet);
    }
    if (currentSet.has(currentValue)) return;
    currentSet.add(currentValue);

    const keys = new Set([...objectKeys(initialValue), ...objectKeys(currentValue)]);
    keys.forEach((key) => {
      const childPath = [...path, key];
      const childPathKey = recordInitialValue(initialValue, key, childPath);
      const initialChildValue = initialValues.get(childPathKey);
      const currentChildValue = (currentValue as any)[key];
      if (isObject(initialChildValue) && isObject(currentChildValue)) {
        updateDirtyKey(childPathKey, false);
        recordDeepObjectChange(initialChildValue, currentChildValue, childPath, checked);
      } else updateDirtyKey(childPathKey, !compare(initialChildValue, currentChildValue, childPath));
    });
  };

  const recordChange = (path: ObjectChangePath, previousValue: unknown, currentValue: unknown) => {
    if (resetting) return;
    const pathKey = pathToString(path);
    const initialValue = initialValues.get(pathKey);
    if (options.deep && isObject(initialValue) && isObject(currentValue)) {
      updateDirtyKey(pathKey, false);
      recordDeepObjectChange(initialValue, currentValue, path);
    } else {
      removeChildDirtyKeys(pathKey);
      updateDirtyKey(pathKey, !compare(initialValue, currentValue, path));
    }
    options.callback?.({
      key: pathKey,
      path,
      initialValue,
      previousValue,
      currentValue,
      state,
      target: obj,
    });
  };

  const createProxy = (target: object, path: ObjectChangePath): object => {
    const pathKey = pathToString(path);
    let targetProxies = proxies.get(target);
    if (!targetProxies) {
      targetProxies = new Map();
      proxies.set(target, targetProxies);
    }
    const existing = targetProxies.get(pathKey);
    if (existing) return existing;

    const proxy = new Proxy(target, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        if (typeof key === 'symbol') return value;
        const childPath = [...path, key];
        if (options.trackOnAccess) recordInitialValue(target, key, childPath);
        if (options.deep && isObject(value)) return createProxy(value, childPath);
        return value;
      },
      set(target, key, value, receiver) {
        if (typeof key === 'symbol') return Reflect.set(target, key, value, receiver);
        const childPath = [...path, key];
        const previousValue = Reflect.get(target, key, receiver);
        recordInitialValue(target, key, childPath);
        const rawValue = isObject(value) ? proxyTargets.get(value) || value : value;
        const result = Reflect.set(target, key, rawValue, receiver);
        if (result) recordChange(childPath, previousValue, rawValue);
        return result;
      },
      deleteProperty(target, key) {
        if (typeof key === 'symbol') return Reflect.deleteProperty(target, key);
        const childPath = [...path, key];
        const previousValue = (target as any)[key];
        recordInitialValue(target, key, childPath);
        const result = Reflect.deleteProperty(target, key);
        if (result) recordChange(childPath, previousValue, undefined);
        return result;
      },
    });

    targetProxies.set(pathKey, proxy);
    proxyTargets.set(proxy, target);
    return proxy;
  };

  const proxy = createProxy(obj, []) as T;

  return {
    proxy,
    initialValues,
    dirtyKeys,
    reset() {
      resetting = true;
      [...initialValues.entries()]
        .sort(([key1], [key2]) => paths.get(key1)!.length - paths.get(key2)!.length)
        .forEach(([key, value]) => {
          const path = paths.get(key)!;
          if (initialExists.get(key)) objectSet(obj, path as string[], value);
          else {
            const parent = path.length === 1 ? obj : objectGet(obj, path.slice(0, -1) as string[]);
            if (parent != null) delete (parent as any)[path[path.length - 1]];
          }
        });
      resetting = false;
      dirtyKeys.clear();
    },
    commit() {
      initialValues.clear();
      paths.clear();
      initialExists.clear();
      dirtyKeys.clear();
    },
    isDirty() {
      return dirtyKeys.size > 0;
    },
  };
}
