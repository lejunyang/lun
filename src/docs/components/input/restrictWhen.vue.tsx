export default () => {
  return (
    <l-form
      defaultFormData={{ restrict: 'a' }}
      itemProps={({ formItemProps, formContext }) => ({
        element: 'input',
        label: formItemProps.name !== 'restrict' ? `restrictWhen=${formItemProps.name}` : undefined,
        elementProps:
          formItemProps.name !== 'restrict'
            ? {
                restrictWhen: formItemProps.name,
                restrict: formContext.form.getValue('restrict'),
              }
            : {},
      })}
    >
      <l-form-item name="restrict" label="restricted characters" />
      <l-form-item name="beforeInput" />
      <l-form-item name="input" />
      <l-form-item name="notComposing" />
      <l-form-item name="change" />
    </l-form>
  );
};
