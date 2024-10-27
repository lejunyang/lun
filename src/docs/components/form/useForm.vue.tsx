import { useForm } from '@lun-web/core';

const form = useForm({
  defaultData: {
    form1: {
      input1: 1,
    },
    form2: {
      input2: 2,
    },
  },
});
export default () => (
  <>
    <div>
      表单一
      <l-form instance={form}>
        <l-form-item name="form1.input1" label="form1.input1" element="input" type="number" step={0.1} />
      </l-form>
    </div>
    <div>
      表单二
      <l-form instance={form}>
        <l-form-item name="form2.input2" label="form2.input2" type="number" max={5}>
          <l-input />
        </l-form-item>
      </l-form>
    </div>
    <pre>data: {JSON.stringify(form.data)}</pre>
  </>
);
