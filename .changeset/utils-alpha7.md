---
'@lun-web/utils': patch
---

### Features

- add `extend`

### Bug Fixes

- replace `document.body` with HTMLElement prototype in features detection to avoid errors in IIFE ahead of body
