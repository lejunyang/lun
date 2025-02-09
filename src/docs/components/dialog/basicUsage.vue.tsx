import { ref } from 'vue';
import { delay } from '@lun-web/utils';
import { useForm } from '@lun-web/core';
import { sentence, text } from 'data';

const open = ref(false);
const form = useForm({
  defaultData: {
    maskClosable: false,
    escapeClosable: true,
    headerDraggable: true,
  },
});
export default function () {
  return (
    <>
      <l-form itemProps={{ element: 'switch', helpType: 'newLine' }} instance={form} style="flex-basis: 100%;">
        <l-form-item name="noMask" label="noMask" help="是否关闭遮罩" />
        <l-form-item name="noTopLayer" label="noTopLayer" help="是否关闭原生Dialog Top Layer" />
        <l-form-item name="noLockScroll" label="noLockScroll" help="是否关闭'打开弹窗时锁定滚动'特性" />
        <l-form-item
          name="maskClosable"
          label="maskClosable"
          help="是否可以通过点击遮罩关闭 Dialog, true相当于click"
          element="select"
          elementProps={{
            options: [
              { value: true, label: 'true' },
              { value: false, label: 'false' },
              { value: 'click', label: 'click' },
              { value: 'dblclick', label: 'dblclick' },
            ],
          }}
        />
        <l-form-item name="escapeClosable" label="escapeClosable" help="是否可以通过Esc来关闭Dialog" />
        <l-form-item name="headerDraggable" label="headerDraggable" help="是否可通过header拖拽" />
        <l-form-item name="alwaysTrapFocus" label="alwaysTrapFocus" />
        <l-form-item
          name="disableWhenPending"
          label="disableWhenPending"
          help="是否在pending时禁用，pending指Dialog自带的按钮进入加载状态，当回调返回Promise时会如此"
        />
      </l-form>
      <pre>{JSON.stringify(form.data)}</pre>
      <l-button onClick={() => (open.value = !open.value)}>打开</l-button>
      <l-dialog
        {...form.data}
        open={open.value}
        header={sentence}
        onUpdate={(e) => (open.value = e.detail)}
        onAfterOpen={() => console.log('afterOpen')}
        onAfterClose={() => console.log('afterClose')}
        beforeOk={() => delay(3000)}
        beforeClose={() => console.log('beforeClose')}
      >
        <div>{text}</div>
        <l-input autofocus />
      </l-dialog>
    </>
  );
}
