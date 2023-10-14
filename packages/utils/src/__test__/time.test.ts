import { debounce, throttle } from '../time';

describe('debounce', () => {
  let func: ReturnType<typeof vi.fn>;
  let debouncedFunc: ReturnType<typeof debounce>;
  let clock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    func = vi.fn();
    debouncedFunc = debounce(func, 100);
    clock = vi.spyOn(Date, 'now').mockImplementation(() => 0);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    clock.mockRestore();
  });

  test('should debounce function calls', () => {
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 99);
    vi.advanceTimersByTime(99);
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 100);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function immediately if leading option is true', () => {
    debouncedFunc = debounce(func, 100, { leading: true });
    debouncedFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 50);
    debouncedFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 150);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should not invoke function immediately if leading option is false', () => {
    debouncedFunc = debounce(func, 100, { leading: false });
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 50);
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 150);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function at most once during maxWait time', () => {
    debouncedFunc = debounce(func, 100, { maxWait: 200 });
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 50);
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 150);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 250);
    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 350);
    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should cancel debounced function', () => {
    debouncedFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 50);
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
  let clock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    func = vi.fn();
    throttledFunc = throttle(func, 100);
    clock = vi.spyOn(Date, 'now').mockImplementation(() => 0);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    clock.mockRestore();
  });

  test('should throttle function calls', () => {
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 99);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 100);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should invoke function immediately if leading option is true', () => {
    throttledFunc = throttle(func, 100, { leading: true });
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 50);
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 150);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(2);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should not invoke function immediately if leading option is false', () => {
    throttledFunc = throttle(func, 100, { leading: false });
    throttledFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 50);
    throttledFunc();
    expect(func).not.toHaveBeenCalled();
    clock.mockImplementation(() => 150);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should invoke function at most once during trailing edge', () => {
    throttledFunc = throttle(func, 100, { trailing: true });
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 99);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 100);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(2);
    clock.mockImplementation(() => 199);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(2);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(3);
  });

  test('should not invoke function during trailing edge', () => {
    throttledFunc = throttle(func, 100, { trailing: false });
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 99);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 100);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 199);
    vi.advanceTimersByTime(99);
    expect(func).toHaveBeenCalledTimes(1);
    clock.mockImplementation(() => 200);
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(2);
  });
});