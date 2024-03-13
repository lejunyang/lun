`v-model` doesn't support custom elements, don't know if it will change in future https://github.com/vuejs/core/pull/9883.

As most of lun input components have a `value` prop and an `update` event, this package provide plugins to use `v-update` in both vue jsx and vue template, making it convenient to set the value and listen to the change 

It performs below transformation:

`v-update-TARGET:FROM={EXPR}` => `TARGET={EXPR} onUpdate={(e) => EXPR = e.detail.FROM}`
Both TARGET and FROM are optional, Target defaults to 'value', FROM defaults to none(EXPR = e.detail)
