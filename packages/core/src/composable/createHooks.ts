import { reactive } from 'vue';

export type HookUseContext<H> = {
  /** stop exec following handler */
  stopExec: () => void;
  /** previous handler */
  prevHandler?: H | null;
  /** next handler */
  nextHandler?: H | null;
  /** all handlers */
  handlers: H[];
  /** index of current handler */
  currentIndex: number;
};

export type HookUseParams = {
  /** specify the insert index of this handler */
  index?: number;
  once?: number;
};

export interface SyncInnerHandler<
  Handler extends (arg: Arg, context?: HookUseContext<SyncInnerHandler<Handler>>) => Arg | void = () => void,
  Arg extends unknown = Parameters<Handler>[0]
> {
  (arg: Arg, context: HookUseContext<Handler>): Arg | void;
}

export interface CreateSyncHook {
  <
    Handler extends (arg: Arg, context?: HookUseContext<SyncInnerHandler<Handler>>) => Arg | void = () => void,
    Arg extends unknown = Parameters<Handler>[0],
    InnerHandler extends Function = SyncInnerHandler<Handler, Arg>
  >(
    isReactive?: boolean
  ): {
    use(handler: InnerHandler, params?: HookUseParams): () => void;
    eject(handler: InnerHandler): void;
    exec(arg: Arg): Arg;
    getListeners(): InnerHandler[];
    state: { innerHandlers: InnerHandler[] };
  };
}

export const createSyncHooks: CreateSyncHook = function createSyncHooks<
  Handler extends (arg: Arg, context?: HookUseContext<SyncInnerHandler<Handler>>) => Arg | void = () => void,
  Arg extends unknown = Parameters<Handler>[0],
  InnerHandler extends Function = SyncInnerHandler<Handler>
>(isReactive?: boolean) {
  const state: { innerHandlers: InnerHandler[] } = isReactive ? reactive({ innerHandlers: [] }) : { innerHandlers: [] };
  const onceSet = new WeakSet<InnerHandler>();

  const use = (handler: InnerHandler, params?: HookUseParams) => {
    const { index, once } = params || {};
    if (index !== undefined && index > -1 && index < state.innerHandlers.length) {
      state.innerHandlers.splice(index, 0, handler);
    } else state.innerHandlers.push(handler);
    if (once) onceSet.add(handler);
    return () => eject(handler);
  };

  const eject = (handler: InnerHandler) => {
    const index = state.innerHandlers.indexOf(handler);
    if (index > -1) state.innerHandlers.splice(index, 1);
  };

  const exec = (arg: Arg): Arg => {
    if (state.innerHandlers.length === 0) return arg;
    const innerHandlers = [...state.innerHandlers];
    let index = 0;
    let innerHandler = innerHandlers[index];
    let isStopped = false;
    let hasOnce = false;
    while (innerHandler) {
      hasOnce ||= onceSet.has(innerHandler);
      const context = {
        currentIndex: index,
        prevHandler: innerHandlers[index - 1],
        nextHandler: innerHandlers[index + 1],
        handlers: innerHandlers,
        stopExec: () => (isStopped = true),
      };
      let newArg = innerHandler(arg, context);
      if (newArg !== undefined) arg = newArg;
      if (isStopped) return arg;
      index++;
      innerHandler = innerHandlers[index];
    }
    if (hasOnce) state.innerHandlers = state.innerHandlers.filter((i) => !onceSet.has(i));
    return arg;
  };

  return { use, eject, exec, state, getListeners: () => [...state.innerHandlers] };
};

export interface AsyncInnerHandler<
  Handler extends (
    arg: Arg,
    context?: HookUseContext<AsyncInnerHandler<Handler>>
  ) => Arg | void | Promise<Arg | void> = () => void,
  Arg extends unknown = Parameters<Handler>[0]
> {
  (arg: Arg, context: HookUseContext<Handler>): Arg | void | Promise<Arg | void>;
}
export interface CreateAsyncHook {
  <
    Handler extends (
      arg: Arg,
      context?: HookUseContext<AsyncInnerHandler<Handler>>
    ) => Arg | void | Promise<Arg | void> = () => void,
    Arg extends unknown = Parameters<Handler>[0],
    InnerHandler extends Function = AsyncInnerHandler<Handler>
  >(): {
    use(handler: InnerHandler, params?: HookUseParams): () => void;
    eject(handler: InnerHandler): void;
    exec(arg: Arg): Promise<Arg>;
    getListeners(): InnerHandler[];
  };
}

export const createHooks: CreateAsyncHook = function createHooks<
  Handler extends (
    arg: Arg,
    context?: HookUseContext<AsyncInnerHandler<Handler>>
  ) => Arg | void | Promise<Arg | void> = () => void,
  Arg extends unknown = Parameters<Handler>[0],
  InnerHandler extends Function = AsyncInnerHandler<Handler>
>() {
  let innerHandlers: InnerHandler[] = [];
  const onceSet = new WeakSet<InnerHandler>();

  const use = (handler: InnerHandler, params?: HookUseParams) => {
    const { index, once } = params || {};
    if (index !== undefined && index > -1 && index < innerHandlers.length) {
      innerHandlers.splice(index, 0, handler);
    } else innerHandlers.push(handler);
    if (once) onceSet.add(handler);
    return () => eject(handler);
  };

  const eject = (handler: InnerHandler) => {
    const index = innerHandlers.indexOf(handler);
    if (index > -1) innerHandlers.splice(index, 1);
  };

  const exec = async (arg: Arg): Promise<Arg> => {
    if (innerHandlers.length === 0) return arg;
    let index = 0;
    const handlers = [...innerHandlers];
    let innerHandler = handlers[index];
    let isStopped = false;
    let hasOnce = false;
    while (!!innerHandler) {
      hasOnce ||= onceSet.has(innerHandler);
      const context = {
        currentIndex: index,
        prevHandler: handlers[index - 1],
        nextHandler: handlers[index + 1],
        handlers,
        stopExec: () => (isStopped = true),
      };
      let newArg = await innerHandler(arg, context);
      if (newArg !== undefined) arg = newArg;
      if (isStopped) return arg;
      index++;
      innerHandler = handlers[index];
    }
    if (hasOnce) innerHandlers = innerHandlers.filter((i) => !onceSet.has(i));
    return arg;
  };
  return { use, eject, exec, getListeners: () => [...innerHandlers] };
};
