import { ensureNumber, isEnterDown, toNumberIfValid, toNumberOrNull } from '@lun/utils';
import { computed, reactive } from 'vue';
export type InputPeriod = 'change' | 'input' | 'notComposing';
export type InputType = 'text' | 'number' | 'number-text';

export type UseInputOptions<
	IType extends InputType = 'text',
	T = InputType extends 'number' | 'number-text' ? number : string
> = {
	type?: IType;
	onChange: (val: T | null) => void;
	changeWhen?: InputPeriod;
	wait?: number;
	waitType?: 'throttle' | 'debounce';
	waitOptions?: any;
	trim?: boolean;
	maxLength?: number;
	restrict?: string | RegExp;
	restrictWhen?: InputPeriod | 'beforeInput';
	toNullWhenEmpty?: boolean;
	transform?: (val: T | null) => T | null;
	transformWhen?: InputPeriod;
	onEnterDown?: (e: KeyboardEvent) => void;
	/**
	 * enterDown event will not be emitted when composing by default
	 */
	emitEnterDownWhenComposing?: boolean;

	min?: string | number;
	max?: string | number;
	precision?: string | number;
	step?: string | number;
	strictStep?: boolean;
	noExponent?: boolean;
	/**
	 * if it's true, will replace '。' with '.'，when type is 'number-text', so that users can input dot symbol directly under chinese input method
	 */
	optimizeChPeriodSymbolForNum?: boolean;
};

export type UseInputState = {
	composing: boolean;
};

function handleNumberBeforeInput<
	IType extends InputType = 'text',
	ValueType = IType extends 'number' | 'number-text' ? number : string
>(
	e: InputEvent,
	{
		type,
		min,
		max,
		noExponent,
		precision,
		step,
		strictStep,
		optimizeChPeriodSymbolForNum,
	}: UseInputOptions<IType, ValueType>
) {
	if (!e.data || (type !== 'number' && type !== 'number-text')) return;
	min = Number(min);
	max = Number(max);
	precision = Number(precision);
	step = Number(step);
	const noDecimal = precision === 0 || (strictStep && Number.isInteger(step));
	const noNegativeSymbol = min >= 0 && noExponent; // negative symbol is also allowed even if min >= 0, for example 1e-2(but require noDecimal === false)
	let allowChars = `${optimizeChPeriodSymbolForNum ? '。' : ''}${noExponent ? '' : 'eE'}${
		noNegativeSymbol ? '' : '\\-'
	}${max <= 0 ? '' : '+'}${noDecimal ? '' : '.'}`;
	if (e.data && e.data.match(new RegExp(`[^\\s0-9${allowChars}]`))) {
		console.log('prevented', allowChars);
		return e.preventDefault();
	}
	const target = e.target as HTMLInputElement;
	// below codes rely on selectionStart and selectionEnd. The input element's type ('number') does not support selectionStart and selectionEnd.
	if (target?.selectionStart == null) return;
	const selectionStart = target.selectionStart || 0,
		selectionEnd = target.selectionEnd || 0;
	const { value } = target;
	let nextVal = value.substring(0, selectionStart) + e.data + target.value.substring(selectionEnd);
	nextVal = nextVal.replace(/\s/g, ''); // eliminate all spaces
	console.log('nextVal', nextVal);
	const firstChar = nextVal.charAt(0);
	const isNegative = firstChar === '-',
		isPositive = firstChar === '+';
	// remove the first symbol
	if (isNegative || isPositive) nextVal = nextVal.substring(1);
	// [-+]?[0-9]*.?([eE])?
	const splitsByDot = nextVal.split('.');
	console.log('splitsByDot', splitsByDot);
	// more than two dot symbols; if length = 2, index=0 is integer part, check if any useless symbols exist in the integer part
	if (splitsByDot.length > 2 || (splitsByDot.length === 2 && splitsByDot[0].match(/[-+eE]/))) return e.preventDefault();
	const rightPart = splitsByDot[splitsByDot.length - 1];
	const splitsByE = rightPart.split(/[eE]/);
	console.log('splitsByE', splitsByE);
	if (splitsByE.length > (noExponent ? 1 : 2)) return e.preventDefault();
	// if noExponent is true, '-+' can not exist in the decimal part
	if (splitsByE.length === 1 && splitsByE[0].match(/[-+]/)) return e.preventDefault();
	// if exponent, '-' is allowed only when noDecimal is false
	if (splitsByE.length === 2 && splitsByE[1] && !splitsByE[1].match(new RegExp(`[${noDecimal ? '' : '-'}+]?\\d+`)))
		return e.preventDefault();
}

export function useInput<
	IType extends InputType = 'text',
	ValueType = IType extends 'number' | 'number-text' ? number : string,
	Handlers extends string =
		| 'onBeforeinput'
		| 'onInput'
		| 'onChange'
		| 'onCompositionstart'
		| 'onCompositionend'
		| 'onKeydown',
	E extends Function = (e: Event, optionsGetter: () => UseInputOptions<IType, ValueType>, state: UseInputState) => void
>(optionsGetter: () => UseInputOptions<IType, ValueType>, extraHandlers?: Partial<Record<Handlers, E>>) {
	const options = computed(optionsGetter);
	const state = reactive({
		composing: false,
	});
	const utils = {
		transformValue(actionNow: InputPeriod, value: string) {
			const { transform, transformWhen = 'input', toNullWhenEmpty = true } = options.value;
			if (actionNow !== transformWhen) return value as ValueType;
			let newValue: ValueType | null = value as ValueType;
			if (transform instanceof Function) newValue = transform(newValue);
			return !newValue && newValue !== 0 && toNullWhenEmpty ? null : newValue;
		},
		handleEvent(actionNow: InputPeriod, e: Event) {
			const {
				changeWhen = 'input',
				restrict,
				optimizeChPeriodSymbolForNum = true,
				trim,
				maxLength,
				restrictWhen = 'input',
				onChange,
				type = 'text',
			} = options.value;
			const target = e.target as HTMLInputElement;
			if (restrictWhen === actionNow) {
				let value = target.value;
				if (type === 'number-text') {
					// native input[type="number"] will eliminate all spaces, we follow that
					value = value.replace(/\s/g, '');
					if (optimizeChPeriodSymbolForNum) value = value.replace(/。/g, '.');
				}
				if (restrict) {
					const regex = restrict instanceof RegExp ? restrict : new RegExp(restrict, 'g');
					value = target.value.replace(regex, '');
				}
				if (maxLength != null) {
					const end = +maxLength;
					if (end >= 0) value = value.substring(0, end);
				}
				if (trim) value = value.trim();
				// only reassign when it's changed
				// When type = number, value is a empty string when it's not a valid number, you can't assign target.value at this time otherwise the input will clear
				// For example, you input '-', trigger input event, but value is '', if you set target.value = '', input will be cleared
				if (value !== target.value) target.value = value;
			}
			if (changeWhen === actionNow) {
				const transformedVal = utils.transformValue(actionNow, target.value);
				onChange(
					// type.startsWith('number') && transformedVal != null
					// 	? (toNumberOrNull(transformedVal) as ValueType)
					// 	: transformedVal
					transformedVal
				);
			}
		},
	};
	const handlers = {
		onBeforeinput(e: InputEvent) {
			const target = e.target as HTMLInputElement;
			console.log('before input', e.data, e);
			console.log({
				dir: target.selectionDirection,
				start: target.selectionStart,
				end: target.selectionEnd,
				startChar: target.value.charAt(target.selectionStart || 0),
				range: [...e.getTargetRanges()],
			});

			// native number: 粘贴内容如果包含原来就输不进去的内容，那么就取消粘贴，但是空白字符除外，空白字符都会被消除。发现native奇怪的问题，双击空格，会输入小数点
			let {
				restrict,
				restrictWhen,
			} = options.value;
			handleNumberBeforeInput(e, options.value);
			if (e.defaultPrevented) return;
			if (e.data && restrict && restrictWhen === 'beforeInput' && e.inputType.startsWith('insert')) {
				const nextVal =
					target.value.substring(0, target.selectionStart || 0) +
					e.data +
					target.value.substring(target.selectionEnd || 0);
				console.log('nextVal', nextVal);
				const regex = restrict instanceof RegExp ? restrict : new RegExp(restrict, 'g');
				if (nextVal.match(regex)) e.preventDefault();
			}
		},
		onInput(e: Event) {
			console.log('input');
			utils.handleEvent('input', e);
			// 发现一个问题，如果在input里面消除了composition的字符，后续的输入会不断触发compositionStart
			if (!state.composing) utils.handleEvent('notComposing', e);
		},
		onChange(e: Event) {
			const { changeWhen = 'input' } = options.value;
			utils.handleEvent('change', e);
			// inspired by vue3 v-model
			// Safari < 10.2 & UIWebView doesn't fire compositionend when switching focus before confirming composition choice
			// this also fixes the issue where some browsers e.g. iOS Chrome fires "change" instead of "input" on autocomplete.
			if (state.composing && changeWhen !== 'change') {
				state.composing = false;
				utils.handleEvent(changeWhen || 'input', e);
			}
		},
		onCompositionstart(e: Event) {
			state.composing = true;
		},
		onCompositionend(e: Event) {
			state.composing = false;
			console.log('composition end');
			utils.handleEvent('notComposing', e);
		},
		onKeydown(e: KeyboardEvent) {
			console.log('e.key', e.key);
			const { onEnterDown, emitEnterDownWhenComposing } = options.value;
			if (onEnterDown instanceof Function && isEnterDown(e)) {
				if (!state.composing || emitEnterDownWhenComposing) onEnterDown(e);
			}
		},
	} as Record<Handlers, (e: Event) => void>;
	if (extraHandlers) {
		Object.keys(handlers).forEach((_k) => {
			const k = _k as Handlers;
			if (k in extraHandlers && extraHandlers[k] instanceof Function) {
				handlers[k] = (e: any) => {
					handlers[k](e);
					extraHandlers[k]!(e, optionsGetter, state);
				};
			}
		});
	}
	return [handlers, state] as const;
}
