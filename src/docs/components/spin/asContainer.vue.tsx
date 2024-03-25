import { text } from 'data';

export default () => (
  <l-spin as-container>
    {text}
    <div slot="tip" class="spin-loading-tip">
      Loading<span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  </l-spin>
);
