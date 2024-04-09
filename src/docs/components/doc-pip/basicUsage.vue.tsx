import { defineComponent, onBeforeUnmount, ref, watchEffect } from 'vue';

const open = ref(false),
  count = ref(60);
const CountDown = defineComponent({
  props: ['seconds'],
  setup(props) {
    const remain = ref<number>();
    let timer;
    watchEffect(() => {
      if (!props.seconds) return;
      clearInterval(timer);
      remain.value = props.seconds;
      timer = setInterval(() => {
        remain.value -= 1;
        if (remain.value <= 0) clearInterval(timer);
      }, 1000);
    });
    onBeforeUnmount(() => clearInterval(timer));
    return () => (
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--l-accent-a7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {remain.value}s
      </div>
    );
  },
});
export default () => (
  <>
    <l-doc-pip open={open.value}>
      <CountDown seconds={count.value} />
    </l-doc-pip>
    <l-button onClick={() => (open.value = !open.value)}>toggle Pip</l-button>
    <l-button onClick={() => (count.value = Date.now() % 1000)}>reset timer</l-button>
  </>
);
