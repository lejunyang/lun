import { inBrowser } from '@lun/utils';

const template = inBrowser && document.createElement('template');
if (template) {
  template.innerHTML = `<div>template static div</div><template data-element="l-button" data-label="{text}"></template>`;
}

export default () => {
  return (
    <>
      <l-custom-renderer content={template} text="dynamic-button"></l-custom-renderer>
    </>
  );
};
