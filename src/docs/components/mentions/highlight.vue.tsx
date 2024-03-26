export default () => (
  <l-mentions
    triggerHighlight="input"
    noOptions
    innerStyle={`::highlight(input) {
      color: #21201c;
      background-color: #f8cf0088;
      text-decoration: underline #ffb300;
      text-underline-offset: 2px;
  }`}
  />
);
