import { sentence, text } from 'data';
import { ref } from 'vue';

const open = ref(false),
  open2 = ref(false);
export default () => (
  <>
    <div class="w-full">
      <l-doc-pip open={open.value}>
        <l-callout message={sentence} description={text} />
      </l-doc-pip>
      <l-button onClick={() => (open.value = !open.value)}>toggle Pip</l-button>
    </div>
    <div class="w-full">
      <l-doc-pip open={open2.value} wrapThemeProvider={false}>
        <l-callout message={sentence} description={text} />
      </l-doc-pip>
      <l-button onClick={() => (open2.value = !open2.value)}>toggle Pip without wrapThemeProvider</l-button>
    </div>
  </>
);
