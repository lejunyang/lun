export default () => (
  <l-tag removable onRemove={() => console.log('start remove')} onAfterRemove={() => console.log('removed')}>
    标签
  </l-tag>
);
