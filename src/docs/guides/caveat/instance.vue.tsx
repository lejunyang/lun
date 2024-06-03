import { sentence } from 'data';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const pop = ref(),
      button = ref();
    onMounted(() => {
      console.log(
        'mounted',
        'Popover attachTarget',
        'attachTarget' in pop.value,
        'Button setTimeout',
        'setTimeout' in button.value,
      );
      Promise.resolve().then(() => {
        console.log(
          'Promise.resolve after mounted',
          'Popover attachTarget',
          'attachTarget' in pop.value,
          'Button setTimeout',
          'setTimeout' in button.value,
        );
      });
    });
    return () => (
      <l-popover ref={pop} content={sentence}>
        <l-button ref={button}>Button And Popover</l-button>
      </l-popover>
    );
  },
});
