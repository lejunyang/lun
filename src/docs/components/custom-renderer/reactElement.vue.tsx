import { createElement } from 'react';
import { reactive } from 'vue';
const state = reactive({
  count: 1,
});
export default () => (
  <l-custom-renderer
    type="react"
    content={createElement(
      'div',
      { style: { color: 'blue', userSelect: 'none', cursor: 'pointer' }, onClick: () => state.count++ },
      `React click to add: ${state.count}`,
    )}
  />
);
