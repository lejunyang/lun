---
'@lun-web/components': patch
---

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