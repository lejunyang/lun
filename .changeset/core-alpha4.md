---
'@lun-web/core': patch
---

### Features

- add `createUnrefCalls`
- add `useSet`, `useMap`, `useWeakSet`, `useWeakMap` hooks

### Changes

- remove `watchOnMounted` and `watchEffectOnMounted`

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true