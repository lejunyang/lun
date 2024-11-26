---
'@lun-web/components': patch
---

### Features

- `GlobalStaticConfig/reflectStateToAttr`: add `double-dash` option
- `scroll-view`: add `threshold`; add target param in `onUpdate`
- `form-item`: add rawValue and rawData in validator
- `form-item`: support type=date min/max, greaterThan/lessThan transform

### Changes

- methods and variables exposed to custom element will be deleted if element is fully unmounted

### Bug Fixes

- fix parent issue when element is moved to other position in dom tree
- `tabs`: fix updateVar issue when unmounting
- `form-item`: fix some props can not be set by form parent because of default props
- `form-item`: fix `update` validate trigger issue
- `form-item`: fix setValue issue
- `select`: fix parent disabled is not working
- `input,textarea`: should not be able to input when loading is true
- `radio`: should not be able to check when loading or readonly is true