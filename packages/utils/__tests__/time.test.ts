import { debounce, throttle } from '../src/time';

describe('debounce', () => {
  let func: ReturnType<typeof vi.fn>;
  let debouncedFunc: ReturnType<typeof debounce>;

  beforeEach(() => {
    func = vi.fn();
    debouncedFunc = debounce(func, 100);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should debounce function calls', () => {
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function immediately if leading option is true', () => {
    debouncedFunc = debounce(func, 100, { leading: true });
    debouncedFunc();
    expect(func).toHaveBeenCalledTimes(1);
    debouncedFunc();
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should not invoke function immediately if leading option is false', () => {
    debouncedFunc = debounce(func, 100, { leading: false });
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function after maxWait time', () => {
    debouncedFunc = debounce(func, 100, { maxWait: 150 });
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();
    debouncedFunc();
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();
    debouncedFunc();
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should cancel debounced function', () => {
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    debouncedFunc.cancel();
    vi.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();
  });

  test('should flush debounced function', () => {
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    debouncedFunc.flush();
    expect(func).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  let func: ReturnType<typeof vi.fn>;
  let throttledFunc: ReturnType<typeof throttle>;

  beforeEach(() => {
    func = vi.fn();
    throttledFunc = throttle(func, 100);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should throttle function calls', () => {
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should not invoke function immediately if leading option is false', () => {
    throttledFunc = throttle(func, 100, { leading: false });
    throttledFunc();
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(func).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function at most once during trailing edge', () => {
    throttledFunc = throttle(func, 100, { trailing: true });
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(99);
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(200);
    expect(func).toHaveBeenCalledTimes(2);
  });
});
