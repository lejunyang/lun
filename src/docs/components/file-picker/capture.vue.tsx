import { filesRenderer } from 'data';

export default () => (
  <>
    <l-file-picker filesRenderer={filesRenderer} mimeTypes="image/*" capture="environment">
      <l-button>拍照（后置）</l-button>
    </l-file-picker>
    <l-file-picker filesRenderer={filesRenderer} mimeTypes="image/*" capture="user">
      <l-button>自拍（前置）</l-button>
    </l-file-picker>
    <l-file-picker filesRenderer={filesRenderer} mimeTypes="video/*" capture>
      <l-button>录制视频</l-button>
    </l-file-picker>
  </>
);
