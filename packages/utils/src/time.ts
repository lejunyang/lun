import { ensureNumber } from './number';

// lodash

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	_wait?: number | string,
	options?: {
		leading?: boolean;
		trailing?: boolean;
		maxWait?: number | string;
	}
) {
	let timerId: ReturnType<typeof setTimeout> | undefined,
		/** last time when debounced func called */ lastCallTime: number,
		/** last time when original func invoked */ lastInvokeTime: number = 0;
	let lastArgs: IArguments | undefined, lastThis: ThisType<T> | undefined, result: ReturnType<T> | undefined;
	let { leading, trailing = true, maxWait: _maxWait } = options || {};
	const wait = ensureNumber(_wait, 0);
	const maxWait = _maxWait !== undefined ? Math.max(ensureNumber(_maxWait, 0), wait) : null;

	function invokeFunc(time: number) {
		const args = lastArgs,
			thisArg = lastThis;
		lastArgs = lastThis = undefined;
		lastInvokeTime = time;
		result = func.apply(thisArg, args as any);
		return result;
	}

	const shouldInvoke = (time: number) => {
		const timeSinceLastCall = time - lastCallTime,
			timeSinceLastInvoke = time - lastInvokeTime;
		return (
			lastCallTime === undefined || // first call
			timeSinceLastCall >= wait ||
			timeSinceLastCall < 0 || // it happens only when manually modify system time
			(maxWait !== null && timeSinceLastInvoke >= maxWait)
		);
	};

	/** 
	 * Reset `maxWait` timer's invoke time by setting `lastInvokeTime`.
	 * Set timer for trailing edge.
	 * Invoke the func if leading is true and return the result.
	 */
	function leadingEdge(time: number) {
		lastInvokeTime = time;
		timerId = setTimeout(timerExpired, wait);
		return leading ? invokeFunc(time) : result;
	}

	/**
	 * clear timeId\
	 * invoke the func if trailing is true and lastArgs is defined\
	 * clear lastArgs and lastThis(lastArgs is defined only when debounced is called. set lastArgs to undefined, so that if any timerExpired triggers trailingEdge)
	 */
	function trailingEdge(time: number) {
		timerId = undefined;
		if (trailing && lastArgs) {
			return invokeFunc(time);
		}
		lastArgs = lastThis = undefined;
		return result;
	}

	function timerExpired() {
		const time = Date.now();
		if (shouldInvoke(time)) {
			return trailingEdge(time);
		}
		const timeSinceLastCall = time - lastCallTime,
			timeSinceLastInvoke = time - lastInvokeTime,
			timeWaiting = wait - timeSinceLastCall;
		const remainingWait = maxWait !== null ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
		timerId = setTimeout(timerExpired, remainingWait); // Restart the `timerExpired` timer
	}

	const debounced = function (this: ThisType<T>) {
		const time = Date.now();
		const shouldInvokeNow = shouldInvoke(time);
		lastCallTime = time;
		lastArgs = arguments;
		lastThis = this;
		if (shouldInvokeNow) {
			// if no timer, start leading edge
			if (timerId === undefined) return leadingEdge(lastCallTime);
			// if time is defined and set maxWait, invoke
			if (maxWait !== null) {
				timerId = setTimeout(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}
		if (timerId === undefined) {
			timerId = setTimeout(timerExpired, wait);
		}
		return result;
	} as T & { flush: () => ReturnType<T>; cancel: () => void };
	Object.assign(debounced, {
		flush() {
			return timerId === undefined ? result : trailingEdge(Date.now());
		},
		cancel() {
			if (timerId !== undefined) clearTimeout(timerId);
			lastInvokeTime = 0;
			lastCallTime = (lastArgs = lastThis = timerId = undefined) as any;
		},
	});

	return debounced;
}

export const throttle = function <T extends (...args: any[]) => any>(
	func: T,
	wait?: number | string,
	options?: {
		leading?: boolean;
		trailing?: boolean;
	}
) {
	return debounce(func, wait, {
		maxWait: wait,
		leading: options?.leading === undefined ? true : options?.leading,
		trailing: options?.trailing,
	});
};


export function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}