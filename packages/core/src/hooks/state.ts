import { computed, ref, shallowRef, watchEffect, WatchOptionsBase } from 'vue';

/**
 * create a temporary ref，which means ref value is initialized with getter and you can change it as you want, but it will reset the value when getter updates
 * @param getter
 * @param options
 * @returns
 */
export function useTempState<T>(getter: () => T, options?: WatchOptionsBase) {
	const local = shallowRef<T>(getter());
	watchEffect(() => {
		local.value = getter();
	}, options);
	return local;
}

/**
 * return a writable computed which is compatible with promise, if you set the value with promise, the value will not change until the promise resolve or reject
 * @param initialValue
 * @param errorValueGetter
 * @returns
 */
export function usePromiseRef<T>(initialValue: T, errorValueGetter?: (err: any) => any) {
	const local = ref<Awaited<T>>();
	const handlePromise = (maybePromise: any) => {
		if (maybePromise instanceof Promise) {
			Promise.resolve(maybePromise)
				.then((val) => {
					local.value = val;
				})
				.catch((e) => {
					if (errorValueGetter instanceof Function) local.value = errorValueGetter(e);
				});
		} else local.value = maybePromise;
	};
	const result = computed({
		get() {
			return local.value;
		},
		set: handlePromise,
	});
	handlePromise(initialValue);
	return result;
}
