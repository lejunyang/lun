---
'@lun-web/components': patch
---

### Features

- `tree`: improve `defaultExpandAll` behavior for first render

### Changes

- `table`: remove `expandable` prop, use `rowExpandedRenderer` to determine if the row can be expanded

### Bug Fixes

- `tree`: fix expand issue caused by useExpandMethods removed default multiple
