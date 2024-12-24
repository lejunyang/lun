# @lun-web/components

## 0.0.1-alpha.5

### Patch Changes

### Features

- `GlobalStaticConfig/reflectStateToAttr`: add `double-dash` option
- `scroll-view`: add `threshold`; add target param in `onUpdate`
- `form-item`: add rawValue and rawData in validator
- `form-item`: distinguish rawRule and rule
- `form-item`: support type=date min/max, greaterThan/lessThan transform
- add `addUserComponent` util
- intercept `click`, `focus`, `blur` methods of `checkbox`, `radio`, `switch` to make them work for imperative call

### Changes

- methods and variables exposed to custom element will be deleted if element is fully unmounted

### Bug Fixes

- fix parent issue when element is moved to other position in dom tree
- fix parent resolving issue when element is slotted in another element in shadow dom
- `tabs`: fix updateVar issue when unmounting
- `form-item`: fix some props can not be set by form parent because of default props
- `form-item`: fix `update` validate trigger issue
- `form-item`: fix setValue issue
- `select`: fix parent disabled is not working
- `input,textarea`: should not be able to input when loading is true
- `radio`: should not be able to check when loading or readonly is true
- `GlobalStaticConfig`: fix accessing some props that are not owned by itself(like toString) can cause error
- fix some components's common style are not applied because of cache

## 0.0.1-alpha.4

### Patch Changes

### Features

- `tree`: trigger `update` event whenever check, select or expand are triggered

### Changes

- `form`: add `rootStyle` prop, its inline style will not be assigned to the root element of the form.

### Bug Fixes

- `watermark`: fix wrong color when appearance is dark; fix that style observation is invalid

## 0.0.1-alpha.3

### Features

- `components/config`: add `transitionRegistry` and `transitions` global context config; add `useTransition` hook and `registerTransition` util function
- `components/dialog`: add custom renderer for header, remove `title` prop
- `components/message`: support string param for `Message.open`
- `components/switch`: add `beforeUpdate` to asynchronously determine whether to update checked status

### Changes

- `colorPriority` of `GlobalStaticConfig`:
  - previous: resolve color and status value from all sources and then determine, that means: if we set success status on a component, as it can resolve color from theme context, it will still use context color instead status from props first
  - now: color and status are resolved from different sources and determine respectively. We should always respect props first, then parent props, and last theme context.

### Bug Fixes

- `components/tree`: fix check methods are not working
- `components/tree`: fix wrong expose type; fix items processing issue
- `components/tabs`: fix transition issue when switching tabs
