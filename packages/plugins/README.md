# @lun-web/plugins

This package provides some useful vue directives

## v-content

replacing `v-show` by using `content-visibility: hidden` when supported to get better performance, if not supported, it falls back to `display: none`. It also support vue's transition.

## v-update

This is specially for `@lun-web/components`

As most of lun input components have a `value` prop and an `update` event, this package provide plugins to use `v-update` in both vue jsx and vue template, making it convenient to set the value and listen to the change 

It performs below transformation:

`v-update-TARGET:FROM={EXPR}` => `TARGET={EXPR} onUpdate={(e) => EXPR = e.detail.FROM}`
Both TARGET and FROM are optional, Target defaults to 'value', FROM defaults to none(EXPR = e.detail)
