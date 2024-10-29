import { Progress } from '@lun-web/components';

let progress;
export default () => (
  <>
    <l-button
      onClick={() => {
        if (!progress) progress = Progress.createPageTopProgress();
        progress.start();
      }}
    >
      start
    </l-button>
    <l-button onClick={() => progress && progress.stop()}>stop</l-button>
  </>
);
