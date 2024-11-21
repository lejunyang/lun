---
'@lun-web/components': patch
---

### Features

- `scroll-view`: add `threshold`; add target param in `onUpdate`

### Changes

- methods and variables exposed to custom element will be deleted if element is fully unmounted

### Bug Fixes

- fix parent issue when element is moved to other position in dom tree