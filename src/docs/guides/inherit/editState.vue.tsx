export default () => (
  <>
    <div class="w-full">表单1</div>
    <l-form disabled>
      <l-form-item label="input1" element="input" />
      <l-form-item label="input2" help="disabled=false" element="input" elementProps={{ disabled: false }} />
    </l-form>
    <div class="w-full">表单2</div>
    <l-form disabled mergeDisabled>
      <l-form-item label="input1" element="input" />
      <l-form-item
        label="input2"
        help="disabled=false, mergeDisabled=true on form"
        element="input"
        elementProps={{ disabled: false }}
      />
    </l-form>
    <div class="w-full">表单3</div>
    <l-form disabled mergeDisabled>
      <l-form-item label="input1" element="input" />
      <l-form-item
        label="input2"
        help="disabled=false, mergeDisabled=false"
        element="input"
        elementProps={{ disabled: false, mergeDisabled: false }}
      />
    </l-form>
  </>
);
