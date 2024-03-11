import { text } from 'data';

export default () => (
  <l-watermark content="watermark">
    <l-button onClick={() => (document.getElementById('dialog') as any)?.openDialog()}>打开对话框</l-button>
    <div>{text.repeat(5)}</div>
    <l-dialog id="dialog" title="Dialog">
      {text.repeat(5)}
    </l-dialog>
  </l-watermark>
);
