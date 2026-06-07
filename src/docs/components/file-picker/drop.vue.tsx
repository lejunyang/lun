import { filesRenderer } from 'data';

export default () => (
  <>
    <l-file-picker filesRenderer={filesRenderer} drop multiple>
      <l-button>点击选择或拖拽文件到此</l-button>
    </l-file-picker>
  </>
);
