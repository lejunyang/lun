export default () => {
  return (
    <div>
      <div>toUpperCase</div>
      <l-form
        itemProps={({ formItemProps }) => ({
          element: 'input',
          label: `transformWhen=${formItemProps.name}`,
          elementProps: {
            updateWhen: formItemProps.name,
            transformWhen: formItemProps.name,
            transform: (val) => val?.toUpperCase(),
          },
        })}
      >
        <l-form-item name="input" />
        <l-form-item name="not-composing" />
        <l-form-item name="change" />
      </l-form>
    </div>
  );
};
