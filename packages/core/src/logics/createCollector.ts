import {
	ComponentInternalInstance,
	getCurrentInstance,
	provide,
	shallowRef,
	ShallowRef,
	inject,
	onMounted,
	onBeforeUnmount,
	markRaw,
	triggerRef,
	ExtractPropTypes,
	ComponentObjectPropsOptions,
	VueElementConstructor,
} from 'vue';

type Data = Record<string, unknown>;
type InstanceWithProps<P = Data> = ComponentInternalInstance & {
	props: P;
};
export type CollectorContext<ParentProps = Data, ChildProps = Data> = {
	parent: InstanceWithProps<ParentProps> | null;
	items: ShallowRef<Set<InstanceWithProps<ChildProps>>>;
	addItem: (child?: InstanceWithProps<ChildProps> | null) => void;
	removeItem: (child?: InstanceWithProps<ChildProps> | null) => void;
	triggerUpdate: () => void;
};

/**
 * create a collector used for collecting component instance between Parent Component and Children Components
 * @param name collector name
 * @param _options used for inferring props type of `parent` and `child`. `parent` and `child` can be `Vue custom element` or `Vue Component Props Option`, or just an object representing their props
 * @returns 
 */
export function createCollector<
	P = Data,
	C = Data,
	ParentProps = P extends VueElementConstructor<ExtractPropTypes<infer T>>
		? T
		: P extends ComponentObjectPropsOptions
		? ExtractPropTypes<P>
		: P,
	ChildProps = C extends VueElementConstructor<ExtractPropTypes<infer T>>
		? T
		: P extends ComponentObjectPropsOptions
		? ExtractPropTypes<P>
		: C
>(name?: string, _options?: { parent?: P; child?: C }) {
	const set = new Set<InstanceWithProps<ChildProps>>();
	const items = shallowRef(set);
	const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name}` : '');
	const parent = () => {
		let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
		if (instance) instance = markRaw(instance);
		const triggerUpdate = () => {
			triggerRef(items);
		};
		provide<CollectorContext<ParentProps, ChildProps>>(COLLECTOR_KEY, {
			parent: instance,
			items,
			addItem(child) {
				if (child) {
					items.value.add(child);
					triggerUpdate();
				}
			},
			removeItem(child) {
				if (child) {
					items.value.delete(child);
					triggerUpdate();
				}
			},
			triggerUpdate,
		});
		return items;
	};
	const child = () => {
		let instance = getCurrentInstance() as InstanceWithProps<ChildProps> | null;
		if (instance) instance = markRaw(instance);
		const context = inject<CollectorContext<ParentProps, ChildProps>>(COLLECTOR_KEY);
		if (context) {
			onMounted(() => context.addItem(instance));
			onBeforeUnmount(() => context.removeItem(instance));
		}
		return context;
	};
	return { parent, child, COLLECTOR_KEY };
}