import { useForm } from '@lun-web/core';

const form = useForm({
    defaultData: {
      pages: 20,
      siblings: 3,
      boundaries: 2,
      dotsJump: 5,
    },
  }),
  itemProps = { helpType: 'newLine', element: 'input', type: 'number' } as const;
export default () => (
  <>
    <l-form instance={form} itemProps={itemProps} cols={2}>
      <l-form-item name="pages" label="pages" help="总页数" />
      <l-form-item name="siblings" label="siblings" help="当出现省略号后，省略号内侧显示多少页" />
      <l-form-item name="boundaries" label="boundaries" help="当出现省略号后，分页器两边显示多少页" />
      <l-form-item name="dotsJump" label="dotsJump" help="点击省略号时，跳过的页数" />
    </l-form>
    <l-pagination class="w-full" {...form.data} current={10} />
  </>
);
