export type InputPeriod = 'change' | 'input' | 'notComposing';

export type UseInputOptions<T = string> = {
	onChange: (val: T | null) => void;
	changeWhen?: InputPeriod;
	wait?: number;
	waitType?: 'throttle' | 'debounce';
	waitOptions?: any;
	trim?: boolean;
	maxLength?: number;
	restrict?: string | RegExp;
	restrictWhen?: InputPeriod;
	toNullWhenEmpty?: boolean;
	transform?: (val: T | null) => T | null;
	transformWhen?: InputPeriod;
};

export function useInput<T = string>(optionsGetter: () => UseInputOptions<T>) {
	const state = {
		composing: false,
	};
	const utils = {
		transformValue(actionNow: InputPeriod, value: string) {
			const { transform, transformWhen = 'input', toNullWhenEmpty = true } = optionsGetter();
			if (actionNow !== transformWhen) return value as T;
			let newValue: T | null = value as T;
			if (transform instanceof Function) newValue = transform(newValue);
			return !newValue && newValue !== 0 && toNullWhenEmpty ? null : newValue; // 字符这里不需要判断0吗
		},
		handleEvent(actionNow: InputPeriod, e: Event) {
			const { changeWhen = 'input', restrict, trim, maxLength, restrictWhen = 'input', onChange } = optionsGetter();
			const target = e.target as HTMLInputElement;
			if (restrictWhen === actionNow) {
				let value = target.value;
				if (restrict) {
					const regex = restrict instanceof RegExp ? restrict : new RegExp(restrict, 'g');
					value = target.value.replace(regex, '');
				}
				if (maxLength != null) {
					const end = +maxLength;
					if (end >= 0) value = value.substring(0, end);
				}
				if (trim) value = value.trim();
				target.value = value;
			}
			if (changeWhen === actionNow) {
				onChange(utils.transformValue(actionNow, target.value));
			}
		},
	};
	const handlers = {
		// 试一下beforeinput
		onInput(e: Event) {
			console.warn('input', state.composing);
			utils.handleEvent('input', e);
			// 发现一个问题，如果在input里面消除了composition的字符，后续的输入会不断触发compositionStart
			// input事件有一个isComposing属性，兼容性 chrome 60 safari 16.4
			if (!state.composing) utils.handleEvent('notComposing', e);
		},
		onChange(e: Event) {
			const options = optionsGetter();
			// change是否要打底，即使没有写blur
			utils.handleEvent('change', e);
			// inspired by vue3 v-model
			// Safari < 10.2 & UIWebView doesn't fire compositionend when switching focus before confirming composition choice
			// this also fixes the issue where some browsers e.g. iOS Chrome fires "change" instead of "input" on autocomplete.
			if (state.composing && options.changeWhen !== 'change') {
				state.composing = false;
				utils.handleEvent(options.changeWhen || 'input', e);
			}
		},
		onCompositionstart(e: CompositionEvent) {
			state.composing = true;
		},
		onCompositionend(e: CompositionEvent) {
			state.composing = false;
			utils.handleEvent('notComposing', e);
		},
	};
	return [handlers, state] as const;
}
