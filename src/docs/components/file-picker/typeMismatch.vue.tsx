import { Message } from '@lun-web/components';
import { filesRenderer } from 'data';

export default () => (
  <>
    <l-file-picker
      filesRenderer={filesRenderer}
      multiple
      strictAccept
      mimeTypes="image/*"
      extensions={['pdf']}
      onTypeMismatch={(e) => {
        Message.warning({
          message: '只允许 image 或 pdf 文件',
          description: e.detail.map((f) => <div>{f.name}（{f.type || '未知类型'}）</div>),
        });
      }}
    >
      <l-button>选择图片或 PDF</l-button>
    </l-file-picker>
  </>
);
