---
'@lun-web/components': patch
---

## Features

- `config`: add `transitionRegistry` and `transitions` global context config; add `useTransition` hook and `registerTransition` util function
- `dialog`: add custom renderer for header, remove `title` prop
- `message`: support string param for `Message.open`
- `switch`: add `beforeUpdate` to asynchronously determine whether to update checked status
- `tree`: trigger `update` event whenever check, select or expand are triggered

## Changes

- `colorPriority` of `GlobalStaticConfig`:
  - previous: resolve color and status value from all sources and then determine, that means: if we set success status on a component, as it can resolve color from theme context, it will still use context color instead status from props first
  - now: color and status are resolved from different sources and determine respectively. We should always respect props first, then parent props, and last theme context.

## Bug Fixes

- `tree`: fix check methods are not working
- `tree`: fix wrong expose type; fix items processing issue
- `tabs`: fix transition issue when switching tabs
- `watermark`: fix wrong color when appearance is dark; fix that style observation is invalid