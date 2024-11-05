# @lun-web/components

## 0.0.1-alpha.3

### Patch Changes

- 2aa0076: ## Features

  - `components/config`: add `transitionRegistry` and `transitions` global context config; add `useTransition` hook and `registerTransition` util function
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
  - `components/tabs`: fix transition issue when switching tabs

- Updated dependencies [2aa0076]
- Updated dependencies [2aa0076]
- Updated dependencies [2aa0076]
  - @lun-web/core@0.0.1-alpha.3
  - @lun-web/plugins@0.0.1-alpha.3
  - @lun-web/utils@0.0.1-alpha.3
