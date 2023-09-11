import { shallowReactive, ShallowReactive } from 'vue';

type RefValueType<V> = V extends new (...args: any[]) => infer Refer ? Refer : V;

export function useRefs<T extends Record<string, any>>(
	init: T
): {
	refs: ShallowReactive<{
		[k in keyof T]: RefValueType<T[k]> | null | undefined;
	}>;
	onRef: {
		[k in keyof T]: (val: RefValueType<T[k]> | null | undefined) => void;
	};
} {
	const refs = shallowReactive(
		Object.keys(init).reduce((r, c) => {
			r[c] = null;
			return r;
		}, {} as Record<string, any>)
	);
	const onRefs = Object.keys(init).reduce((r, c) => {
		r[c] = (current: any) => {
			refs[c] = current;
		};
		return r;
	}, {} as Record<string, any>);
	return { refs, onRefs } as any;
}