import { IconLibrary } from './icon.registry';

const icons = {
	clear: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
  up: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
    </svg>
  `,
  down: `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
    </svg>
  `
} as const;

export const defaultIconLibrary: IconLibrary = {
	library: 'default',
	type: 'html',
	resolver(name: string) {
		if (name in icons) return icons[name as keyof typeof icons];
		return '';
	},
};

export interface DefaultIcons {
	library: 'default',
	name: keyof typeof icons,
}

/** Other registered icon type info */
export interface RegisteredIcons {
}

type P<O, K> = K extends keyof O ? O[K] : never;

export type IconLibraryValue = DefaultIcons['library'] | P<RegisteredIcons, 'library'>;
export type IconNameValue = DefaultIcons['name'] | P<RegisteredIcons, 'name'>;
