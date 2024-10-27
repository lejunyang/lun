import { useForm } from '@lun-web/core';
import { isPreferDark } from '@lun-web/utils';
import { text } from 'data';

const form = useForm({
  defaultData: {
    content: ['watermark', 'the second line'],
    color: isPreferDark() ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.15)',
    rotate: -22,
    fontSize: 16,
    opacity: 1,
    gapX: 100,
    gapY: 100,
  },
});

export default () => (
  <>
    <l-watermark {...form.data} mutable>
      {text.repeat(5)}
    </l-watermark>
    <l-form
      instance={form}
      itemProps={{
        element: 'input',
        elementProps: {
          stepControl: 'plus-minus',
        },
      }}
    >
      <l-form-item name="content" label="内容" elementProps={{ multiple: true }} />
      <l-form-item name="color" label="颜色" />
      <l-form-item name="rotate" label="旋转角度" type="number" min={-180} max={180} />
      <l-form-item name="fontSize" label="字体大小" type="number" min={0} />
      <l-form-item name="opacity" label="透明度" type="number" min={0} step={0.1} max={1} />
      <l-form-item name="gapX" label="水平间距" type="number" min={0} />
      <l-form-item name="gapY" label="垂直间距" type="number" min={0} />
    </l-form>
  </>
);
