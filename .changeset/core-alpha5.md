---
'@lun-web/core': patch
---

### Features

- add `createUnrefCalls`
- add `useSet`, `useMap`, `useWeakSet`, `useWeakMap` hooks
- add `fComputed`
- `createCollector`: add treeIndex collect, add getCollectedItemIndex and getCollectedItemTreeIndex, refactor reactive weakMap and index collect, remove getChildVmIndex
- `createCollector`: add maxChildLevel and leavesCount for tree collector
- add `useStickyTable` and `useStickyColumn`
- add private hook `useCollectorExternalChildren` for collector, rename some private collector utils

### Changes

- `useForm/setValue`: if rawValue is null or undefined, use value instead as rawValue
- `createUseModel`: will set value as third param even if hasRaw is false; pass hasRaw as second param of getFromExtra

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true
- `createCollector`: fix child(collect: false) when tree is true
- `createCollector`: add markRaw to avoid instance to be reactive