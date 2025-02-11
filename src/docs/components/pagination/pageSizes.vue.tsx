import { ref } from 'vue';

const size = ref(10);
export default () => (
  <l-pagination
    class="w-full"
    total={198}
    pageSize={size.value}
    onPageSizeUpdate={(e) => {
      size.value = e.detail;
    }}
    controls={['prev', 'pages', 'next', 'sizes']}
  />
);
