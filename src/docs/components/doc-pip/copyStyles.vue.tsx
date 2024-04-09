import { sentence, text } from 'data';
import { ref } from 'vue';

const open = ref(false),
  open2 = ref(false);
export default () => (
  <>
    <div class="w-full">
      <l-theme-provider disabled color="pink">
        <l-doc-pip open={open.value}>
          <l-callout message={sentence} description={text} />
          <l-button>disabled</l-button>
        </l-doc-pip>
      </l-theme-provider>
    </div>
    <l-button onClick={() => (open.value = !open.value)}>toggle Pip</l-button>

    <div class="w-full">
      <l-theme-provider disabled color="mint">
        <l-doc-pip open={open2.value} wrapThemeProvider={false}>
          <l-callout message={sentence} description={text} />
          <l-button>disabled</l-button>
        </l-doc-pip>
      </l-theme-provider>
    </div>
    <l-button onClick={() => (open2.value = !open2.value)}>toggle Pip without wrapThemeProvider</l-button>
  </>
);
