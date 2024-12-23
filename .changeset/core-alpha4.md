---
'@lun-web/core': patch
---

### Features

- add `createUnrefCalls`
- add `useRefSet`, `useRefMap`, `useRefWeakSet`, `useRefWeakMap` hooks

### Changes

- remove `watchOnMounted` and `watchEffectOnMounted`

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true