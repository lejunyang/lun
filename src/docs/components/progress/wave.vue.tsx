import { growingProgress } from 'data';

export default () => (
  <>
    <l-progress type="wave" value={30} />
    <l-progress type="wave" value={growingProgress.value} />
    <l-progress
      type="wave"
      strokeColor="#8a00ff"
      trailerColor="#8a00ff30"
      value={growingProgress.value}
      width={200}
      height={200}
    >
      Custom
    </l-progress>
    <div class="container">
      <l-progress type="wave" value={growingProgress.value} status="success" showStatusIcon />
      <l-progress type="wave" value={growingProgress.value} status="error" showStatusIcon />
      <l-progress type="wave" value={growingProgress.value} status="warning" showStatusIcon />
    </div>
  </>
);
