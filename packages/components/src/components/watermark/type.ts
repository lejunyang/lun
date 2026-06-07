import { AppearanceColor } from 'hooks';
import {
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { freeze } from '@lun-web/utils';

export const watermarkProps = freeze({
  /**
   * @locale.zh-CN 水印文本内容，支持字符串或字符串数组（多行文本）
   * @locale.en Watermark text content; accepts a string or an array of strings for multi-line text
   */
  content: PropStrOrArr(),
  /**
   * @locale.zh-CN 图片水印来源，可以是图片地址、图片元素，或 'none' 表示不使用图片
   * @locale.en Image watermark source; can be an image URL, an image element, or 'none' to disable
   */
  image: PropObjOrStr<string | HTMLImageElement>(),
  /**
   * @locale.zh-CN 图片水印专用的属性配置，用于区分文字与图片水印的设置
   * @locale.en Watermark options dedicated to image mode, used to distinguish text and image settings
   */
  imageProps: PropObject(),
  /**
   * @locale.zh-CN 水印的不透明度
   * @locale.en Opacity of the watermark
   */
  opacity: PropNumber(),
  /**
   * @locale.zh-CN 水印旋转角度，单位为度
   * @locale.en Rotation angle of the watermark, in degrees
   */
  rotate: PropNumber(),
  /**
   * @locale.zh-CN 水印在高分辨率屏幕下的绘制比例
   * @locale.en Drawing ratio of the watermark on high-DPI screens
   */
  ratio: PropNumber(),
  /**
   * @locale.zh-CN 单个水印的宽度
   * @locale.en Width of a single watermark
   */
  width: PropNumber(),
  /**
   * @locale.zh-CN 单个水印的高度
   * @locale.en Height of a single watermark
   */
  height: PropNumber(),
  /**
   * @locale.zh-CN 水印层的 z-index
   * @locale.en z-index of the watermark layer
   */
  zIndex: PropNumber(),
  /**
   * @locale.zh-CN 水印颜色，支持字符串或按外观主题区分的颜色对象
   * @locale.en Watermark color; accepts a string or an appearance-aware color object
   */
  color: PropObjOrStr<AppearanceColor<CanvasFillStrokeStyles['fillStyle']>>(),
  /**
   * @locale.zh-CN 水印文字大小
   * @locale.en Font size of the watermark text
   */
  fontSize: PropNumber(),
  /**
   * @locale.zh-CN 水印文字粗细
   * @locale.en Font weight of the watermark text
   */
  fontWeight: PropNumber<'normal' | 'light' | 'weight' | number>(),
  /**
   * @locale.zh-CN 水印文字样式
   * @locale.en Font style of the watermark text
   */
  fontStyle: PropString<'none' | 'normal' | 'italic' | 'oblique'>(),
  /**
   * @locale.zh-CN 水印文字字体
   * @locale.en Font family of the watermark text
   */
  fontFamily: PropString(),
  /**
   * @locale.zh-CN 水印文字的水平对齐方式
   * @locale.en Horizontal alignment of the watermark text
   */
  textAlign: PropString<CanvasTextAlign>(),
  /**
   * @locale.zh-CN 水印之间的水平间距
   * @locale.en Horizontal gap between adjacent watermarks
   * @default 100
   */
  gapX: PropNumber(),
  /**
   * @locale.zh-CN 水印之间的垂直间距
   * @locale.en Vertical gap between adjacent watermarks
   * @default 100
   */
  gapY: PropNumber(),
  /**
   * @locale.zh-CN 水印的水平偏移量，可设为数字或 'half-gap' 表示半个水平间距
   * @locale.en Horizontal offset of the watermark; accepts a number or 'half-gap' for half of gapX
   */
  offsetLeft: PropNumber(),
  /**
   * @locale.zh-CN 水印的垂直偏移量，可设为数字或 'half-gap' 表示半个垂直间距
   * @locale.en Vertical offset of the watermark; accepts a number or 'half-gap' for half of gapY
   */
  offsetTop: PropNumber(),
  /**
   * @locale.zh-CN 关闭子 Dialog 默认继承并渲染父级水印的行为
   * @locale.en Disable the default behavior that child Dialogs inherit and render the parent watermark
   */
  noInherit: PropBoolean(),
  /**
   * @locale.zh-CN 当作为另一个 Watermark 的子元素时复用父级水印实例，避免重复创建
   * @locale.en When nested inside another Watermark, reuse the parent instance to avoid recreating it
   */
  reuse: PropBoolean(),
  /**
   * @locale.zh-CN 允许 Watermark 的属性在挂载后自由更改；该属性本身只能在挂载前设置
   * @locale.en Allow the Watermark props to be mutated freely after mount; this flag itself must be set before mount
   */
  mutable: PropBoolean(),
});

export const watermarkEmits = freeze({});

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkEventProps = GetEventPropsFromEmits<typeof watermarkEmits>;
export type WatermarkEventMap = GetEventMapFromEmits<typeof watermarkEmits>;
export type WatermarkProps = Partial<WatermarkSetupProps> & WatermarkEventProps;
