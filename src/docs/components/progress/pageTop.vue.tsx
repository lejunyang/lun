import { Progress } from '@lun-web/components';

let stop;
export default () => (
  <>
    <l-button
      onClick={() => {
        const methods = Progress.createPageTopProgress();
        methods.start();
        stop = methods.stop;
      }}
    >
      start
    </l-button>
    <l-button onClick={() => (stop && stop(), (stop = null))}>stop</l-button>
  </>
);
