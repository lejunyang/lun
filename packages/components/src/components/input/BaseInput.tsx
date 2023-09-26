import { useInput, useSetupEdit } from '@lun/core';
import { defineCustomFormElement } from 'custom';
import { setDefaultsForPropOptions } from 'utils';
import { editStateProps, inputProps } from 'common';
import { GlobalStaticConfig } from 'config';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';

export const BaseInput = defineCustomFormElement({
	name: GlobalStaticConfig.nameMap['base-input'],
	inheritAttrs: false,
	props: {
		...editStateProps,
		...setDefaultsForPropOptions(inputProps, GlobalStaticConfig.defaultProps['base-input']),
	},
	styles: GlobalStaticConfig.styles['base-input'],
	emits: ['update', 'enterDown'],
	setup(props, { emit, attrs }) {
		useSetupContextEvent();
		const [editComputed] = useSetupEdit();
		const { updateVModel } = useVModelCompatible();

		const [inputHandlers] = useInput(() => ({
			...attrs,
			...props,
			onChange: (val) => {
				updateVModel(val);
				emit('update', val);
			},
			onEnterDown(e) {
				emit('enterDown', e);
			},
		}));

		return () => (
			<input
				{...attrs}
				type={props.type === 'number-text' ? 'tel' : props.type}
				part="input"
				class={['l-base-input']}
				value={props.value}
				placeholder={props.placeholder}
				disabled={editComputed.value.disabled}
				readonly={editComputed.value.readonly}
				{...inputHandlers}
			/>
		);
	},
});

export function defineBaseInput(name?: string) {
	name ||= GlobalStaticConfig.nameMap['base-input'];
	if (!customElements.get(name)) {
		GlobalStaticConfig.actualNameMap['base-input'].add(name);
		customElements.define(name, BaseInput);
	}
}

declare module 'vue' {
	export interface GlobalComponents {
		LBaseInput: typeof BaseInput;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'l-base-input': typeof BaseInput;
	}
}
