import { IconLibrary } from './icon.registry';

const commonProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  viewBox: '0 0 16 16',
  part: 'svg',
};
const icons = {
  clear: () => (
    <svg {...commonProps}>
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  ),
  down: () => (
    <svg {...commonProps}>
      <path
        fill-rule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  ),
  x: () => (
    <svg {...commonProps}>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  ),
  check: () => (
    <svg {...commonProps} viewBox="0 0 9 9">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
      ></path>
    </svg>
  ),
  dash: () => (
    <svg {...commonProps} viewBox="0 0 1024 1024">
      <path
        d="M984.615385 541.538462c0 15.753846-13.784615 29.538462-29.538462 29.538461h-886.153846c-15.753846 0-29.538462-13.784615-29.538462-29.538461v-59.076924c0-15.753846 13.784615-29.538462 29.538462-29.538461h886.153846c15.753846 0 29.538462 13.784615 29.538462 29.538461v59.076924z"
        p-id="5862"
      ></path>
    </svg>
  ),
  success: () => (
    <svg {...commonProps}>
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
    </svg>
  ),
  error: () => (
    <svg {...commonProps}>
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
    </svg>
  ),
  warning: () => (
    <svg {...commonProps}>
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
    </svg>
  ),
} as const;

export const defaultIconLibrary: IconLibrary = {
  library: 'default',
  type: 'vnode',
  resolver(name: string) {
    if (name in icons) return icons[name as keyof typeof icons]();
    return '';
  },
};

export interface DefaultIcons {
  library: 'default';
  name: keyof typeof icons;
}

/** Other registered icon type info */
export interface RegisteredIcons {}

type P<O, K> = K extends keyof O ? O[K] : never;

export type IconLibraryValue = DefaultIcons['library'] | P<RegisteredIcons, 'library'>;
export type IconNameValue = DefaultIcons['name'] | P<RegisteredIcons, 'name'>;
