import { useForm } from '@lun/core';
import { pick } from '@lun/utils';

const instance = useForm({
  defaultFormData: {
    labelLayout: 'horizontal',
    cols: 3,
    preferSubgrid: true,
    label3NewLine: false,
  },
});
const options = ['horizontal', 'vertical', 'none'];
export default () => (
  <>
    <h3>grid布局</h3>
    <l-form instance={instance} {...pick(instance.formData, ['cols', 'labelLayout', 'preferSubgrid'])}>
      <l-form-item name="labelLayout" label="标签布局" fullLine>
        <l-radio-group options={options} />
      </l-form-item>
      <l-form-item name="cols" label="列数" type="number" element="input" />
      <l-form-item name="preferSubgrid" label="优先subgrid" element="switch" />
      <l-form-item name="label3NewLine" label="label3是否newLine" element="switch" />
      <l-form-item name="input1" label="label1" element="input" newLine />
      <l-form-item name="input2" label="label2" element="input" />
      <l-form-item name="input3" label="label3" element="input" colSpan={2} newLine={instance.formData.label3NewLine} />
      <l-form-item name="input4" label="label4" element="input" />
    </l-form>
    <h3>flex布局</h3>
    <l-form layout="flex" instance={instance} {...pick(instance.formData, ['cols', 'labelLayout', 'preferSubgrid'])}>
      <l-form-item name="labelLayout" label="标签布局" fullLine>
        <l-radio-group options={options} />
      </l-form-item>
      <l-form-item name="cols" label="列数" type="number" element="input" />
      <l-form-item name="input1" label="label1" element="input" newLine />
      <l-form-item name="input2" label="label2" element="input" />
      <l-form-item name="input3" label="label3" element="input" colSpan={2} newLine={instance.formData.label3NewLine} />
      <l-form-item name="input4" label="label4" element="input" />
    </l-form>
  </>
);
