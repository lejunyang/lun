import { defineCustomElement } from 'custom';
import { computed } from 'vue';

const LIcon = defineCustomElement({
	setup(props) {
		const html = computed(() => {
			return false;
		});
		return () =>
			html.value ? (
				<span style={{ display: 'contents' }} v-html={html.value}></span>
			) : (
				<svg>
					<use></use>
				</svg>
			);
	},
});
