import { PropType, onBeforeUnmount, onUnmounted } from 'vue';
import { useInput, useSetupEdit, Responsive, useComputedBreakpoints } from '@lun/core';
import { defineCustomFormElement } from 'custom';
import { setDefaultsForPropOptions } from 'utils';
import { useVModelCompatible, useValueModel } from 'hooks';
import { editStateProps, inputProps } from 'common';
import { GlobalStaticConfig } from 'config';

const LInput = defineCustomFormElement({
	name: GlobalStaticConfig.nameMap.input,
	inheritAttrs: false,
	props: {
		...editStateProps,
		label: { type: String },
		labelType: { type: String as PropType<'float'> },
		size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>>, default: '1' },
		showLengthInfo: { type: Boolean },
		showClearIcon: { type: Boolean },
		...setDefaultsForPropOptions(inputProps, GlobalStaticConfig.defaultProps.input),
	},
	styles: GlobalStaticConfig.styles.input,
	emits: ['update', 'enterDown'],
	setup(props, { emit, attrs }) {
		const valueModel = useValueModel(props);
		const { updateVModel } = useVModelCompatible();
		const [editComputed] = useSetupEdit();

		const inputSizeClass = useComputedBreakpoints(() => props.size, 'l-input-size');

		const [inputHandlers] = useInput(() => ({
			...props,
			onChange: (val) => {
				updateVModel(val);
				emit('update', val);
			},
			onEnterDown(e) {
				emit('enterDown', e);
			},
		}));
		onBeforeUnmount(() => {
			console.log('on beforeUnmount');
		})
		onUnmounted(() => {
			console.log('unmmmmmm');
		})
		// TODO mouse enter add class to show the clear button.  animation, hide suffix slot(render both, z-index?)
		return () => (
			<span
				part="root"
				class={[
					'l-input-root',
					'l-input-variant-surface',
					inputSizeClass.value,
					valueModel.value ? 'l-input-not-empty' : 'l-input-empty',
				]}>
				<div class="l-input-slot l-input-addon-before" part="addon-before">
					<slot name="addon-before"></slot>
				</div>
				<label class="l-input-label" part="label">
					<div class="l-input-slot l-input-prefix" part="prefix">
						<slot name="prefix"></slot>
						{props.labelType === 'float' && (
							<div class="l-input-label l-input-float-label" part="float-label">
								{props.label}
								<div class="l-input-float-label-back">{props.label}</div>
							</div>
						)}
					</div>
					<span style="position: relative">
						{/* render when value is defined，in case it covers float label and placeholder */}
						{valueModel.value && (
							<div class="l-input l-input-custom-renderer">
								<slot name="renderer"></slot>
							</div>
						)}
						<input
							{...attrs}
							type={props.type}
							id="input"
							part="input"
							class={['l-input']}
							value={valueModel.value}
							placeholder={props.placeholder}
							disabled={editComputed.value.disabled}
							readonly={editComputed.value.readonly}
							{...inputHandlers}
						/>
					</span>
					<div class="l-input-back" />
					<div
						class={['l-input-slot l-input-suffix', props.showClearIcon && 'l-input-suffix-with-clear']}
						part="suffix">
						{props.showClearIcon && <span class="l-input-clear-icon">x</span>}
						<slot name="suffix">
							<span class="l-input-clear-icon">x</span>
						</slot>
					</div>
					{props.maxLength! >= 0 && (
						<div class="l-input-length-info">
							{valueModel.value?.length || '0'}/{props.maxLength}
						</div>
					)}
				</label>
				<div class="l-input-slot l-input-addonAfter" part="addon-after">
					<slot name="addon-after"></slot>
				</div>
			</span>
		);
	},
});

export function defineInput(name?: string) {
	name = GlobalStaticConfig.nameMap.input;
	if (!customElements.get(name)) {
		GlobalStaticConfig.actualNameMap['input'].add(name);
		customElements.define(name, LInput);
	}
}

export default LInput;

declare module 'vue' {
	export interface GlobalComponents {
		LInput: typeof LInput;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'l-input': typeof LInput;
	}
}
