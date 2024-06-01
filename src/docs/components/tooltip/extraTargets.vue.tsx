import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const tooltip = ref(),
      div1 = ref(),
      div2 = ref(),
      value1 = ref('Target1 overflowing'),
      value2 = ref('Target2');
    onMounted(() => {
      // Need to wait for completion of component inner setup
      setTimeout(() => {
        if (!tooltip.value.attachTarget) return;
        tooltip.value.attachTarget(div1.value, { overflow: 'open' });
        tooltip.value.attachTarget(div2.value, { overflow: 'open' });
      });
    });
    return () => (
      <>
        <div class="container" style="justify-content: space-around;">
          <div ref={div1} class="overflow">
            {value1.value}
          </div>
          <div ref={div2} class="overflow">
            {value2.value}
          </div>
        </div>
        <div class="container">
          <l-input v-update={value1.value} />
          <l-input v-update={value2.value} />
        </div>
        <l-tooltip ref={tooltip} content="tip~~" placement="top" />
      </>
    );
  },
});
