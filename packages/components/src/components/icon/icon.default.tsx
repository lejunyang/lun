import { JSX } from 'vue/jsx-runtime';
import { IconLibrary } from './icon.registry';

const commonProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  viewBox: '0 0 16 16',
  part: 'svg',
  exportparts: undefined,
};
const commonCirclePath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0';
const successPath =
  'm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z';
const errorPath =
  'M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z';
const warningPath =
  'M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2';
const getDblLeftD = (m: number, l: number) =>
  `M${m}.354 1.646a.5.5 0 0 1 0 .708L${l}.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0`;

const getDown = (attrs: any, transform?: string) => (
  <svg {...attrs} {...commonProps} transform={transform}>
    <path
      fill-rule="evenodd"
      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
    />
  </svg>
);

const getDblLeft = (attrs: any, transform?: string) => (
  <svg {...attrs} {...commonProps} transform={transform}>
    <path fill-rule="evenodd" d={getDblLeftD(8, 2)} />
    <path fill-rule="evenodd" d={getDblLeftD(12, 6)} />
  </svg>
);

const icons = {
  clear: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  ),
  down: (attrs) => getDown(attrs),
  up: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path
        fill-rule="evenodd"
        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
      />
    </svg>
  ),
  left: (attrs) => getDown(attrs, 'rotate(90)'),
  right: (attrs) => getDown(attrs, 'rotate(-90)'),
  plus: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path
        fill-rule="evenodd"
        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
      />
    </svg>
  ),
  minus: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8" />
    </svg>
  ),
  x: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  ),
  check: (attrs) => (
    <svg {...attrs} {...commonProps} viewBox="0 0 9 9">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
      ></path>
    </svg>
  ),
  dash: (attrs) => (
    <svg {...attrs} {...commonProps} viewBox="0 0 1024 1024">
      <path
        d="M984.615385 541.538462c0 15.753846-13.784615 29.538462-29.538462 29.538461h-886.153846c-15.753846 0-29.538462-13.784615-29.538462-29.538461v-59.076924c0-15.753846 13.784615-29.538462 29.538462-29.538461h886.153846c15.753846 0 29.538462 13.784615 29.538462 29.538461v59.076924z"
        p-id="5862"
      ></path>
    </svg>
  ),
  success: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={commonCirclePath + successPath} />
    </svg>
  ),
  'success-no-circle': (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={'M16 8' + successPath} />
    </svg>
  ),
  error: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={commonCirclePath + errorPath} />
    </svg>
  ),
  'error-no-circle': (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={errorPath} />
    </svg>
  ),
  warning: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={commonCirclePath + warningPath} />
    </svg>
  ),
  'warning-no-circle': (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d={warningPath} />
    </svg>
  ),
  info: (attrs) => (
    <svg {...attrs} {...commonProps} viewBox="64 64 896 896">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
    </svg>
  ),
  help: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
    </svg>
  ),
  eye: (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
    </svg>
  ),
  'eye-slash': (attrs) => (
    <svg {...attrs} {...commonProps}>
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
      <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
    </svg>
  ),
  'double-left': (attrs) => getDblLeft(attrs),
  'double-right': (attrs) => getDblLeft(attrs, 'rotate(180)'),
} satisfies Record<string, (attrs: any) => JSX.Element>;

export const defaultIconLibrary: IconLibrary = {
  library: 'default',
  type: 'vnode',
  resolver(name, attrs) {
    if (name in icons) return icons[name as keyof typeof icons](attrs);
    return '';
  },
};

export interface DefaultIcons {
  library: 'default' | string;
  name: keyof typeof icons | string;
}

export type IconLibraryValue = DefaultIcons['library'];
export type IconNameValue = DefaultIcons['name'];
