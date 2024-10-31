---
'@lun-web/components': patch
'@lun-web/core': patch
'@lun-web/plugins': patch
'@lun-web/react': patch
'@lun-web/theme': patch
'@lun-web/utils': patch
---

## Features

- `config`: add `transitionRegistry` and `componentTransitions` global context config; add `useTransition` hook and `registerTransition` util
- `dialog`: add custom renderer for header, remove `title` prop
- `switch`: add `beforeUpdate` to asynchronously determine whether to update checked status
