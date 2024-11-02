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
- `components/message`: support string param for `Message.open`
- `components/switch`: add `beforeUpdate` to asynchronously determine whether to update checked status

## Changes

- `colorPriority` of `GlobalStaticConfig`:
  - previous: resolve color and status value from all sources and then determine, that means: if we set success status on a component, as it can resolve color from theme context, it will still use context color instead status from props first
  - now: color and status are resolved from different sources and determine respectively. We should always respect props first, then parent props, and last theme context.

## Bug Fixes

- `components/tree`: fix check methods are not working
- `components/tree`: fix wrong expose type; fix items processing issue
- `core/createCollector`: parent element can be undefined when adding item; invode getParentEl if collectOnSetup is true
- `theme/form-item`: fix vertical align issue of checkbox-group and radio-group in form-item