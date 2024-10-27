import { Message } from '@lun-web/components';

export default () => (
  <>
    <div class="w-full">
      <l-file-picker
        maxSize={2 * 1024 * 1024}
        onExceedMaxSize={(e) => {
          const file = e.detail[0];
          console.log('onExceedMaxSize', file);
          Message.warning('不可超过2M，"' + file.name + '"大小为' + file.size / 1024 / 1024 + 'M，已被忽略');
        }}
      >
        <l-button>最大2M</l-button>
      </l-file-picker>
    </div>
    <div class="w-full">
      <l-file-picker
        multiple
        maxSize={2 * 1024 * 1024}
        onExceedMaxSize={(e) => {
          console.log('onExceedMaxSize', e.detail);
          Message.warning({
            message: '不可超过2M',
            description: e.detail.map((file) => <div>{file.name + ': ' + file.size / 1024 / 1024 + 'M'}</div>),
          });
        }}
      >
        <l-button>多个文件，最大2M</l-button>
      </l-file-picker>
    </div>
  </>
);
