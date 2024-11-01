---
'@lun-web/components': patch
'@lun-web/core': patch
'@lun-web/plugins': patch
'@lun-web/react': patch
'@lun-web/theme': patch
'@lun-web/utils': patch
---

## Features

- `components/config`: add `transitionRegistry` and `componentTransitions` global context config; add `useTransition` hook and `registerTransition` util
- `components/dialog`: add custom renderer for header, remove `title` prop
- `components/switch`: add `beforeUpdate` to asynchronously determine whether to update checked status

## Bug Fixes

- `components/tree`: fix check methods are not working
- `components/tree`: fix wrong expose type; fix items processing issue
- `core/createCollector`: parent element can be undefined when adding item; invode getParentEl if collectOnSetup is true
- `theme/form-item`: fix vertical align issue of checkbox-group and radio-group in form-item