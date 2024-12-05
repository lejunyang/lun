---
'@lun-web/core': patch
---

### Features

- add `createUnrefCalls`
- add `useSet`, `useMap`, `useWeakSet`, `useWeakMap` hooks
- `createCollector`: add treeIndex collect, add getVmIndex and getVmTreeIndex, refactor reactive weakMap and index collect, remove getChildVmIndex
- `createCollector`: add maxChildLevel and leavesCount for tree collector

### Changes

- `useForm/setValue`: if rawValue is null or undefined, use value instead as rawValue
- `createUseModel`: will set value as third param even if hasRaw is false; pass hasRaw as second param of getFromExtra

### Bug Fixes

- `createCollector`: parent element can be undefined when adding item; invoke getParentEl if collectOnSetup is true
- `createCollector`: fix child(collect: false) when tree is true