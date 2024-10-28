import { useForm } from '@lun-web/core';
import { userEvent } from '@vitest/browser/context';
import { render } from 'vitest-browser-vue';
import { nextTick, ref } from 'vue';

describe('Form', () => {
  it('multiple l-form', async () => {
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
    const secondInput = ref();
    render(() => (
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
              <l-input ref={secondInput} />
            </l-form-item>
          </l-form>
        </div>
      </>
    ));
    await nextTick();
    expect(secondInput.value.input.value).toBe('2');
    form.data.form2.input2 = 3;
    await nextTick();
    expect(secondInput.value.input.value).toBe('3');

    let updateVal: any, updatePath: any;
    const onUpdate = vi.fn((p) => {
      updateVal = p.value;
      updatePath = p.path;
    });
    form.hooks.onUpdateValue.use(onUpdate);
    await userEvent.fill(secondInput.value.input, '5');
    expect(form.data.form2.input2).toBe(5);
    expect(updateVal).toBe(5);
    expect(updatePath).to.deep.equal(['form2', 'input2']);

  });
});
