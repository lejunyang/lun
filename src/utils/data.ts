// data for some code cases
export const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
];
export const optionsWithChildren = [
  {
    label: 'group1',
    children: [
      { label: 'option1', value: 'value1' },
      { label: 'option2', value: 'value2', disabled: true },
    ],
  },
  {
    label: 'group2',
    children: [
      { label: 'option3', value: 'value3' },
      { label: 'option4', value: 'value4' },
    ],
  },
  { label: 'option4', value: 'value5' },
];
