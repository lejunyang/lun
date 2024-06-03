import { sentence } from 'data';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const pop = ref(),
      input1 = ref(),
      input2 = ref();
    onMounted(() => {
      setTimeout(() => {
        const attach = pop.value.attachTarget;
        if (attach) {
          attach(input1.value);
          attach(input2.value);
        }
      });
    });
    return () => (
      <>
        <l-input placeholder="input1" ref={input1} />
        <l-input placeholder="input2" ref={input2} />
        <l-popover ref={pop} preventSwitchWhen="edit" content={sentence} />
      </>
    );
  },
});
