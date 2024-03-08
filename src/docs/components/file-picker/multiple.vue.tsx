import { Message } from '@lun/components';
import { ref } from 'vue';

const files1 = ref([]);
const files2 = ref([]);
export default () => (
  <>
    <div class="w-full">
      <l-file-picker multiple v-update={files1.value}>
        <l-button>选择多个文件</l-button>
      </l-file-picker>
      <div>
        已选择：
        {files1.value.map((file) => (
          <l-tag>{file.name}</l-tag>
        ))}
      </div>
    </div>
    <div class="w-full">
      <l-file-picker
        multiple
        maxCount={3}
        v-update={files2.value}
        onExceedMaxCount={(e) => {
          console.log('exceedMaxCount', e.detail);
          Message.warning('最多只能选择三个文件，"' + e.detail.map((file) => file.name).join('、') + '"已被忽略');
        }}
      >
        <l-button>选择多个文件，最多三个</l-button>
      </l-file-picker>
      <div>
        已选择：
        {files2.value.map((file) => (
          <l-tag>{file.name}</l-tag>
        ))}
      </div>
    </div>
  </>
);
