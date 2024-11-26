import { useForm } from '@lun-web/core';

const form = useForm({
  defaultData: {
    arr: ['first', 'second', null],
  },
});

export default function () {
  return (
    <div>
      <l-form instance={form}>
        <l-form-item name="arr" array label="数组">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px;">
            {Array.isArray(form.data.arr) &&
              form.data.arr.map((_, index) => (
                <l-input key={index}>
                  <l-button slot="append" onClick={() => form.data.arr.splice(index, 1)} variant="ghost">
                    删除
                  </l-button>
                </l-input>
              ))}
            <l-button onClick={() => form.data.arr.push(null)}>添加</l-button>
          </div>
        </l-form-item>
      </l-form>
      <pre>
        data:
        {JSON.stringify(form.data)}
      </pre>
    </div>
  );
}
