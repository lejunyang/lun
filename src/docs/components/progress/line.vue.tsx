import { growingProgress } from 'data';
export default () => (
  <div class="w-full">
    <l-progress type="line" value={50} />
    <l-progress type="line" value={growingProgress.value} />
    <l-progress
      type="line"
      strokeColor="#8a00ff"
      trailerColor="#8a00ff30"
      value={growingProgress.value}
      width={200}
      height={20}
    >
      Custom
    </l-progress>
    <l-progress type="line" value={100} status="success" showStatusIcon />
    <l-progress type="line" value={30} status="error" showStatusIcon />
  </div>
);
