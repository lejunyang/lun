import { inject, getCurrentInstance, provide, onBeforeUnmount } from 'vue';

const EVENT_PROVIDER_KEY = Symbol('setup-event');

export type Events = Record<string, (...args: any[]) => void>;

/**
 * Create an event context. When current component emits an event, it will bubble that event, which means it will trigger all the context parent's listeners
 * @param events
 */
export function useSetupEvent(events?: Events) {
	const ctx = getCurrentInstance()!;
	if (!ctx || !ctx.event) {
		throw new Error('Do not use `useSetupEvent` outside the defineCustomElement setup function scope');
	}
	const { event } = ctx;

	const parentSubscribedEvents = inject<Events>(EVENT_PROVIDER_KEY);
	let unsubscribes: Function[] = [];
	const currentProvide: Events = {};
	Object.keys({ ...ctx.emitsOptions }).forEach((k) => {
		currentProvide[k] = (...args) => {
			if (events?.[k] instanceof Function) events[k](...args);
			if (parentSubscribedEvents?.[k] instanceof Function) parentSubscribedEvents[k](...args);
		};
		unsubscribes.push(event.on(k, currentProvide[k]));
	});
	provide(EVENT_PROVIDER_KEY, currentProvide);
	onBeforeUnmount(() => unsubscribes.forEach((fn) => fn()));
}

const CONTEXT_EVENT_PROVIDER_KEY = Symbol('setup-context-event');

/**
 * Create an event context. When current component emits an event, it will also emit that event to its context parent.\
 * Comparing to useSetupEvent, it doesn't bubble the event
 * @param events
 */
export function useSetupContextEvent(events?: Events) {
	const ctx = getCurrentInstance()!;
	if (!ctx || !ctx.event) {
		throw new Error('Do not use `useSetupContextEvent` outside the defineCustomElement setup function scope');
	}
	const { event } = ctx;

	const parentSubscribedEvents = inject<Events>(CONTEXT_EVENT_PROVIDER_KEY);
	let unsubscribes: Function[] = [];
	Object.keys({ ...ctx.emitsOptions }).forEach((k) => {
		if (parentSubscribedEvents?.[k] instanceof Function) unsubscribes.push(event.on(k, parentSubscribedEvents[k]));
	});
	provide(CONTEXT_EVENT_PROVIDER_KEY, events);
	onBeforeUnmount(() => unsubscribes.forEach((fn) => fn()));
}
