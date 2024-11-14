# @lun-web/core

## 0.0.1-alpha.4

### Patch Changes

### Features

- add `createUnrefCalls`
- add `useSet`, `useMap`, `useWeakSet`, `useWeakMap` hooks

### Changes

- remove `watchOnMounted` and `watchEffectOnMounted`

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true

## 0.0.1-alpha.3

### Bug Fixes

- `core/createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true
