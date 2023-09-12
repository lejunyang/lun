<script setup lang="tsx">
	import { defineIcon } from './components/icon';
	import { registerIconLibrary } from './components/icon/icon.registry';
	import { svgFillAndSizeDefaultMutator } from "./components/icon/icon.utils";

	defineIcon();

	registerIconLibrary({
		library: 'custom',
		type: 'vnode',
		resolver() {
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					class="bi bi-caret-down-fill"
					viewBox="0 0 16 16">
					<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
				</svg>
			);
		},
	});

	registerIconLibrary({
		library: 'font-awesome',
		type: 'html-url',
		resolver: (name) => {
			const filename = name.replace(/^fa[rbs]-/, '');
			let folder = 'regular';
			if (name.substring(0, 4) === 'fas-') folder = 'solid';
			if (name.substring(0, 4) === 'fab-') folder = 'brands';
			return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.1/svgs/${folder}/${filename}.svg`;
		},
		mutator: ((svg: string) => {
			return svgFillAndSizeDefaultMutator(svg as string);
		}) as any
	});
</script>

<template>
	<div>
		<a href="https://vitejs.dev" target="_blank">
			<img src="/vite.svg" class="logo" alt="Vite logo" />
		</a>
		<a href="https://vuejs.org/" target="_blank">
			<img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
		</a>
		<l-icon name="clear" />
		<l-icon name="sss" library="custom" />

		<l-icon library="font-awesome" name="far-bell" />
		<l-icon library="font-awesome" name="fas-archive" />
		<l-icon library="font-awesome" name="fab-apple" />
	</div>
</template>

<style lang="scss">
	.logo {
		height: 6em;
		padding: 1.5em;
		will-change: filter;
		transition: filter 300ms;
	}
	.logo:hover {
		filter: drop-shadow(0 0 2em #646cffaa);
	}
	.logo.vue:hover {
		filter: drop-shadow(0 0 2em #42b883aa);
	}
</style>
