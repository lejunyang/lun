import { getCurrentInstance } from 'vue';

export function useDelegateCEEvents() {
	let delegated = false;
	const vm = getCurrentInstance();
	const onRef = (el?: any) => {
		if (!delegated && el && vm?.rootNotBindEvents) {
			Object.entries(vm.rootNotBindEvents).forEach(([key, record]) => {
				record.forEach((r) => {
					const [func, listener, options] = r;
					el[func](key, listener, options);
				});
			});
			vm.rootNotBindEvents = {};
			delegated = true;
		}
	};
	return onRef;
}
