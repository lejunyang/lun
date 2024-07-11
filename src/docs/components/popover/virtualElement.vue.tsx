import { throttle, on, off } from '@lun/utils';
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  setup() {
    const mouseState = reactive({
      x: 0,
      y: 0,
    });
    const isOn = ref(false);

    const handleMouseMove = throttle(
      (e) => {
        mouseState.x = e.clientX;
        mouseState.y = e.clientY;
      },
      20,
      { trailing: true },
    );
    onMounted(() => on(document, 'mousemove', handleMouseMove));
    onBeforeUnmount(() => off(document, 'mousemove', handleMouseMove));

    const target = {
      getBoundingClientRect() {
        return new DOMRect(mouseState.x, mouseState.y, 0, 0);
      },
    };
    return () => (
      <>
        <l-checkbox v-update-checked:checked={isOn.value}>{isOn.value ? '关闭' : '开启'}</l-checkbox>
        <l-popover class="popover-virtual" target={target} open={isOn.value} variant="styleless">
          <div slot="pop-content" class="circle"></div>
        </l-popover>
      </>
    );
  },
});
