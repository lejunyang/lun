import type { WritableComputedRef, UnwrapRef, Ref } from 'vue';
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';

interface UseModelOptions<T, Passive extends boolean = false> {
	passive?: Passive;
	eventName?: string;
	deep?: boolean;
	defaultValue?: T;
	clone?: boolean | ((val: T) => T);
	shouldEmit?: (v: T) => boolean;
}

export function createUseModel({ defaultKey, defaultEvent }: { defaultKey: string; defaultEvent: string }) {
	// copy from @vue/use useVModel
	return function <P extends object, K extends keyof P, Passive extends boolean>(
		props: P,
		_key?: K,
		emit?: (name: string, ...args: any[]) => void,
		options?: UseModelOptions<P[K], Passive>
	) {
		let { passive, eventName, deep, defaultValue, shouldEmit, clone } = options || {};
		const key = _key || (defaultKey as K);
		const event = eventName || defaultEvent;
		const vm = getCurrentInstance();
		if (!emit && vm) {
			emit = vm.emit || vm.proxy?.$emit?.bind(vm.proxy);
		}
		const cloneFn = (val: P[K]) =>
			!clone ? val : clone instanceof Function ? clone(val) : JSON.parse(JSON.stringify(val));
		const getter = () => (props[key!] !== undefined ? cloneFn(props[key!]) : defaultValue);
		const triggerEmit = (value: P[K]) => {
			if (!shouldEmit || shouldEmit(value)) {
				emit!(event, value);
			}
		};
		if (passive) {
			const initialValue = getter();
			const proxy = ref<P[K]>(initialValue!);
			let isUpdating = false;
			watch(
				() => props[key!],
				(v) => {
					if (!isUpdating) {
						isUpdating = true;
						(proxy as any).value = cloneFn(v);
						nextTick(() => (isUpdating = false));
					}
				}
			);
			watch(
				proxy,
				(v) => {
					if (!isUpdating && (v !== props[key!] || deep)) triggerEmit(v as P[K]);
				},
				{ deep }
			);

			return proxy;
		} else {
			return computed<P[K]>({
				get() {
					return getter()!;
				},
				set(value) {
					triggerEmit(value);
				},
			});
		}
	};
}

export interface UseModel {
	<P extends object, K extends keyof P, Name extends string>(
		props: P,
		key?: K,
		emit?: (name: Name, ...args: any[]) => void,
		options?: UseModelOptions<P[K], false>
	): WritableComputedRef<P[K]>;
	<P extends object, K extends keyof P, Name extends string>(
		props: P,
		key?: K,
		emit?: (name: Name, ...args: any[]) => void,
		options?: UseModelOptions<P[K], true>
	): Ref<UnwrapRef<P[K]>>;
}
