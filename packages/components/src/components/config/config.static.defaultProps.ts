import { ComponentKey } from './config.static';

export const defaultProps = {
  button: {
    showLoading: true,
    iconPosition: 'start',
    variant: 'surface',
  },
  callout: {
    transition: 'scaleOut',
  },
  checkbox: {
    labelPosition: 'end',
  },
  'checkbox-group': {},
  'custom-renderer': {},
  dialog: {
    escapeClosable: true,
    width: '450px',
    panelTransition: 'scale',
    maskTransition: 'bgFade',
  },
  divider: {},
  'doc-pip': {
    wrapThemeProvider: true,
    copyDocStyleSheets: true,
  },
  form: {
    plainName: undefined,
    layout: 'grid',
    cols: '1',
    preferSubgrid: true,
    labelLayout: 'horizontal',
  },
  'form-item': {
    plainName: undefined,
    colonMark: ':',
    requiredMark: '*',
    requiredMarkAlign: 'start',
    helpType: 'icon',
    tipType: 'tooltip',
    required: undefined, // runIfFn(required, formContext) ?? localRequired.value
    clearWhenDepChange: undefined, // need to be undefined, cause used in virtualGetMerge
    validateWhen: ['blur', 'depChange'],
  },
  icon: {
    library: 'default',
  },
  'file-picker': {
    preferFileApi: true,
    loadingWhenPick: true,
  },
  input: {
    waitType: 'debounce',
    trim: true,
    updateWhen: 'auto',
    restrictWhen: 'not-composing',
    transformWhen: 'not-composing',
    showClearIcon: true,
    separator: /[\s,]/,
    showStatusIcon: true,
    stepControl: 'up-down',
    required: undefined,
    normalizeNumber: true,
  },
  mentions: {
    triggers: ['@'],
    suffix: ' ',
  },
  message: {
    transition: 'message',
    resetDurationOnHover: true,
    placement: 'top',
    offset: 10,
  },
  popover: {
    offset: 4,
    open: undefined, // must be undefined, otherwise it will be controlled
    showArrow: true,
    useTransform: false,
    transition: 'fade',
    popWidth: 'max-content',
  },
  progress: { type: 'wave' },
  radio: {
    labelPosition: 'end',
    noIndicator: undefined, // virtualMerge requires undefined as default
  },
  'radio-group': {},
  select: {
    autoClose: true,
    upDownToggle: true,
    autoActivateFirst: true,
  },
  'select-option': {},
  'select-optgroup': {},
  spin: {
    type: 'circle',
    strokeWidth: 4,
    spinning: true,
  },
  switch: {
    trueValue: true,
    falseValue: false,
  },
  tag: {
    transition: 'scaleOut',
  },
  'teleport-holder': {},
  textarea: {},
  'theme-provider': {},
  tooltip: {
    open: undefined, // must be undefined, otherwise it will be controlled
    showArrow: true,
    transition: 'scale',
  },
  watermark: {
    image: 'none', // defaults to none so that watermark with only 'content' prop will not be violated by changing 'image' prop
    imageProps: {},
    zIndex: 5, // needs to be greater than the dialog panel's z-index
    opacity: 1,
    ratio: globalThis.devicePixelRatio,
    color: {
      initial: 'rgba(0,0,0,.15)',
      dark: 'rgba(255,255,255,.18)',
    },
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    gapX: 100,
    gapY: 100,
    offsetLeft: 'half-gap',
    offsetTop: 'half-gap',
  },
} satisfies Record<ComponentKey, Record<string, any>>;
