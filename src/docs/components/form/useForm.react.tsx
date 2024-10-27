import { useReactForm, LForm, LFormItem, LInput } from '@lun-web/react';

const C = () => {
  const form = useReactForm(
    {
      defaultData: {
        form1: {
          input1: 1,
        },
        form2: {
          input2: 2,
        },
      },
    },
    { renderOnUpdate: true },
  );
  return (
    <>
      <div>
        表单一
        <LForm instance={form}>
          <LFormItem name="form1.input1" label="form1.input1" element="input" type="number" step={0.1} />
        </LForm>
      </div>
      <div>
        表单二
        <LForm instance={form}>
          <LFormItem name="form2.input2" label="form2.input2" type="number" max={5}>
            <LInput />
          </LFormItem>
        </LForm>
      </div>
      <pre>data: {JSON.stringify(form.current.data)}</pre>
    </>
  );
};

export default <C />;
