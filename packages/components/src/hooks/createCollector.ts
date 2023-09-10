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
} from 'vue';
import { VueElementConstructor } from '../custom/apiCustomElement';

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

export function createCollector<
	P,
	C,
	ParentProps = P extends VueElementConstructor<ExtractPropTypes<infer T>> ? T : Data,
	ChildProps = C extends VueElementConstructor<ExtractPropTypes<infer T>> ? T : Data
>(name: string, _parentComp?: P, _childComp?: C) {
	const set = new Set<InstanceWithProps<ChildProps>>();
	const items = shallowRef(set);
	const COLLECTOR_KEY = Symbol(`l-collector-${name}`);
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
	return { parent, child };
}
