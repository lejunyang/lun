# @lun-web/core

## 0.0.1-alpha.5

### Patch Changes

### Features

- add `createUnrefCalls`
- add `useShallowRefSet`, `useeShallowRefMap`, `useeShallowRefWeakSet`, `useeShallowRefWeakMap` hooks
- add `fComputed`
- `createCollector`: add treeIndex collect, add getCollectedItemIndex and getCollectedItemTreeIndex, refactor reactive weakMap and index collect, remove getChildVmIndex
- `createCollector`: add maxChildLevel and leavesCount for tree collector
- add `useStickyTable` and `useStickyColumn`
- add private hook `useCollectorExternalChildren` for collector, rename some private collector utils
- add `createMapCountMethod`
- add `isCollectedItemInFirstBranch` and `getCollectedItemMaxChildLevel` for collector
- add `staticPosition` and `customRange` for useVirtualList

### Changes

- `useForm/setValue`: if rawValue is null or undefined, use value instead as rawValue
- `createUseModel`: will set value as third param even if hasRaw is false; pass hasRaw as second param of getFromExtra

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true
- `createCollector`: fix child(collect: false) when tree is true
- `createCollector`: add markRaw to avoid instance to be reactive

## 0.0.1-alpha.4

### Patch Changes

### Features

- add `createUnrefCalls`
- add `useRefSet`, `useRefMap`, `useRefWeakSet`, `useRefWeakMap` hooks

### Changes

- remove `watchOnMounted` and `watchEffectOnMounted`

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true

## 0.0.1-alpha.3

### Bug Fixes

- `core/createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true
